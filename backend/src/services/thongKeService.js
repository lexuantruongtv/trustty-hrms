const { sequelize, DuAn, NhanVien, PhongBan, BangLuong, PhanCong, BienDongLuong, ChiPhiHoatDong } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

// Tổng chi phí & doanh thu dự án đã hoàn thành/bàn giao
const getThongKeDuAn = async ({ nam } = {}) => {
  const where = { TrangThai: { [Op.in]: ['Hoàn thành'] } };
  if (nam) where[Op.and] = [sequelize.where(fn('YEAR', col('NgayKT')), nam)];

  const duAns = await DuAn.findAll({
    where,
    attributes: ['MaDOAN', 'TenDA', 'TrangThai', 'NgayBD', 'NgayKT', 'ChiPhiDuKien', 'ChiPhiThucTe', 'DoanhThu', 'TienDo'],
    include: [{
      model: NhanVien, as: 'nhanViens', attributes: ['MaNV1', 'TenNV'],
      through: { attributes: ['VaiTro'] },
    }],
  });

  const result = duAns.map((da) => {
    const chiPhiDuKien = parseFloat(da.ChiPhiDuKien || 0);
    const chiPhiThucTe = parseFloat(da.ChiPhiThucTe || 0);
    const doanhThu = parseFloat(da.DoanhThu || 0);
    const loiNhuan = doanhThu - chiPhiThucTe;
    return {
      MaDOAN: da.MaDOAN,
      TenDA: da.TenDA,
      TrangThai: da.TrangThai,
      NgayBD: da.NgayBD,
      NgayKT: da.NgayKT,
      ChiPhiDuKien: chiPhiDuKien,
      ChiPhiThucTe: chiPhiThucTe,
      DoanhThu: doanhThu,
      LoiNhuan: loiNhuan,
      ChenhLech: chiPhiDuKien - chiPhiThucTe,
      TienDo: da.TienDo,
      SoNhanVien: da.nhanViens?.length || 0,
    };
  });

  const tongChiPhiDuKien = result.reduce((s, d) => s + d.ChiPhiDuKien, 0);
  const tongChiPhiThucTe = result.reduce((s, d) => s + d.ChiPhiThucTe, 0);
  const tongDoanhThu = result.reduce((s, d) => s + d.DoanhThu, 0);
  const tongLoiNhuan = tongDoanhThu - tongChiPhiThucTe;

  return { items: result, tongChiPhiDuKien, tongChiPhiThucTe, tongChenhLech: tongChiPhiDuKien - tongChiPhiThucTe, tongDoanhThu, tongLoiNhuan };
};

// Bảng thanh toán lương toàn công ty theo tháng/năm
const getBangLuongCongTy = async ({ thang, nam }) => {
  const now = new Date();
  const t = thang || now.getMonth() + 1;
  const n = nam || now.getFullYear();

  const rows = await BangLuong.findAll({
    where: { Thang: t, Nam: n },
    include: [{
      model: NhanVien, as: 'nhanVien',
      attributes: ['TenNV', 'MaPB'],
      include: [{ model: PhongBan, as: 'phongBan', attributes: ['TenPB'] }],
    }],
    order: [['nhanVien', 'MaPB', 'ASC']],
  });

  const BH_RATE = 0.105; // 10.5% lương cơ bản (BHXH 8% + BHYT 1.5% + BHTN 1%)

  const items = rows.map((bl) => {
    const luongCB = parseFloat(bl.LuongCB || 0);
    const phiBH = parseFloat((luongCB * BH_RATE).toFixed(2));
    const thucLinh = parseFloat(bl.ThucLinh || 0);
    return {
      MaBL: bl.MaBL,
      MaNV1: bl.MaNV1,
      TenNV: bl.nhanVien?.TenNV,
      TenPB: bl.nhanVien?.phongBan?.TenPB,
      LuongCB: luongCB,
      PhuCap: parseFloat(bl.PhuCap || 0),
      ThueTNCN: parseFloat(bl.ThueTNCN || 0),
      PhiBH: phiBH,
      ThucLinh: parseFloat((thucLinh - phiBH).toFixed(2)),
    };
  });

  const tongLuongCB = items.reduce((s, r) => s + r.LuongCB, 0);
  const tongPhuCap = items.reduce((s, r) => s + r.PhuCap, 0);
  const tongThue = items.reduce((s, r) => s + r.ThueTNCN, 0);
  const tongPhiBH = items.reduce((s, r) => s + r.PhiBH, 0);
  const tongThucLinh = items.reduce((s, r) => s + r.ThucLinh, 0);

  return { thang: t, nam: n, items, tongLuongCB, tongPhuCap, tongThue, tongPhiBH, tongThucLinh };
};

// Chi phí nhân sự theo phòng ban (lương + biến động)
const getChiPhiTheoPhongBan = async ({ nam }) => {
  const n = nam || new Date().getFullYear();

  const rows = await BangLuong.findAll({
    where: { Nam: n },
    attributes: ['MaNV1', [fn('SUM', col('ThucLinh')), 'tongLuong']],
    include: [{
      model: NhanVien, as: 'nhanVien',
      attributes: ['MaPB'],
      include: [{ model: PhongBan, as: 'phongBan', attributes: ['TenPB'] }],
    }],
    group: ['MaNV1', 'nhanVien.MaPB', 'nhanVien->phongBan.MaPB', 'nhanVien->phongBan.TenPB'],
    raw: true,
  });

  // Gom nhóm theo phòng ban
  const pbMap = {};
  rows.forEach((r) => {
    const tenPB = r['nhanVien->phongBan.TenPB'] || 'Không xác định';
    if (!pbMap[tenPB]) pbMap[tenPB] = { TenPB: tenPB, tongLuong: 0, soNV: 0 };
    pbMap[tenPB].tongLuong += parseFloat(r.tongLuong || 0);
    pbMap[tenPB].soNV += 1;
  });

  return Object.values(pbMap).sort((a, b) => b.tongLuong - a.tongLuong);
};

// Chi phí nhân sự theo dự án (ước tính theo số NV x lương TB)
const getChiPhiTheoDuAn = async ({ nam }) => {
  const n = nam || new Date().getFullYear();

  const duAns = await DuAn.findAll({
    attributes: ['MaDOAN', 'TenDA', 'TrangThai', 'ChiPhiDuKien', 'ChiPhiThucTe'],
    include: [{
      model: NhanVien, as: 'nhanViens',
      attributes: ['MaNV1'],
      through: { attributes: [] },
      include: [{
        model: BangLuong, as: 'bangLuongs',
        attributes: [[fn('SUM', col('ThucLinh')), 'tongLuong']],
        where: { Nam: n },
        required: false,
      }],
    }],
  });

  return duAns.map((da) => {
    const chiPhiNhanSu = da.nhanViens.reduce((sum, nv) => {
      const luong = parseFloat(nv.bangLuongs?.[0]?.dataValues?.tongLuong || 0);
      return sum + luong;
    }, 0);
    return {
      MaDOAN: da.MaDOAN,
      TenDA: da.TenDA,
      TrangThai: da.TrangThai,
      ChiPhiDuKien: parseFloat(da.ChiPhiDuKien || 0),
      ChiPhiThucTe: parseFloat(da.ChiPhiThucTe || 0),
      ChiPhiNhanSu: chiPhiNhanSu,
      SoNhanVien: da.nhanViens.length,
    };
  });
};

module.exports = { getThongKeDuAn, getBangLuongCongTy, getChiPhiTheoPhongBan, getChiPhiTheoDuAn };

// Thống kê chênh lệch: doanh thu cộng dồn cả năm, chi phí trừ dần từng tháng → số dư tích lũy
const getChenhLech = async ({ nam } = {}) => {
  const n = parseInt(nam) || new Date().getFullYear();
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Tổng doanh thu cả năm (từ dự án hoàn thành trong năm)
  const tongDoanhThuNam = parseFloat(await DuAn.sum('DoanhThu', {
    where: {
      [Op.and]: [
        sequelize.where(fn('YEAR', col('NgayKT')), n),
        { TrangThai: 'Hoàn thành' },
      ],
    },
  }) || 0);

  // Chi phí và doanh thu từng tháng
  const monthlyData = await Promise.all(months.map(async (thang) => {
    const chiPhiDuAn = parseFloat(await DuAn.sum('ChiPhiThucTe', {
      where: {
        [Op.and]: [
          sequelize.where(fn('MONTH', col('NgayKT')), thang),
          sequelize.where(fn('YEAR', col('NgayKT')), n),
          { TrangThai: 'Hoàn thành' },
        ],
      },
    }) || 0);
    const doanhThuThang = parseFloat(await DuAn.sum('DoanhThu', {
      where: {
        [Op.and]: [
          sequelize.where(fn('MONTH', col('NgayKT')), thang),
          sequelize.where(fn('YEAR', col('NgayKT')), n),
          { TrangThai: 'Hoàn thành' },
        ],
      },
    }) || 0);
    const tongLuong = parseFloat(await BangLuong.sum('ThucLinh', { where: { Thang: thang, Nam: n } }) || 0);
    const chiPhiHD = parseFloat(await ChiPhiHoatDong.sum('SoTien', { where: { Thang: thang, Nam: n } }) || 0);
    return { thang, chiPhiDuAn, doanhThuThang, tongLuong, chiPhiHD, tongChiPhi: chiPhiDuAn + tongLuong + chiPhiHD };
  }));

  // Tính số dư tích lũy: mỗi tháng = số dư trước + doanh thu tháng - chi phí tháng
  let soDu = 0;
  const items = monthlyData
    .filter((r) => r.tongChiPhi > 0 || r.doanhThuThang > 0)
    .map((r) => {
      soDu += r.doanhThuThang - r.tongChiPhi;
      return {
        thang: r.thang,
        nam: n,
        chiPhiDuAn: r.chiPhiDuAn,
        doanhThuThang: r.doanhThuThang,
        tongLuong: r.tongLuong,
        chiPhiHD: r.chiPhiHD,
        tongChiPhi: r.tongChiPhi,
        soDuTichLuy: soDu,
      };
    });

  const tongChiPhi = items.reduce((s, r) => s + r.tongChiPhi, 0);
  const ketQua = tongDoanhThuNam - tongChiPhi;

  return { items, tongDoanhThuNam, tongChiPhi, ketQua, thuaLo: ketQua < 0, nam: n };
};

// CRUD chi phí hoạt động
const getChiPhiHoatDong = async ({ thang, nam }) => {
  const where = {};
  if (thang) where.Thang = thang;
  if (nam) where.Nam = nam;
  return ChiPhiHoatDong.findAll({ where, order: [['Nam', 'DESC'], ['Thang', 'DESC']] });
};

const createChiPhiHoatDong = async (data) => ChiPhiHoatDong.create(data);
const deleteChiPhiHoatDong = async (id) => {
  const cp = await ChiPhiHoatDong.findByPk(id);
  if (!cp) throw { status: 404, message: 'Không tìm thấy' };
  await cp.destroy();
};

module.exports = { getThongKeDuAn, getBangLuongCongTy, getChiPhiTheoPhongBan, getChiPhiTheoDuAn, getChenhLech, getChiPhiHoatDong, createChiPhiHoatDong, deleteChiPhiHoatDong };
