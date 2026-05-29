const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ChamCong = sequelize.define('ChamCong', {
  MaCC: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  MaNV1: { type: DataTypes.CHAR(20) },
  Ngay: { type: DataTypes.DATEONLY },
  GioVao: { type: DataTypes.TIME },
  GioRa: { type: DataTypes.TIME },
  SoGioLam: { type: DataTypes.FLOAT },
}, { tableName: 'ChamCong', timestamps: false });

module.exports = ChamCong;
