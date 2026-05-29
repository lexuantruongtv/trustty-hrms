const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NghiPhep = sequelize.define('NghiPhep', {
  MaDon: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  MaNV1: { type: DataTypes.CHAR(20) },
  NgayBD: { type: DataTypes.DATEONLY },
  NgayKT: { type: DataTypes.DATEONLY },
  LyDo: { type: DataTypes.STRING(255) },
  // Chờ duyệt | Đã duyệt | Từ chối
  TrangThai: { type: DataTypes.STRING(50), defaultValue: 'Chờ duyệt' },
}, { tableName: 'NghiPhep', timestamps: false });

module.exports = NghiPhep;
