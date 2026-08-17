const express = require("express");
const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");
const { sequelize } = require("../config/db");
const { protect } = require("../middleware/auth");
const History = require("../models/History");

const router = express.Router();

// @route   GET /api/history?page=1&limit=10&type=website&status=Safe&search=xyz
// @desc    Paginated, filterable scan history for the logged-in user
router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const where = { userId: req.user.id };

    if (req.query.type) where.type = req.query.type;
    if (req.query.status) where.status = req.query.status;
    if (req.query.search) where.input = { [Op.iLike]: `%${req.query.search}%` };

    const { rows: items, count: total } = await History.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      offset: (page - 1) * limit,
      limit,
    });

    res.json({
      success: true,
      items,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
    });
  })
);

// @route   GET /api/history/dashboard
// @desc    Aggregated stats for the Dashboard page (today's counts, breakdown, recent activity)
router.get(
  "/dashboard",
  protect,
  asyncHandler(async (req, res) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const [todayCount, safeCount, suspiciousCount, dangerousCount, recent, byTypeRows] = await Promise.all([
      History.count({ where: { userId: req.user.id, createdAt: { [Op.gte]: startOfDay } } }),
      History.count({ where: { userId: req.user.id, status: "Safe" } }),
      History.count({ where: { userId: req.user.id, status: "Suspicious" } }),
      History.count({ where: { userId: req.user.id, status: "Dangerous" } }),
      History.findAll({ where: { userId: req.user.id }, order: [["createdAt", "DESC"]], limit: 6 }),
      History.findAll({
        where: { userId: req.user.id },
        attributes: ["type", [sequelize.fn("COUNT", sequelize.col("type")), "count"]],
        group: ["type"],
        raw: true,
      }),
    ]);

    const byType = byTypeRows.map((r) => ({ _id: r.type, count: Number(r.count) }));

    res.json({
      success: true,
      todayScans: todayCount,
      safe: safeCount,
      suspicious: suspiciousCount,
      dangerous: dangerousCount,
      recentActivity: recent,
      byType,
    });
  })
);

module.exports = router;
