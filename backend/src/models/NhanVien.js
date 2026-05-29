const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NhanVien = sequelize.define('NhanVien', {
  MaNV1: { type: DataTypes.CHAR(20), primaryKey: true },
  TenNV: { type: DataTypes.STRING(100) },
  NgaySinh: { type: DataTypes.DATEONLY },
  DiaChi: { type: DataTypes.STRING(255) },
  SoCCCD: { type: DataTypes.CHAR(12) },
  Email: { type: DataTypes.CHAR(100) },
  SDT: { type: DataTypes.CHAR(15) },
  TrangThai: { type: DataTypes.STRING(50), defaultValue: 'Đang làm việc' },
  SoTaiKhoanNN: { type: DataTypes.CHAR(20) },
  MaCV: { type: DataTypes.CHAR(10) },
  MaPB: { type: DataTypes.CHAR(10) },
  Avatar: { type: DataTypes.STRING(255) },
}, { tableName: 'NhanVien', timestamps: false });

module.exports = NhanVien;
