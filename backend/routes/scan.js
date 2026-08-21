const express = require("express");
const multer = require("multer");
const asyncHandler = require("express-async-handler");
const { protect } = require("../middleware/auth");
const History = require("../models/History");
const User = require("../models/User");
const analyzer = require("../utils/scamAnalyzer");

const router = express.Router();

// Files are kept in memory only - this is a prototype, nothing is persisted to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

// Saves a scan result to history and bumps the user's counters
const saveHistory = async (userId, type, input, result) => {
  const entry = await History.create({
    userId,
    type,
    input,
    riskScore: result.riskScore,
    status: result.status,
    reasons: result.reasons,
    details: result,
  });

  const increments = { totalScans: 1 };
  if (result.status === "Dangerous") increments.scamReports = 1;
  await User.increment(increments, { where: { id: userId } });

  return entry;
};

// Small wrapper so every route follows: validate -> analyze -> store -> respond
const handleCheck = (type, extractInput, runAnalyzer) =>
  asyncHandler(async (req, res) => {
    const input = extractInput(req);
    if (!input) {
      res.status(400);
      throw new Error("Missing required input for this scan");
    }

    const result = runAnalyzer(req, input);
    const inputLabel = typeof input === "string" ? input : input.originalname || "uploaded file";
    const saved = await saveHistory(req.user.id, type, inputLabel, result);

    res.json({ success: true, result, historyId: saved.id });
  });

// @route   POST /api/checkWebsite   { url }
router.post(
  "/checkWebsite",
  protect,
  handleCheck(
    "website",
    (req) => req.body.url,
    (req, url) => analyzer.checkWebsite(url)
  )
);

// @route   POST /api/checkEmail   { emailText }
router.post(
  "/checkEmail",
  protect,
  handleCheck(
    "email",
    (req) => req.body.emailText,
    (req, text) => analyzer.checkEmail(text)
  )
);

// @route   POST /api/checkWhatsapp   { message }
router.post(
  "/checkWhatsapp",
  protect,
  handleCheck(
    "whatsapp",
    (req) => req.body.message,
    (req, message) => analyzer.checkWhatsapp(message)
  )
);

// @route   POST /api/checkJob   { text } OR multipart file "document"
router.post(
  "/checkJob",
  protect,
  upload.single("document"),
  handleCheck(
    "job",
    (req) => req.body.text || (req.file ? req.file.originalname : null),
    (req, text) => analyzer.checkJob(req.body.text || `Uploaded file: ${req.file.originalname}`)
  )
);

// @route   POST /api/checkQR   multipart file "qr" OR { decodedUrl }
// Note: QR decoding happens client-side with jsQR; this endpoint expects the
// already-decoded URL string so the same website-analysis logic can be reused.
router.post(
  "/checkQR",
  protect,
  handleCheck(
    "qr",
    (req) => req.body.decodedUrl,
    (req, url) => analyzer.checkQR(url)
  )
);

// @route   POST /api/checkPhone   { phoneNumber }
router.post(
  "/checkPhone",
  protect,
  handleCheck(
    "phone",
    (req) => req.body.phoneNumber,
    (req, number) => analyzer.checkPhone(number)
  )
);

// @route   POST /api/checkScreenshot   multipart file "screenshot"
router.post(
  "/checkScreenshot",
  protect,
  upload.single("screenshot"),
  handleCheck(
    "screenshot",
    (req) => req.file,
    (req, file) => analyzer.checkScreenshot(file.originalname, file.size / 1024)
  )
);

// @route   POST /api/checkDocument   multipart file "document"
router.post(
  "/checkDocument",
  protect,
  upload.single("document"),
  handleCheck(
    "document",
    (req) => req.file,
    (req, file) => analyzer.checkDocument(file.originalname, file.size / 1024)
  )
);

module.exports = router;
