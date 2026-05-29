const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PhanCong = sequelize.define('PhanCong', {
  MaNV1: { type: DataTypes.CHAR(20), primaryKey: true },
  MaDOAN: { type: DataTypes.CHAR(20), primaryKey: true },
  VaiTro: { type: DataTypes.STRING(50) },
  ThoiGianTG: { type: DataTypes.DATEONLY },
}, { tableName: 'PhanCong', timestamps: false });

module.exports = PhanCong;
