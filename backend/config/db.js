const { Sequelize } = require("sequelize");

// Connects to PostgreSQL. Prefer a single DATABASE_URL (what most hosted
// Postgres providers - Neon, Supabase, Railway, etc. - give you), falling
// back to discrete PG* vars for a local install.
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      logging: false,
      dialectOptions:
        process.env.PGSSL === "true" ? { ssl: { require: true, rejectUnauthorized: false } } : {},
    })
  : new Sequelize(process.env.PGDATABASE || "cybersure", process.env.PGUSER || "postgres", process.env.PGPASSWORD || "postgres", {
      host: process.env.PGHOST || "127.0.0.1",
      port: process.env.PGPORT || 5432,
      dialect: "postgres",
      logging: false,
    });

// Connects and (non-destructively) syncs models to the schema so tables
// exist on first run. Exits the process if the connection fails, since the
// API is useless without a DB.
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`PostgreSQL connected: ${sequelize.config.host}/${sequelize.config.database}`);
    await sequelize.sync();
  } catch (error) {
    console.error(`PostgreSQL connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
