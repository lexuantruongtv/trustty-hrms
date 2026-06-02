const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DuAn = sequelize.define('DuAn', {
  MaDOAN: { type: DataTypes.CHAR(20), primaryKey: true },
  TenDA: { type: DataTypes.STRING(100) },
  MoTa: { type: DataTypes.TEXT },
  TrangThai: { type: DataTypes.STRING(50), defaultValue: 'Đang thực hiện' },
  NgayBD: { type: DataTypes.DATEONLY },
  NgayKT: { type: DataTypes.DATEONLY },
  ChiPhiDuKien: { type: DataTypes.DECIMAL(18, 2) },
  ChiPhiThucTe: { type: DataTypes.DECIMAL(18, 2) },
  TienDo: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'DuAn', timestamps: false });

module.exports = DuAn;
