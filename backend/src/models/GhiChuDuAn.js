const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GhiChuDuAn = sequelize.define('GhiChuDuAn', {
  MaGC: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  MaDOAN: { type: DataTypes.CHAR(20), allowNull: false },
  MaNV1: { type: DataTypes.CHAR(20), allowNull: false },
  NoiDung: { type: DataTypes.TEXT, allowNull: false },
  NgayTao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'GhiChuDuAn', timestamps: false });

module.exports = GhiChuDuAn;
