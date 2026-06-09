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
  // Bảo hiểm xã hội người lao động đóng (10.5% lương CB)
  BHXH: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },   // 8%  hưu trí & tử tuất
  BHYT: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },   // 1.5% y tế
  BHTN: { type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },   // 1%  thất nghiệp
  ThucLinh: { type: DataTypes.DECIMAL(18, 2) },
}, { tableName: 'BangLuong', timestamps: false });

module.exports = BangLuong;
