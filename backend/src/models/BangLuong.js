const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BangLuong = sequelize.define('BangLuong', {
  MaBL: { type: DataTypes.CHAR(20), primaryKey: true },
  MaNV1: { type: DataTypes.CHAR(20) },
  Thang: { type: DataTypes.INTEGER },
  Nam: { type: DataTypes.INTEGER },
  LuongCB: { type: DataTypes.DECIMAL(18, 2) },
  PhuCap: { type: DataTypes.DECIMAL(18, 2) },
  ThueTNCN: { type: DataTypes.DECIMAL(18, 2) },
  ThucLinh: { type: DataTypes.DECIMAL(18, 2) },
}, { tableName: 'BangLuong', timestamps: false });

module.exports = BangLuong;
