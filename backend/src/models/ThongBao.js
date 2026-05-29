const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ThongBao = sequelize.define('ThongBao', {
  MaTB: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  MaNV1: { type: DataTypes.CHAR(20) },
  TieuDe: { type: DataTypes.STRING(200) },
  NoiDung: { type: DataTypes.TEXT },
  DaDoc: { type: DataTypes.BOOLEAN, defaultValue: false },
  NgayTao: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'ThongBao', timestamps: false });

module.exports = ThongBao;
