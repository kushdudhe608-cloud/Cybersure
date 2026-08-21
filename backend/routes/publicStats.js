const express = require("express");
const asyncHandler = require("express-async-handler");
const { sequelize } = require("../config/db");
const History = require("../models/History");

const router = express.Router();

// @route   GET /api/stats
// @desc    Public, unauthenticated platform stats for the homepage hero
//          (no user data - just aggregate counts so anyone visiting can see
//          real, live numbers instead of a hardcoded "40+").
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const [totalScans, signalsRow] = await Promise.all([
      History.count(),
      // Sum the length of every scan's "reasons" array across the whole table -
      // i.e. every individual risk signal CyberSure has ever flagged.
      History.findOne({
        attributes: [[sequelize.fn("COALESCE", sequelize.fn("SUM", sequelize.fn("CARDINALITY", sequelize.col("reasons"))), 0), "signalCount"]],
        raw: true,
      }),
    ]);

    res.json({
      success: true,
      totalScans,
      signalsAnalyzed: Number(signalsRow?.signalCount || 0),
    });
  })
);

module.exports = router;