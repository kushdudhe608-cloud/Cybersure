const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");

// A single scan record. "type" is one of the 9 scanner types.
const SCAN_TYPES = ["website", "email", "whatsapp", "job", "qr", "phone", "login", "screenshot", "document"];

const History = sequelize.define(
  "History",
  {
    type: { type: DataTypes.ENUM(...SCAN_TYPES), allowNull: false },
    input: { type: DataTypes.TEXT, allowNull: false }, // raw text/url/filename that was scanned
    riskScore: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0, max: 100 } },
    status: { type: DataTypes.ENUM("Safe", "Suspicious", "Dangerous"), allowNull: false },
    reasons: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
    details: { type: DataTypes.JSONB, defaultValue: {} }, // full analyzer payload
  },
  {
    tableName: "history",
    indexes: [{ fields: ["userId", "createdAt"] }],
  }
);

User.hasMany(History, { foreignKey: "userId", onDelete: "CASCADE" });
History.belongsTo(User, { foreignKey: "userId" });

module.exports = History;
