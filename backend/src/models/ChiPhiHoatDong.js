const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChiPhiHoatDong = sequelize.define('ChiPhiHoatDong', {
  MaCPHD: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Thang: { type: DataTypes.INTEGER },
  Nam: { type: DataTypes.INTEGER },
  LoaiChiPhi: { type: DataTypes.STRING(100) }, // Thuê VP, Điện nước, Thiết bị,...
  SoTien: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
  GhiChu: { type: DataTypes.STRING(255) },
}, { tableName: 'ChiPhiHoatDong', timestamps: false });

module.exports = ChiPhiHoatDong;
