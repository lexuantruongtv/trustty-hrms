const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HopDong = sequelize.define('HopDong', {
  SoHD: { type: DataTypes.CHAR(50), primaryKey: true },
  MaNV1: { type: DataTypes.CHAR(20) },
  LoaiHD: { type: DataTypes.STRING(100) },
  NgayKy: { type: DataTypes.DATEONLY },
  NgayHH: { type: DataTypes.DATEONLY },
}, { tableName: 'HopDong', timestamps: false });

module.exports = HopDong;
