const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");
const { sequelize } = require("../config/db");

const User = sequelize.define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: "Name is required" } },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: { msg: "Please enter a valid email" } },
      set(value) {
        this.setDataValue("email", typeof value === "string" ? value.trim().toLowerCase() : value);
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: { args: [6, 200], msg: "Password must be at least 6 characters" } },
    },
    role: { type: DataTypes.ENUM("user", "admin"), defaultValue: "user" },
    totalScans: { type: DataTypes.INTEGER, defaultValue: 0 },
    scamReports: { type: DataTypes.INTEGER, defaultValue: 0 },
    avatar: { type: DataTypes.STRING, defaultValue: "" },
  },
  {
    tableName: "users",
    // Mirrors Mongoose's `select: false` on password - hidden unless the
    // "withPassword" scope is explicitly requested (used only at login).
    defaultScope: { attributes: { exclude: ["password"] } },
    scopes: { withPassword: { attributes: {} } },
    hooks: {
      // Fires on both create and update, like Mongoose's pre("save").
      beforeSave: async (user) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

// Compare entered password with hashed password
User.prototype.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;
