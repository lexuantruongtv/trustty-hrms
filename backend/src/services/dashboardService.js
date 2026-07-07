const { sequelize, NhanVien, PhongBan, NghiPhep, BangLuong, DuAn, ChamCong, PhanCong, HopDong } = require('../models');
const { Op } = require('sequelize');

const getLatestLuong = async (whereExtra = {}) => {
  const now = new Date();
  const thang = now.getMonth() + 1;
  const nam = now.getFullYear();
  let tongLuong = await BangLuong.sum('ThucLinh', { where: { Thang: thang, Nam: nam, ...whereExtra } });
  let luongThang = thang, luongNam = nam;
  if (!tongLuong) {
    const latest = await BangLuong.findOne({
      where: whereExtra,
      order: [['Nam', 'DESC'], ['Thang', 'DESC']],
      attributes: ['Thang', 'Nam'],
    });
    if (latest) {
      tongLuong = await BangLuong.sum('ThucLinh', {
        where: { Thang: latest.Thang, Nam: latest.Nam, ...whereExtra },
      });
      luongThang = latest.Thang;
      luongNam = latest.Nam;
    }
  }
  return { tongLuong: tongLuong || 0, luongThang, luongNam };
};

/* Lương 6 tháng gần nhất (cho biểu đồ line) */
const getLuong6Thang = async (whereExtra = {}) => {
  const now = new Date();
  const results = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const t = d.getMonth() + 1;
    const n = d.getFullYear();
    const val = await BangLuong.sum('ThucLinh', { where: { Thang: t, Nam: n, ...whereExtra } });
    results.push({ thang: t, nam: n, tongLuong: val || 0 });
  }
  return results;
};

const getStats = async (user) => {
  const now = new Date();
  const thang = now.getMonth() + 1;
  const nam = now.getFullYear();
  const today = now.toISOString().split('T')[0];
  const role = user?.PhanQuyen;
  const MaNV1 = user?.MaNV1;

  // ── EMPLOYEE ──────────────────────────────────────────────────────────────
  if (role === 'Employee') {
    const [chamCong, nghiPhep, luongInfo, luong6Thang] = await Promise.all([
      ChamCong.count({ where: { MaNV1, Ngay: today } }),
      NghiPhep.count({ where: { MaNV1, TrangThai: 'Chờ duyệt' } }),
      getLatestLuong({ MaNV1 }),
      getLuong6Thang({ MaNV1 }),
    ]);

    // Dự án đang tham gia
    const duAnDangThamGia = await PhanCong.count({
      where: { MaNV1 },
      include: [{ model: DuAn, as: 'duAn', where: { TrangThai: 'Đang thực hiện' }, attributes: [] }],
    }).catch(() => 0);

    const lichSuNghiPhep = await NghiPhep.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('NgayBD')), 'thang'],
        [sequelize.fn('COUNT', sequelize.col('MaDon')), 'soLuong'],
      ],
      where: { MaNV1, NgayBD: { [Op.gte]: new Date(nam, thang - 7, 1) } },
      group: [sequelize.fn('MONTH', sequelize.col('NgayBD'))],
      raw: true,
    });

    // Chấm công 7 ngày gần nhất
    const chamCong7Ngay = await ChamCong.findAll({
      where: {
        MaNV1,
        Ngay: { [Op.gte]: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6) },
      },
      attributes: ['Ngay', 'SoGioLam'],
      order: [['Ngay', 'ASC']],
      raw: true,
    });

    return {
      role,
      chamCongHomNay: chamCong,
      nghiPhepChoduyet: nghiPhep,
      duAnDangThamGia,
      ...luongInfo,
      luong6Thang,
      nghiPhep6Thang: lichSuNghiPhep,
      chamCong7Ngay,
    };
  }

  // ── MANAGER ───────────────────────────────────────────────────────────────
  if (role === 'Manager') {
    const nv = await NhanVien.findOne({ where: { MaNV1 }, attributes: ['MaPB'] });
    const MaPB = nv?.MaPB;
    const nvTrongPhong = await NhanVien.findAll({
      where: { MaPB, TrangThai: 'Đang làm việc' },
      attributes: ['MaNV1'],
    });
    const maNVList = nvTrongPhong.map((n) => n.MaNV1);

    const [tongNV, tongDA, nghiPhepChoduyet, chamCongHomNay] = await Promise.all([
      Promise.resolve(maNVList.length),
      PhanCong.count({
        where: { MaNV1: { [Op.in]: maNVList } },
        include: [{ model: DuAn, as: 'duAn', where: { TrangThai: 'Đang thực hiện' }, attributes: [] }],
        distinct: true,
        col: 'MaDOAN',
      }).catch(() => DuAn.count({ where: { TrangThai: 'Đang thực hiện' } })),
      NghiPhep.count({ where: { MaNV1: { [Op.in]: maNVList }, TrangThai: 'Chờ duyệt' } }),
      ChamCong.count({ where: { MaNV1: { [Op.in]: maNVList }, Ngay: today } }),
    ]);

    // Dự án đang thực hiện có nhân viên phòng này
    const duAnDangChay = await DuAn.findAll({
      where: { TrangThai: 'Đang thực hiện' },
      attributes: ['MaDOAN', 'TenDA', 'TienDo', 'NgayKT'],
      limit: 5,
      raw: true,
    }).catch(() => []);
    
    const nghiPhep6Thang = await NghiPhep.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('NgayBD')), 'thang'],
        [sequelize.fn('COUNT', sequelize.col('MaDon')), 'soLuong'],
      ],
      where: {
        MaNV1: { [Op.in]: maNVList },
        NgayBD: { [Op.gte]: new Date(nam, thang - 7, 1) },
      },
      group: [sequelize.fn('MONTH', sequelize.col('NgayBD'))],
      raw: true,
    });

    // Nghỉ phép chờ duyệt chi tiết (tối đa 5)
    const nghiPhepChiTiet = await NghiPhep.findAll({
      where: { MaNV1: { [Op.in]: maNVList }, TrangThai: 'Chờ duyệt' },
      include: [{ model: NhanVien, as: 'nhanVien', attributes: ['TenNV'] }],
      order: [['NgayBD', 'ASC']],
      limit: 5,
    }).catch(() => []);

    return {
      role, tongNV, tongDA, nghiPhepChoduyet, chamCongHomNay,
      duAnDangChay,
      nvTheoPB: [{ TenPB: nv?.MaPB || 'Phòng ban', soNV: tongNV }],
      nghiPhep6Thang,
      nghiPhepChiTiet: nghiPhepChiTiet.map((n) => ({
        MaDon: n.MaDon,
        TenNV: n.nhanVien?.TenNV || '—',
        NgayBD: n.NgayBD,
        NgayKT: n.NgayKT,
        LyDo: n.LyDo,
      })),
    };
  }

  // ── ADMIN / HR ─────────────────────────────────────────────────────────────
  const [tongNV, tongPB, tongDA, nghiPhepChoduyet, chamCongHomNay] = await Promise.all([
    NhanVien.count({ where: { TrangThai: 'Đang làm việc' } }),
    PhongBan.count(),
    DuAn.count({ where: { TrangThai: 'Đang thực hiện' } }),
    NghiPhep.count({ where: { TrangThai: 'Chờ duyệt' } }),
    ChamCong.count({ where: { Ngay: today } }),
  ]);

  const luongInfo = await getLatestLuong();
  const luong6Thang = await getLuong6Thang();

  const nvTheoPB = await PhongBan.findAll({
    attributes: ['TenPB', [sequelize.fn('COUNT', sequelize.col('nhanViens.MaNV1')), 'soNV']],
    include: [{ model: NhanVien, as: 'nhanViens', attributes: [], where: { TrangThai: 'Đang làm việc' }, required: false }],
    group: ['PhongBan.MaPB', 'PhongBan.TenPB'],
    raw: true,
  });

  const nghiPhep6Thang = await NghiPhep.findAll({
    attributes: [
      [sequelize.fn('MONTH', sequelize.col('NgayBD')), 'thang'],
      [sequelize.fn('COUNT', sequelize.col('MaDon')), 'soLuong'],
    ],
    where: { NgayBD: { [Op.gte]: new Date(nam, thang - 7, 1) } },
    group: [sequelize.fn('MONTH', sequelize.col('NgayBD'))],
    raw: true,
  });

  // Dự án đang chạy (tối đa 5 dự án, kèm tiến độ)
  const duAnDangChay = await DuAn.findAll({
    where: { TrangThai: 'Đang thực hiện' },
    attributes: ['MaDOAN', 'TenDA', 'TienDo', 'NgayKT', 'ChiPhiDuKien', 'ChiPhiThucTe'],
    order: [['NgayKT', 'ASC']],
    limit: 5,
    raw: true,
  });

  // Hợp đồng đã/sắp hết hạn: quá hạn hoặc còn ≤ 30 ngày
  const next30 = new Date();
  next30.setDate(next30.getDate() + 30);
// Lấy tất cả hợp đồng mới -> cũ
const tatCaHopDong = await HopDong.findAll({
  include: [{
    model: NhanVien,
    as: 'nhanVien',
    attributes: ['TenNV', 'MaPB'],
  }],
  order: [
    ['MaNV1', 'ASC'],
    ['NgayKy', 'DESC'],   // Hợp đồng mới nhất đứng trước
  ],
});

// Chỉ giữ hợp đồng mới nhất của mỗi nhân viên
const latestContracts = [];
const daXuLy = new Set();

for (const hd of tatCaHopDong) {
  if (!daXuLy.has(hd.MaNV1)) {
    daXuLy.add(hd.MaNV1);
    latestContracts.push(hd);
  }
}

// Chỉ lấy hợp đồng mới nhất nhưng sắp hết hạn
const hopDongSapHH = latestContracts
  .filter(hd => new Date(hd.NgayHH) <= next30)
  .sort((a, b) => new Date(a.NgayHH) - new Date(b.NgayHH))
  .slice(0, 8);

  // Nhân viên mới trong tháng (đếm qua HopDong NgayKy tháng này)
  const nvMoiThang = await HopDong.count({
    where: {
      NgayKy: {
        [Op.between]: [
          `${nam}-${String(thang).padStart(2, '0')}-01`,
          today,
        ],
      },
    },
  }).catch(() => 0);

  return {
    role,
    tongNV, tongPB, tongDA, nghiPhepChoduyet, chamCongHomNay,
    nvMoiThang,
    ...luongInfo,
    luong6Thang,
    nvTheoPB,
    nghiPhep6Thang,
    duAnDangChay,
    hopDongSapHH: hopDongSapHH.map((h) => ({
      SoHD: h.SoHD,
      TenNV: h.nhanVien?.TenNV || '—',
      MaPB: h.nhanVien?.MaPB || '—',
      NgayHH: h.NgayHH,
      LoaiHD: h.LoaiHD,
    })),
  };
};

module.exports = { getStats };
