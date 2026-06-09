const sequelize = require('../config/database');
const PhongBan = require('./PhongBan');
const ChucVu = require('./ChucVu');
const NhanVien = require('./NhanVien');
const TaiKhoan = require('./TaiKhoan');
const DuAn = require('./DuAn');
const PhanCong = require('./PhanCong');
const ChamCong = require('./ChamCong');
const NghiPhep = require('./NghiPhep');
const BangLuong = require('./BangLuong');
const BienDongLuong = require('./BienDongLuong');
const BaoHiem = require('./BaoHiem');
const HopDong = require('./HopDong');
const TrinhDo = require('./TrinhDo');
const ThongBao = require('./ThongBao');
const GhiChuDuAn = require('./GhiChuDuAn');
const ChiPhiHoatDong = require('./ChiPhiHoatDong');

// PhongBan <-> NhanVien
PhongBan.hasMany(NhanVien, { foreignKey: 'MaPB', as: 'nhanViens' });
NhanVien.belongsTo(PhongBan, { foreignKey: 'MaPB', as: 'phongBan' });

// ChucVu <-> NhanVien
ChucVu.hasMany(NhanVien, { foreignKey: 'MaCV', as: 'nhanViens' });
NhanVien.belongsTo(ChucVu, { foreignKey: 'MaCV', as: 'chucVu' });

// TaiKhoan <-> NhanVien (1-1)
NhanVien.hasOne(TaiKhoan, { foreignKey: 'MaNV1', as: 'taiKhoan' });
TaiKhoan.belongsTo(NhanVien, { foreignKey: 'MaNV1', as: 'nhanVien' });

// NhanVien <-> DuAn (N-N through PhanCong)
NhanVien.belongsToMany(DuAn, { through: PhanCong, foreignKey: 'MaNV1', as: 'duAns' });
DuAn.belongsToMany(NhanVien, { through: PhanCong, foreignKey: 'MaDOAN', as: 'nhanViens' });
PhanCong.belongsTo(NhanVien, { foreignKey: 'MaNV1', as: 'nhanVien' });
PhanCong.belongsTo(DuAn, { foreignKey: 'MaDOAN', as: 'duAn' });

// NhanVien -> ChamCong
NhanVien.hasMany(ChamCong, { foreignKey: 'MaNV1', as: 'chamCongs' });
ChamCong.belongsTo(NhanVien, { foreignKey: 'MaNV1', as: 'nhanVien' });

// NhanVien -> NghiPhep
NhanVien.hasMany(NghiPhep, { foreignKey: 'MaNV1', as: 'nghiPheps' });
NghiPhep.belongsTo(NhanVien, { foreignKey: 'MaNV1', as: 'nhanVien' });

// NhanVien -> BangLuong
NhanVien.hasMany(BangLuong, { foreignKey: 'MaNV1', as: 'bangLuongs' });
BangLuong.belongsTo(NhanVien, { foreignKey: 'MaNV1', as: 'nhanVien' });

// NhanVien -> BienDongLuong
NhanVien.hasMany(BienDongLuong, { foreignKey: 'MaNV1', as: 'bienDongLuongs' });
BienDongLuong.belongsTo(NhanVien, { foreignKey: 'MaNV1', as: 'nhanVien' });

// NhanVien -> BaoHiem
NhanVien.hasMany(BaoHiem, { foreignKey: 'MaNV1', as: 'baoHiems' });
BaoHiem.belongsTo(NhanVien, { foreignKey: 'MaNV1', as: 'nhanVien' });

// NhanVien -> HopDong
NhanVien.hasMany(HopDong, { foreignKey: 'MaNV1', as: 'hopDongs' });
HopDong.belongsTo(NhanVien, { foreignKey: 'MaNV1', as: 'nhanVien' });

// NhanVien -> TrinhDo
NhanVien.hasMany(TrinhDo, { foreignKey: 'MaNV1', as: 'trinhDos' });
TrinhDo.belongsTo(NhanVien, { foreignKey: 'MaNV1', as: 'nhanVien' });

// NhanVien -> ThongBao
NhanVien.hasMany(ThongBao, { foreignKey: 'MaNV1', as: 'thongBaos' });
ThongBao.belongsTo(NhanVien, { foreignKey: 'MaNV1', as: 'nhanVien' });

// DuAn -> GhiChuDuAn, NhanVien -> GhiChuDuAn
DuAn.hasMany(GhiChuDuAn, { foreignKey: 'MaDOAN', as: 'ghiChus' });
GhiChuDuAn.belongsTo(DuAn, { foreignKey: 'MaDOAN', as: 'duAn' });
NhanVien.hasMany(GhiChuDuAn, { foreignKey: 'MaNV1', as: 'ghiChus' });
GhiChuDuAn.belongsTo(NhanVien, { foreignKey: 'MaNV1', as: 'nhanVien' });

module.exports = {
  sequelize,
  PhongBan,
  ChucVu,
  NhanVien,
  TaiKhoan,
  DuAn,
  PhanCong,
  ChamCong,
  NghiPhep,
  BangLuong,
  BienDongLuong,
  BaoHiem,
  HopDong,
  TrinhDo,
  ThongBao,
  GhiChuDuAn,
  ChiPhiHoatDong,
};
