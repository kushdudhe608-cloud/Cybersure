const express = require("express");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { protect } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      res.status(400);
      throw new Error("Please fill in all fields");
    }

    if (password !== confirmPassword) {
      res.status(400);
      throw new Error("Passwords do not match");
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(400);
      throw new Error("An account with this email already exists");
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token: generateToken(user.id),
    });
  })
);

// @route   POST /api/auth/login
// @desc    Authenticate user & return token
// @access  Public
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Please provide email and password");
    }

    const user = await User.scope("withPassword").findOne({ where: { email } });
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    res.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token: generateToken(user.id),
    });
  })
);

// @route   GET /api/auth/me
// @desc    Get the logged-in user's profile
// @access  Private
router.get(
  "/me",
  protect,
  asyncHandler(async (req, res) => {
    res.json({ success: true, user: req.user });
  })
);

module.exports = router;
