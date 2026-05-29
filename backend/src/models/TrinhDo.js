const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TrinhDo = sequelize.define('TrinhDo', {
  MaTD: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  MaNV1: { type: DataTypes.CHAR(20) },
  TenBangCap: { type: DataTypes.STRING(100) },
  ChuyenNganh: { type: DataTypes.STRING(100) },
  NoiDaoTao: { type: DataTypes.STRING(150) },
  NamHoanThanh: { type: DataTypes.INTEGER },
}, { tableName: 'TrinhDo', timestamps: false });

module.exports = TrinhDo;
