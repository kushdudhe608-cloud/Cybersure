const { Sequelize } = require("sequelize");

// Connects to PostgreSQL. Prefer a single DATABASE_URL (what most hosted
// Postgres providers - Neon, Supabase, Railway, etc. - give you), falling
// back to discrete PG* vars for a local install.
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      logging: false,
      dialectOptions: {
        ...(process.env.PGSSL === "true" ? { ssl: { require: true, rejectUnauthorized: false } } : {}),
        connectTimeout: 15000, // fail fast instead of hanging indefinitely if the DB is unreachable
      },
      retry: { max: 3 },
    })
  : new Sequelize(process.env.PGDATABASE || "cybersure", process.env.PGUSER || "postgres", process.env.PGPASSWORD || "postgres", {
      host: process.env.PGHOST || "127.0.0.1",
      port: process.env.PGPORT || 5432,
      dialect: "postgres",
      logging: false,
      dialectOptions: { connectTimeout: 15000 },
    });

// Connects and (non-destructively) syncs models to the schema so tables
// exist on first run. Logs and re-throws on failure rather than killing the
// process - server.js already binds the port before calling this, so a DB
// outage should degrade (API routes that need the DB will error) rather
// than take the whole server down.
const connectDB = async () => {
  await sequelize.authenticate();
  console.log(`PostgreSQL connected: ${sequelize.config.host}/${sequelize.config.database}`);
  await sequelize.sync();
};

module.exports = { sequelize, connectDB };