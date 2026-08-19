const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const User = require("./User");
const History = require("./History");

// A user-submitted scam report (e.g. "report this as a scam")
const Report = sequelize.define(
  "Report",
  {
    scamType: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    status: { type: DataTypes.ENUM("Pending", "Reviewed", "Confirmed"), defaultValue: "Pending" },
  },
  { tableName: "reports" }
);

User.hasMany(Report, { foreignKey: "userId", onDelete: "CASCADE" });
Report.belongsTo(User, { foreignKey: "userId" });

History.hasMany(Report, { foreignKey: "historyId", onDelete: "SET NULL" });
Report.belongsTo(History, { foreignKey: "historyId" });

module.exports = Report;
