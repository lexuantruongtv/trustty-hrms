const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TaiKhoan = sequelize.define('TaiKhoan', {
  TenTaiKhoan: { type: DataTypes.CHAR(50), primaryKey: true },
  MaNV1: { type: DataTypes.CHAR(20) },
  MatKhau: { type: DataTypes.CHAR(255) },
  // Admin | HR | Manager | Employee
  PhanQuyen: { type: DataTypes.STRING(50), defaultValue: 'Employee' },
}, { tableName: 'TaiKhoan', timestamps: false });

module.exports = TaiKhoan;
