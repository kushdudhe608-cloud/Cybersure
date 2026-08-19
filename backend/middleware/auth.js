const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

// Protects routes: requires a valid Bearer token in the Authorization header
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findByPk(decoded.id); // password excluded by the model's defaultScope
      if (!req.user) {
        res.status(401);
        throw new Error("User not found");
      }
      return next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token invalid or expired");
    }
  }

  res.status(401);
  throw new Error("Not authorized, no token provided");
});

// Restricts a route to admin users only. Must run after `protect`.
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  res.status(403);
  throw new Error("Not authorized as an admin");
};

module.exports = { protect, adminOnly };
