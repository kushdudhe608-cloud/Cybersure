/**
 * Seed script - populates the database with a demo admin, a demo user,
 * and a handful of sample scan history records so the Dashboard,
 * Scan History, and Admin Panel pages have something to show immediately.
 *
 * Run with: npm run seed
 */
require("dotenv").config();
const { sequelize, connectDB } = require("../config/db");
const User = require("../models/User");
const History = require("../models/History");
require("../models/Report"); // registers the Report <-> User/History associations

const run = async () => {
  await connectDB();

  console.log("Resetting database schema...");
  await sequelize.sync({ force: true }); // drops & recreates tables - fine for a seed script

  console.log("Creating demo users...");
  const admin = await User.create({
    name: "Admin User",
    email: "admin@cybersure.io",
    password: "admin123",
    role: "admin",
  });

  const demoUser = await User.create({
    name: "Demo Student",
    email: "demo@cybersure.io",
    password: "demo1234",
    role: "user",
  });

  console.log("Creating sample scan history...");
  const samples = [
    { type: "website", input: "http://paypa1-secure-login.com", riskScore: 92, status: "Dangerous", reasons: ["No HTTPS", "Recently registered domain", "Brand impersonation"] },
    { type: "email", input: "Subject: Your account will be suspended...", riskScore: 78, status: "Dangerous", reasons: ["Urgency language", "Fake sender domain"] },
    { type: "whatsapp", input: "Congratulations! You won a lottery of $10,000...", riskScore: 88, status: "Dangerous", reasons: ["Lottery scam pattern"] },
    { type: "website", input: "https://github.com", riskScore: 5, status: "Safe", reasons: ["HTTPS active", "Well-established domain"] },
    { type: "job", input: "HR offering job with Rs.2000 registration fee", riskScore: 81, status: "Dangerous", reasons: ["Joining fee requested"] },
    { type: "phone", input: "+91 9999999999", riskScore: 40, status: "Suspicious", reasons: ["Moderate spam reports"] },
    { type: "email", input: "Team meeting notes attached", riskScore: 8, status: "Safe", reasons: ["No phishing indicators found"] },
      { type: "website", input: "http://secure-hdfc-verify.net", riskScore: 95, status: "Dangerous", reasons: ["Brand impersonation", "No HTTPS"] },
     ];

  for (const sample of samples) {
    await History.create({ ...sample, userId: demoUser.id });
  }
  await demoUser.update({
    totalScans: samples.length,
    scamReports: samples.filter((s) => s.status === "Dangerous").length,
  });

  console.log("Seed complete!");
  console.log("Admin login: admin@cybersure.io / admin123");
  console.log("Demo login:  demo@cybersure.io / demo1234");

  await sequelize.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
