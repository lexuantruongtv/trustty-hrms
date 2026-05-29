const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PhongBan = sequelize.define('PhongBan', {
  MaPB: { type: DataTypes.CHAR(10), primaryKey: true },
  TenPB: { type: DataTypes.STRING(100) },
  MoTa: { type: DataTypes.TEXT },
}, { tableName: 'PhongBan', timestamps: false });

module.exports = PhongBan;
