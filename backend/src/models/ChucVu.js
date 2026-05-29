const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChucVu = sequelize.define('ChucVu', {
  MaCV: { type: DataTypes.CHAR(10), primaryKey: true },
  TenCV: { type: DataTypes.STRING(100) },
  CapBac: { type: DataTypes.INTEGER },
}, { tableName: 'ChucVu', timestamps: false });

module.exports = ChucVu;
