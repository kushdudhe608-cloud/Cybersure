const express = require("express");
const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");
const { sequelize } = require("../config/db");
const { protect, adminOnly } = require("../middleware/auth");
const User = require("../models/User");
const History = require("../models/History");
const Report = require("../models/Report");

const router = express.Router();

router.use(protect, adminOnly);

// @route   GET /api/admin/stats
// @desc    Platform-wide statistics for the Admin Panel
router.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [totalUsers, totalScans, todayScans, byTypeRows, latestReports] = await Promise.all([
      User.count(),
      History.count(),
      History.count({ where: { createdAt: { [Op.gte]: startOfDay } } }),
      History.findAll({
        attributes: ["type", [sequelize.fn("COUNT", sequelize.col("type")), "count"]],
        group: ["type"],
        order: [[sequelize.literal("count"), "DESC"]],
        raw: true,
      }),
      Report.findAll({
        order: [["createdAt", "DESC"]],
        limit: 10,
        include: [{ model: User, attributes: ["name", "email"] }],
      }),
    ]);

    const byType = byTypeRows.map((r) => ({ _id: r.type, count: Number(r.count) }));
    const mostCommonScam = byType[0] ? byType[0]._id : "N/A";

    res.json({
      success: true,
      totalUsers,
      totalScans,
      todayScans,
      mostCommonScam,
      byType,
      latestReports,
    });
  })
);

// @route   GET /api/admin/users
router.get(
  "/users",
  asyncHandler(async (req, res) => {
    const users = await User.findAll({ order: [["createdAt", "DESC"]] });
    res.json({ success: true, users });
  })
);

module.exports = router;
