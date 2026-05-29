const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BaoHiem = sequelize.define('BaoHiem', {
  MaBH: { type: DataTypes.CHAR(20), primaryKey: true },
  MaNV1: { type: DataTypes.CHAR(20) },
  TenBH: { type: DataTypes.STRING(100) },
  NgayHetHan: { type: DataTypes.DATEONLY },
}, { tableName: 'BaoHiem', timestamps: false });

module.exports = BaoHiem;
