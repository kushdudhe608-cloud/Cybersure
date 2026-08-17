/**
 * scamAnalyzer.js
 * ----------------
 * Rule-based "AI" engine that powers every checker in AI CyberShield.
 *
 * This is a hackathon prototype: instead of calling a real ML model, each
 * function below inspects the input for well-known scam signals (keywords,
 * structural red flags, formatting issues, etc), assigns weighted points for
 * every signal found, and converts the total into a 0-100 risk score.
 *
 * Every analyzer returns the same shape so the frontend/history model can
 * treat all scan types uniformly:
 *   { riskScore, status, reasons, ...typeSpecificFields }
 */

// ---------- shared helpers ----------

const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));

const statusFromScore = (score) => {
  if (score >= 70) return "Dangerous";
  if (score >= 35) return "Suspicious";
  return "Safe";
};

const URGENCY_WORDS = [
  "urgent",
  "immediately",
  "act now",
  "verify now",
  "within 24 hours",
  "account suspended",
  "final notice",
  "limited time",
  "click here now",
  "expire",
  "act fast",
  "last chance",
];

const LOTTERY_WORDS = ["lottery", "won", "winner", "prize", "congratulations", "lucky draw", "claim your reward"];
const INVESTMENT_WORDS = ["guaranteed returns", "double your money", "crypto investment", "trading bot", "forex profit", "high returns"];
const OTP_WORDS = ["otp", "one time password", "verification code", "share your otp", "confirm your pin"];
const COURIER_WORDS = ["courier", "parcel", "package held", "customs fee", "delivery failed", "shipment"];
const JOB_SCAM_WORDS = ["registration fee", "joining fee", "work from home", "no interview", "earn daily", "easy money", "security deposit"];
const GRAMMAR_MARKERS = ["kindly", "do the needful", "revert back", "please to", "dear valued customer"];
const SUSPICIOUS_URL_KEYWORDS = ["login", "verify", "secure", "update", "bank", "account", "confirm", "signin", "free", "bonus"];
const FREE_HOSTING_DOMAINS = ["weebly.com", "wixsite.com", "blogspot.com", "000webhostapp.com", "glitch.me", "netlify.app", "web.app", "firebaseapp.com"];
const KNOWN_BRANDS = ["paypal", "google", "microsoft", "amazon", "netflix", "apple", "facebook", "instagram", "whatsapp", "sbi", "hdfc", "icici", "axis"];

const countMatches = (text, words) => {
  const lower = text.toLowerCase();
  return words.filter((w) => lower.includes(w));
};

// ---------- 1. Website checker ----------

const checkWebsite = (rawUrl) => {
  const reasons = [];
  let score = 0;
  let url;

  try {
    url = new URL(rawUrl.startsWith("http") ? rawUrl : `http://${rawUrl}`);
  } catch {
    return {
      riskScore: 100,
      status: "Dangerous",
      reasons: ["The URL provided is not a valid, well-formed URL."],
      httpsUsed: false,
      domain: rawUrl,
    };
  }

  const httpsUsed = url.protocol === "https:";
  if (!httpsUsed) {
    score += 25;
    reasons.push("Site does not use HTTPS - data sent to it may be unencrypted.");
  }

  const domain = url.hostname;
  const domainAgeSimulated = simulateDomainAge(domain);
  if (domainAgeSimulated < 90) {
    score += 25;
    reasons.push(`Domain appears to have been registered recently (~${domainAgeSimulated} days ago).`);
  }

  const suspiciousHits = countMatches(url.href, SUSPICIOUS_URL_KEYWORDS);
  if (suspiciousHits.length >= 2) {
    score += 20;
    reasons.push(`URL contains multiple suspicious keywords (${suspiciousHits.slice(0, 3).join(", ")}).`);
  }

  if (FREE_HOSTING_DOMAINS.some((d) => domain.includes(d))) {
    score += 20;
    reasons.push("Site is hosted on a free hosting platform commonly used for phishing pages.");
  }

  const hyphenCount = (domain.match(/-/g) || []).length;
  if (hyphenCount >= 2) {
    score += 10;
    reasons.push("Domain name contains an unusually high number of hyphens.");
  }

  if (/\d{4,}/.test(domain)) {
    score += 10;
    reasons.push("Domain name contains a long numeric sequence, common in auto-generated phishing domains.");
  }

  const impersonated = KNOWN_BRANDS.find((brand) => domain.includes(brand) && !domain.endsWith(`${brand}.com`));
  if (impersonated) {
    score += 30;
    reasons.push(`Domain references the brand "${impersonated}" but is not that brand's official domain.`);
  }

  if (reasons.length === 0) {
    reasons.push("No major red flags detected. HTTPS is active and the domain looks conventional.");
  }

  score = clamp(score);
  return { riskScore: score, status: statusFromScore(score), reasons, httpsUsed, domain };
};

// Deterministic pseudo-random "domain age" derived from the domain string,
// so the same domain always produces the same simulated result.
const simulateDomainAge = (domain) => {
  let hash = 0;
  for (let i = 0; i < domain.length; i++) hash = (hash * 31 + domain.charCodeAt(i)) % 100000;
  return hash % 1500; // 0 - 1499 days
};

// ---------- 2. Email checker ----------

const checkEmail = (emailText) => {
  const reasons = [];
  let score = 0;

  const urgencyHits = countMatches(emailText, URGENCY_WORDS);
  if (urgencyHits.length > 0) {
    score += Math.min(30, urgencyHits.length * 10);
    reasons.push(`Contains urgency-inducing language (${urgencyHits.slice(0, 3).join(", ")}).`);
  }

  const senderMatch = emailText.match(/from:\s*(.+)/i);
  let fakeSender = false;
  if (senderMatch) {
    const sender = senderMatch[1].toLowerCase();
    const brandMentioned = KNOWN_BRANDS.find((b) => emailText.toLowerCase().includes(b));
    if (brandMentioned && !sender.includes(brandMentioned)) {
      fakeSender = true;
      score += 25;
      reasons.push(`Email mentions "${brandMentioned}" but the sender address does not match that domain.`);
    }
  }

  const grammarHits = countMatches(emailText, GRAMMAR_MARKERS);
  if (grammarHits.length > 0) {
    score += 15;
    reasons.push("Contains phrasing patterns commonly seen in poorly-translated phishing emails.");
  }

  const linkCount = (emailText.match(/https?:\/\/\S+/g) || []).length;
  if (linkCount >= 3) {
    score += 15;
    reasons.push(`Contains ${linkCount} links, which is unusually high for a legitimate personal email.`);
  }

  const hasAttachmentMention = /attach(ed|ment)/i.test(emailText) && /\.(exe|zip|scr|js)\b/i.test(emailText);
  if (hasAttachmentMention) {
    score += 20;
    reasons.push("References an executable or compressed attachment - a common malware delivery method.");
  }

  const capsRatio = (emailText.match(/[A-Z]/g) || []).length / Math.max(emailText.length, 1);
  if (capsRatio > 0.3) {
    score += 10;
    reasons.push("Excessive use of capital letters, often used to create false urgency.");
  }

  if (reasons.length === 0) {
    reasons.push("No strong phishing indicators found in this email.");
  }

  score = clamp(score);
  return {
    riskScore: score,
    status: statusFromScore(score),
    reasons,
    spamScore: score,
    urgencyWordsFound: urgencyHits,
    fakeSender,
    grammarIssues: grammarHits.length > 0,
  };
};

// ---------- 3. WhatsApp / message checker ----------

const checkWhatsapp = (message) => {
  const reasons = [];
  let score = 0;
  const categories = [];

  const checks = [
    { label: "Lottery scam", words: LOTTERY_WORDS },
    { label: "Investment scam", words: INVESTMENT_WORDS },
    { label: "OTP scam", words: OTP_WORDS },
    { label: "Courier scam", words: COURIER_WORDS },
    { label: "Job scam", words: JOB_SCAM_WORDS },
  ];

  checks.forEach(({ label, words }) => {
    const hits = countMatches(message, words);
    if (hits.length > 0) {
      score += Math.min(30, hits.length * 15);
      categories.push(label);
      reasons.push(`Matches ${label} pattern (keywords: ${hits.slice(0, 2).join(", ")}).`);
    }
  });

  const urgencyHits = countMatches(message, URGENCY_WORDS);
  if (urgencyHits.length > 0) {
    score += 10;
    reasons.push("Message uses urgency to pressure quick action.");
  }

  const linkCount = (message.match(/https?:\/\/\S+/g) || []).length;
  if (linkCount > 0) {
    score += 10;
    reasons.push("Contains an external link - verify the destination before clicking.");
  }

  if (reasons.length === 0) {
    reasons.push("No known scam pattern detected in this message.");
  }

  score = clamp(score);
  return { riskScore: score, status: statusFromScore(score), reasons, categoriesDetected: categories };
};

// ---------- 4. Job scam checker ----------

const checkJob = (text) => {
  const reasons = [];
  let score = 0;

  const feeHits = countMatches(text, ["registration fee", "joining fee", "security deposit", "processing fee"]);
  if (feeHits.length > 0) {
    score += 35;
    reasons.push("Asks the candidate to pay a fee before joining - legitimate employers never do this.");
  }

  const salaryMatch = text.match(/(?:rs\.?|inr|\$|usd)\s?([\d,]{4,})/i);
  if (salaryMatch) {
    const value = parseInt(salaryMatch[1].replace(/,/g, ""), 10);
    if (value > 150000) {
      score += 20;
      reasons.push("Advertises an unusually high salary for what appears to be an entry-level role.");
    }
  }

  const noInterviewHits = countMatches(text, ["no interview", "instant offer", "direct joining"]);
  if (noInterviewHits.length > 0) {
    score += 20;
    reasons.push("Offers a job without any interview process.");
  }

  const freeEmailDomains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"];
  const emailMatch = text.match(/[\w.-]+@([\w.-]+)/);
  if (emailMatch && freeEmailDomains.includes(emailMatch[1].toLowerCase())) {
    score += 15;
    reasons.push("HR contact uses a free personal email domain instead of a company domain.");
  }

  const urgencyHits = countMatches(text, URGENCY_WORDS);
  if (urgencyHits.length > 0) {
    score += 10;
    reasons.push("Uses urgency to rush the candidate's decision.");
  }

  if (reasons.length === 0) {
    reasons.push("No common job-scam indicators detected.");
  }

  score = clamp(score);
  return { riskScore: score, status: statusFromScore(score), reasons };
};

// ---------- 5. QR checker ----------
// In a real system a QR decoding library (e.g. jsQR) would run against the
// uploaded image server-side. Here we accept an already-decoded URL (the
// frontend can use jsQR client-side) and re-use the website analyzer.

const checkQR = (decodedUrl) => {
  const websiteResult = checkWebsite(decodedUrl);
  return { ...websiteResult, decodedUrl };
};

// ---------- 6. Phone checker ----------

const COUNTRY_CODES = {
  "+91": "India",
  "+1": "USA/Canada",
  "+44": "United Kingdom",
  "+61": "Australia",
  "+971": "UAE",
  "+234": "Nigeria",
  "+63": "Philippines",
};

const checkPhone = (rawNumber) => {
  const reasons = [];
  let score = 0;
  const cleaned = rawNumber.replace(/[\s-]/g, "");

  if (!/^\+?\d{7,15}$/.test(cleaned)) {
    return {
      riskScore: 60,
      status: "Suspicious",
      reasons: ["Number format looks invalid or incomplete."],
      country: "Unknown",
    };
  }

  const countryCode = Object.keys(COUNTRY_CODES).find((code) => cleaned.startsWith(code));
  const country = countryCode ? COUNTRY_CODES[countryCode] : "Unknown / Unrecognized code";

  if (!countryCode) {
    score += 20;
    reasons.push("Country code could not be identified.");
  }

  // Deterministic pseudo-random "spam reports" derived from the digits
  let hash = 0;
  for (const ch of cleaned) hash = (hash * 31 + ch.charCodeAt(0)) % 1000;
  const simulatedReports = hash % 50;

  if (simulatedReports > 30) {
    score += 50;
    reasons.push(`Number has been reported by other users ${simulatedReports} times as spam/scam.`);
  } else if (simulatedReports > 10) {
    score += 25;
    reasons.push(`Number has a moderate number of spam reports (${simulatedReports}).`);
  } else {
    reasons.push("No significant spam reports found for this number.");
  }

  const repeatingDigits = /(\d)\1{4,}/.test(cleaned);
  if (repeatingDigits) {
    score += 15;
    reasons.push("Number contains an unusual repeating digit pattern, common in spoofed numbers.");
  }

  score = clamp(score);
  return { riskScore: score, status: statusFromScore(score), reasons, country, simulatedReports };
};

// ---------- 7. Fake login page checker ----------

const checkLoginPage = (rawUrl) => {
  const base = checkWebsite(rawUrl);
  const reasons = [...base.reasons];
  let score = base.riskScore;
  let brandImpersonation = null;

  const domain = base.domain.toLowerCase();
  const impersonated = KNOWN_BRANDS.find((brand) => domain.includes(brand));
  if (impersonated && !domain.endsWith(`${impersonated}.com`)) {
    brandImpersonation = impersonated;
    score = clamp(score + 25);
    reasons.push(`Page mimics the login design/branding of "${impersonated}" on a non-official domain.`);
  }

  if (!base.httpsUsed) {
    reasons.push("A login form served without HTTPS should never be trusted with real credentials.");
  }

  return { riskScore: score, status: statusFromScore(score), reasons, brandImpersonation, domain: base.domain };
};

// ---------- 8. Screenshot checker ----------
// Simulated: in production this would run OCR + a vision model. Here we
// generate a believable, deterministic-ish result based on the filename/size.

const checkScreenshot = (filename = "screenshot.png", fileSizeKb = 200) => {
  const reasons = [];
  let hash = 0;
  for (const ch of filename) hash = (hash * 31 + ch.charCodeAt(0)) % 1000;
  let score = hash % 100;

  const suspiciousAreas = [];
  if (score > 60) {
    suspiciousAreas.push("Login form region", "Address bar overlay");
    reasons.push("Detected a login form styled to imitate a known brand.");
    reasons.push("Address bar in the screenshot does not match the claimed brand's real domain.");
  }
  if (score > 40) {
    suspiciousAreas.push("Urgency banner");
    reasons.push("Detected an urgency banner (e.g. countdown timer or warning message).");
  }
  if (fileSizeKb < 50) {
    score = clamp(score + 10);
    reasons.push("Unusually small file size can indicate a heavily compressed, quickly-made phishing capture.");
  }
  if (reasons.length === 0) {
    reasons.push("No visually suspicious regions were detected in this screenshot.");
  }

  score = clamp(score);
  return { riskScore: score, status: statusFromScore(score), reasons, suspiciousAreas };
};

// ---------- 9. Document checker ----------

const checkDocument = (filename = "document.pdf", fileSizeKb = 200) => {
  const reasons = [];
  let hash = 0;
  for (const ch of filename) hash = (hash * 17 + ch.charCodeAt(0)) % 1000;
  let score = hash % 100;

  const ext = (filename.split(".").pop() || "").toLowerCase();
  const flags = { fakeLogo: false, edited: false };

  if (score > 55) {
    flags.fakeLogo = true;
    reasons.push("Logo/letterhead resolution is inconsistent with the rest of the document, suggesting it was pasted in.");
  }
  if (score > 35) {
    flags.edited = true;
    reasons.push("Metadata suggests the document was edited after its original creation date.");
  }
  if (!["pdf", "docx", "doc", "png", "jpg", "jpeg"].includes(ext)) {
    score = clamp(score + 20);
    reasons.push(`Unexpected file type ".${ext}" for a document of this kind.`);
  }
  if (fileSizeKb > 5000) {
    score = clamp(score + 5);
    reasons.push("File size is unusually large for a simple offer/certificate document.");
  }
  if (reasons.length === 0) {
    reasons.push("No tampering indicators were detected in this document.");
  }

  score = clamp(score);
  return { riskScore: score, status: statusFromScore(score), reasons, flags };
};

module.exports = {
  checkWebsite,
  checkEmail,
  checkWhatsapp,
  checkJob,
  checkQR,
  checkPhone,
  checkLoginPage,
  checkScreenshot,
  checkDocument,
};
