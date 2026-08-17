const jwt = require("jsonwebtoken");

// Signs a JWT containing the user's id, expiring per JWT_EXPIRES_IN in .env
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

module.exports = generateToken;
