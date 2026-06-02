const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BienDongLuong = sequelize.define('BienDongLuong', {
  MaBD: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  MaNV1: { type: DataTypes.CHAR(20) },
  HinhThuc: { type: DataTypes.STRING(100) },
  NoiDung: { type: DataTypes.STRING(255) },
  GiaTien: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0 },
  NgayQuyetDinh: { type: DataTypes.DATEONLY },
}, { tableName: 'BienDongLuong', timestamps: false });

module.exports = BienDongLuong;
