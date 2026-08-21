require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const { connectDB } = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth");
const scanRoutes = require("./routes/scan");
const historyRoutes = require("./routes/history");
const adminRoutes = require("./routes/admin");
const publicStatsRoutes = require("./routes/publicStats");

const app = express();

// --- Middleware ---
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

// Every API response carries user-specific data (or none at all), so make sure
// browsers/CDNs never cache and reuse a response across different logged-in
// users on the same device - without this, a GET to e.g. /api/history/dashboard
// could be served from cache to a different user later.
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// --- Health check ---
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "CyberSure API is running", timestamp: new Date().toISOString() });
});

// --- API routes ---
app.use("/api/auth", authRoutes);
app.use("/api", scanRoutes); // /api/checkWebsite, /api/checkEmail, etc.
app.use("/api/history", historyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stats", publicStatsRoutes);

// --- Optionally serve the vanilla HTML/CSS/JS frontend from this same server ---
// If a sibling ../frontend folder exists, serve it as static files and fall back
// to index.html for any non-/api route so the SPA's client-side router works.
const frontendDir = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendDir));
app.get(/^\/(?!api).*/, (req, res, next) => {
  res.sendFile(path.join(frontendDir, "index.html"), (err) => {
    if (err) next();
  });
});

// --- Error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// IMPORTANT: bind the port first, then connect to the database in the
// background. If connectDB() were awaited before app.listen() and the DB
// connection ever hung (slow network, misconfigured SSL, etc.), the server
// would never open a port at all - which is exactly what caused Render's
// deploy to fail with "no open ports detected" after a 15-minute timeout.
// Binding first means Render always sees the service come up immediately;
// API routes that need the DB will simply fail until connectDB() finishes.
app.listen(PORT, () => console.log(`CyberSure API listening on port ${PORT}`));

connectDB().catch((err) => {
  console.error("Database connection failed:", err.message);
});