const { sequelize, NhanVien, PhongBan, NghiPhep, BangLuong, DuAn, ChamCong } = require('../models');
const { Op } = require('sequelize');

const getStats = async () => {
  const now = new Date();
  const thang = now.getMonth() + 1;
  const nam = now.getFullYear();

  const [tongNV, tongPB, tongDA, nghiPhepChoduyet, tongLuong, chamCongHomNay] = await Promise.all([
    NhanVien.count({ where: { TrangThai: 'Đang làm việc' } }),
    PhongBan.count(),
    DuAn.count({ where: { TrangThai: 'Đang thực hiện' } }),
    NghiPhep.count({ where: { TrangThai: 'Chờ duyệt' } }),
    BangLuong.sum('ThucLinh', { where: { Thang: thang, Nam: nam } }),
    ChamCong.count({ where: { Ngay: now.toISOString().split('T')[0] } }),
  ]);

  // Thống kê nhân viên theo phòng ban
  const nvTheoPB = await PhongBan.findAll({
    attributes: ['TenPB', [sequelize.fn('COUNT', sequelize.col('nhanViens.MaNV1')), 'soNV']],
    include: [{ model: NhanVien, as: 'nhanViens', attributes: [] }],
    group: ['PhongBan.MaPB'],
    raw: true,
  });

  // Thống kê nghỉ phép 6 tháng gần nhất
  const nghiPhep6Thang = await NghiPhep.findAll({
    attributes: [
      [sequelize.fn('MONTH', sequelize.col('NgayBD')), 'thang'],
      [sequelize.fn('COUNT', sequelize.col('MaDon')), 'soLuong'],
    ],
    where: {
      NgayBD: { [Op.gte]: new Date(nam, thang - 7, 1) },
    },
    group: [sequelize.fn('MONTH', sequelize.col('NgayBD'))],
    raw: true,
  });

  return {
    tongNV,
    tongPB,
    tongDA,
    nghiPhepChoduyet,
    tongLuong: tongLuong || 0,
    chamCongHomNay,
    nvTheoPB,
    nghiPhep6Thang,
  };
};

module.exports = { getStats };
