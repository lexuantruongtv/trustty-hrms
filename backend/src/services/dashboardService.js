const { sequelize, NhanVien, PhongBan, NghiPhep, BangLuong, DuAn, ChamCong, PhanCong } = require('../models');
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
      tongLuong = await BangLuong.sum('ThucLinh', { where: { Thang: latest.Thang, Nam: latest.Nam, ...whereExtra } });
      luongThang = latest.Thang;
      luongNam = latest.Nam;
    }
  }
  return { tongLuong: tongLuong || 0, luongThang, luongNam };
};

const getStats = async (user) => {
  const now = new Date();
  const thang = now.getMonth() + 1;
  const nam = now.getFullYear();
  const today = now.toISOString().split('T')[0];
  const role = user?.PhanQuyen;
  const MaNV1 = user?.MaNV1;

  // === EMPLOYEE ===
  if (role === 'Employee') {
    const [chamCong, nghiPhep, luongInfo] = await Promise.all([
      ChamCong.count({ where: { MaNV1, Ngay: today } }),
      NghiPhep.count({ where: { MaNV1, TrangThai: 'Chờ duyệt' } }),
      getLatestLuong({ MaNV1 }),
    ]);
    const lichSuNghiPhep = await NghiPhep.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('NgayBD')), 'thang'],
        [sequelize.fn('COUNT', sequelize.col('MaDon')), 'soLuong'],
      ],
      where: { MaNV1, NgayBD: { [Op.gte]: new Date(nam, thang - 7, 1) } },
      group: [sequelize.fn('MONTH', sequelize.col('NgayBD'))],
      raw: true,
    });
    return {
      role,
      chamCongHomNay: chamCong,
      nghiPhepChoduyet: nghiPhep,
      ...luongInfo,
      nghiPhep6Thang: lichSuNghiPhep,
    };
  }

  // === MANAGER ===
  if (role === 'Manager') {
    const nv = await NhanVien.findOne({ where: { MaNV1 }, attributes: ['MaPB'] });
    const MaPB = nv?.MaPB;
    const nvTrongPhong = await NhanVien.findAll({ where: { MaPB, TrangThai: 'Đang làm việc' }, attributes: ['MaNV1'] });
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

    const nvTheoPB = [{ TenPB: nv?.MaPB || 'Phòng ban', soNV: tongNV }];
    const nghiPhep6Thang = await NghiPhep.findAll({
      attributes: [
        [sequelize.fn('MONTH', sequelize.col('NgayBD')), 'thang'],
        [sequelize.fn('COUNT', sequelize.col('MaDon')), 'soLuong'],
      ],
      where: { MaNV1: { [Op.in]: maNVList }, NgayBD: { [Op.gte]: new Date(nam, thang - 7, 1) } },
      group: [sequelize.fn('MONTH', sequelize.col('NgayBD'))],
      raw: true,
    });

    return { role, tongNV, tongDA, nghiPhepChoduyet, chamCongHomNay, nvTheoPB, nghiPhep6Thang };
  }

  // === ADMIN / HR (full stats) ===
  const [tongNV, tongPB, tongDA, nghiPhepChoduyet, chamCongHomNay] = await Promise.all([
    NhanVien.count({ where: { TrangThai: 'Đang làm việc' } }),
    PhongBan.count(),
    DuAn.count({ where: { TrangThai: 'Đang thực hiện' } }),
    NghiPhep.count({ where: { TrangThai: 'Chờ duyệt' } }),
    ChamCong.count({ where: { Ngay: today } }),
  ]);

  const luongInfo = await getLatestLuong();

  const nvTheoPB = await PhongBan.findAll({
    attributes: ['TenPB', [sequelize.fn('COUNT', sequelize.col('nhanViens.MaNV1')), 'soNV']],
    include: [{ model: NhanVien, as: 'nhanViens', attributes: [] }],
    group: ['PhongBan.MaPB'],
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

  return {
    role,
    tongNV, tongPB, tongDA, nghiPhepChoduyet, chamCongHomNay,
    ...luongInfo,
    nvTheoPB,
    nghiPhep6Thang,
  };
};

module.exports = { getStats };
