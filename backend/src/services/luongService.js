const { BangLuong, NhanVien, BienDongLuong, ChucVu, PhongBan, DuAn, PhanCong } = require('../models');
const { sequelize } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const { getPagination, getPagingData } = require('../utils/pagination');

const getAll = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};
  if (query.MaNV1) where.MaNV1 = query.MaNV1;
  if (query.Thang) where.Thang = query.Thang;
  if (query.Nam) where.Nam = query.Nam;

  const includeWhere = {};
  if (query.search) includeWhere.TenNV = { [Op.like]: `%${query.search}%` };

  const data = await BangLuong.findAndCountAll({
    where, limit, offset,
    include: [{
      model: NhanVien, as: 'nhanVien',
      attributes: ['MaNV1', 'TenNV', 'Avatar', 'MaPB', 'MaCV', 'Email', 'SDT', 'SoTaiKhoanNN'],
      where: Object.keys(includeWhere).length ? includeWhere : undefined,
      required: Object.keys(includeWhere).length > 0,
      include: [
        { model: ChucVu, as: 'chucVu', attributes: ['TenCV'] },
        { model: PhongBan, as: 'phongBan', attributes: ['TenPB'] },
      ],
    }],
    order: [['Nam', 'DESC'], ['Thang', 'DESC']],
  });

  // Tính SUM biến động lương cho từng bản ghi
  const rows = await Promise.all(data.rows.map(async (bl) => {
    const dauThang  = `${bl.Nam}-${String(bl.Thang).padStart(2, '0')}-01`;
    const cuoiThang = `${bl.Nam}-${String(bl.Thang).padStart(2, '0')}-${String(new Date(bl.Nam, bl.Thang, 0).getDate()).padStart(2, '0')}`;
    const result = await BienDongLuong.findOne({
      where: {
        MaNV1: bl.MaNV1,
        NgayQuyetDinh: { [Op.between]: [dauThang, cuoiThang] },
      },
      attributes: [[fn('COALESCE', fn('SUM', col('GiaTien')), 0), 'TongBienDong']],
      group: ['MaNV1'],
      raw: true,
    });
    return { ...bl.toJSON(), TongBienDong: parseFloat(result?.TongBienDong ?? 0) };
  }));

  return { ...getPagingData(data, page, limit), items: rows };
};

/**
 * Tính lương tự động cho nhân viên theo tháng
 * Khấu trừ:
 *   - Thuế TNCN  : 10%   lương cơ bản
 *   - BHXH       : 8%    lương cơ bản (hưu trí & tử tuất)
 *   - BHYT       : 1.5%  lương cơ bản (bảo hiểm y tế)
 *   - BHTN       : 1%    lương cơ bản (bảo hiểm thất nghiệp)
 * Công thức: ThucLinh = LuongCB + PhuCap - ThueTNCN - BHXH - BHYT - BHTN
 */
const tinhLuong = async ({ MaNV1, Thang, Nam, LuongCB, PhuCap }) => {
  const MaBL = `BL${MaNV1}${Nam}${String(Thang).padStart(2, '0')}`;
  const ThueTNCN = parseFloat((LuongCB * 0.10).toFixed(2));
  const BHXH     = parseFloat((LuongCB * 0.08).toFixed(2));
  const BHYT     = parseFloat((LuongCB * 0.015).toFixed(2));
  const BHTN     = parseFloat((LuongCB * 0.01).toFixed(2));
  const ThucLinh = parseFloat((LuongCB + PhuCap - ThueTNCN - BHXH - BHYT - BHTN).toFixed(2));

  const [bl, created] = await BangLuong.findOrCreate({
    where: { MaBL },
    defaults: { MaNV1, Thang, Nam, LuongCB, PhuCap, ThueTNCN, BHXH, BHYT, BHTN, ThucLinh },
  });
  if (!created) await bl.update({ LuongCB, PhuCap, ThueTNCN, BHXH, BHYT, BHTN, ThucLinh });
  return bl;
};

const remove = async (id) => {
  const bl = await BangLuong.findByPk(id);
  if (!bl) throw { status: 404, message: 'Không tìm thấy bảng lương' };
  await bl.destroy();
};

/**
 * Tự động tính lương hàng tháng:
 * - Lấy tất cả dự án đang hoạt động trong tháng (NgayBD <= cuối tháng && NgayKT >= đầu tháng)
 * - Gom nhân viên tham gia các dự án đó + Giám đốc (CV001)
 * - Tạo bảng lương nếu chưa tồn tại
 */
const LUONG_THEO_CV = {
  CV001: { luongCB: 50000000, phuCap: 10000000 }, // Giám Đốc
  CV002: { luongCB: 30000000, phuCap:  5000000 }, // Trưởng Phòng (Kỹ Thuật)
  CV007: { luongCB: 28000000, phuCap:  4000000 }, // Quản Lý
  CV005: { luongCB: 25000000, phuCap:  4000000 }, // Senior Developer
  CV003: { luongCB: 18000000, phuCap:  2000000 }, // Nhân Viên (Kỹ Thuật)
  CV006: { luongCB: 14000000, phuCap:  1500000 }, // Junior Developer
  CV004: { luongCB:  8000000, phuCap:   500000 }, // Thực Tập Sinh
};

// Thang lương riêng cho nhân viên hành chính (phòng khác Kỹ Thuật)
const LUONG_HANH_CHINH = {
  CV002: { luongCB: 20000000, phuCap: 3000000 }, // Trưởng Phòng HC
  CV003: { luongCB: 12000000, phuCap: 1500000 }, // Nhân Viên HC
};

const autoTinhLuongThang = async ({ thang, nam }) => {
  const t = parseInt(thang);
  const n = parseInt(nam);
  if (!t || !n) throw { status: 400, message: 'Thiếu tháng hoặc năm' };

  const dauThang = `${n}-${String(t).padStart(2, '0')}-01`;
  // Tính ngày cuối tháng chính xác (tránh ngày không hợp lệ như 06-31)
  const cuoiThangDate = new Date(n, t, 0); // ngày 0 của tháng t+1 = ngày cuối tháng t
  const cuoiThang = `${n}-${String(t).padStart(2, '0')}-${String(cuoiThangDate.getDate()).padStart(2, '0')}`;

  // 1. Dự án có timeline giao với tháng (không lọc TrangThai — tính theo thực tế thời gian chạy)
  const duAns = await DuAn.findAll({
    where: {
      NgayBD: { [Op.lte]: cuoiThang },
      NgayKT: { [Op.gte]: dauThang },
    },
    attributes: ['MaDOAN', 'TenDA'],
  });

  if (duAns.length === 0) {
    // Không có dự án nhưng vẫn tính lương cố định cho phòng khác Kỹ Thuật + Giám đốc
    const nvCoDinh = await NhanVien.findAll({
      where: {
        [Op.or]: [
          { MaCV: 'CV001' },
          { MaPB: { [Op.ne]: 'PB002' }, MaCV: { [Op.ne]: 'CV001' } },
        ],
        TrangThai: 'Đang làm việc',
      },
      attributes: ['MaNV1', 'TenNV', 'MaCV'],
    });

    if (nvCoDinh.length === 0) {
      return { created: 0, skipped: 0, message: `Tháng ${t}/${n} không có dự án nào đang thực hiện, bỏ qua.`, details: [], duAns: [] };
    }

    let created = 0, skipped = 0;
    const details = [];
    for (const nv of nvCoDinh) {
      // Giám đốc dùng thang lương chung, phòng khác KT dùng thang HC
      const isHanhChinh = nv.MaCV !== 'CV001';
      const config = isHanhChinh
        ? (LUONG_HANH_CHINH[nv.MaCV] || LUONG_THEO_CV[nv.MaCV])
        : LUONG_THEO_CV[nv.MaCV];
      if (!config) { skipped++; continue; }
      const { luongCB, phuCap } = config;
      const thueTNCN = parseFloat((luongCB * 0.10 ).toFixed(2));
      const bhxh     = parseFloat((luongCB * 0.08 ).toFixed(2));
      const bhyt     = parseFloat((luongCB * 0.015).toFixed(2));
      const bhtn     = parseFloat((luongCB * 0.01 ).toFixed(2));
      const thucLinh = parseFloat((luongCB + phuCap - thueTNCN - bhxh - bhyt - bhtn).toFixed(2));
      const MaBL     = `BL${nv.MaNV1}${n}${String(t).padStart(2, '0')}`;
      const [, wasCreated] = await BangLuong.findOrCreate({
        where: { MaBL },
        defaults: { MaBL, MaNV1: nv.MaNV1, Thang: t, Nam: n, LuongCB: luongCB, PhuCap: phuCap, ThueTNCN: thueTNCN, BHXH: bhxh, BHYT: bhyt, BHTN: bhtn, ThucLinh: thucLinh },
      });
      if (wasCreated) { details.push({ MaNV1: nv.MaNV1, TenNV: nv.TenNV, status: 'created', ThucLinh: thucLinh }); created++; }
      else { details.push({ MaNV1: nv.MaNV1, TenNV: nv.TenNV, status: 'exists' }); skipped++; }
    }
    return {
      created, skipped,
      message: created > 0
        ? `Tháng ${t}/${n}: đã tạo ${created} bảng lương cố định mới${skipped > 0 ? `, bỏ qua ${skipped} đã có.` : '.'}`
        : `Tháng ${t}/${n}: tất cả ${skipped} nhân viên đã có bảng lương từ trước, không cần tạo mới.`,
      duAns: [],
      details,
    };
  }

  // 2. Nhân viên tham gia dự án + Giám đốc
  const maDoanList = duAns.map((d) => d.MaDOAN);
  const phanCongs = await PhanCong.findAll({
    where: { MaDOAN: { [Op.in]: maDoanList } },
    attributes: ['MaNV1'],
  });
  const maNVSet = new Set(phanCongs.map((p) => p.MaNV1));

  const giamDocs = await NhanVien.findAll({
    where: { MaCV: 'CV001', TrangThai: 'Đang làm việc' },
    attributes: ['MaNV1'],
  });
  giamDocs.forEach((gd) => maNVSet.add(gd.MaNV1));

  // 2b. Nhân viên phòng khác Kỹ Thuật (lương cố định hàng tháng, không phụ thuộc dự án)
  const nvPhongKhac = await NhanVien.findAll({
    where: { MaPB: { [Op.ne]: 'PB002' }, MaCV: { [Op.ne]: 'CV001' }, TrangThai: 'Đang làm việc' },
    attributes: ['MaNV1'],
  });
  nvPhongKhac.forEach((nv) => maNVSet.add(nv.MaNV1));

  // 3. Lấy thông tin chức vụ
  const nhanViens = await NhanVien.findAll({
    where: { MaNV1: { [Op.in]: [...maNVSet] }, TrangThai: 'Đang làm việc' },
    attributes: ['MaNV1', 'TenNV', 'MaCV', 'MaPB'],
  });

  // Set MaNV1 thuộc phòng khác KT để tra thang lương HC
  const maNVPhongKhac = new Set(nvPhongKhac.map((nv) => nv.MaNV1));

  let created = 0, skipped = 0;
  const details = [];

  for (const nv of nhanViens) {
    // Phòng khác KT (trừ Giám đốc) dùng thang lương HC
    const isHanhChinh = maNVPhongKhac.has(nv.MaNV1);
    const config = isHanhChinh
      ? (LUONG_HANH_CHINH[nv.MaCV] || LUONG_THEO_CV[nv.MaCV])
      : LUONG_THEO_CV[nv.MaCV];

    if (!config) {
      details.push({ MaNV1: nv.MaNV1, TenNV: nv.TenNV, status: 'skip', reason: `Không có cấu hình lương cho chức vụ ${nv.MaCV}` });
      skipped++;
      continue;
    }

    const { luongCB, phuCap } = config;
    const thueTNCN = parseFloat((luongCB * 0.10 ).toFixed(2));
    const bhxh     = parseFloat((luongCB * 0.08 ).toFixed(2));
    const bhyt     = parseFloat((luongCB * 0.015).toFixed(2));
    const bhtn     = parseFloat((luongCB * 0.01 ).toFixed(2));
    const thucLinh = parseFloat((luongCB + phuCap - thueTNCN - bhxh - bhyt - bhtn).toFixed(2));
    const MaBL     = `BL${nv.MaNV1}${n}${String(t).padStart(2, '0')}`;

    const [, wasCreated] = await BangLuong.findOrCreate({
      where: { MaBL },
      defaults: { MaBL, MaNV1: nv.MaNV1, Thang: t, Nam: n, LuongCB: luongCB, PhuCap: phuCap, ThueTNCN: thueTNCN, BHXH: bhxh, BHYT: bhyt, BHTN: bhtn, ThucLinh: thucLinh },
    });

    if (wasCreated) {
      details.push({ MaNV1: nv.MaNV1, TenNV: nv.TenNV, status: 'created', ThucLinh: thucLinh });
      created++;
    } else {
      details.push({ MaNV1: nv.MaNV1, TenNV: nv.TenNV, status: 'exists' });
      skipped++;
    }
  }

  return {
    created,
    skipped,
    message: created > 0
      ? `Tháng ${t}/${n}: đã tạo ${created} bảng lương mới${skipped > 0 ? `, bỏ qua ${skipped} đã có.` : '.'}`
      : `Tháng ${t}/${n}: tất cả ${skipped} nhân viên đã có bảng lương từ trước, không cần tạo mới.`,
    duAns: duAns.map((d) => d.TenDA),
    details,
  };
};

module.exports = { getAll, tinhLuong, remove, autoTinhLuongThang };
