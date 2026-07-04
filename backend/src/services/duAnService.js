const { Op } = require('sequelize');
const { DuAn, NhanVien, PhanCong } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');

const getAll = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};
  if (query.search) where.TenDA = { [Op.like]: `%${query.search}%` };
  if (query.TrangThai) where.TrangThai = query.TrangThai;

  const data = await DuAn.findAndCountAll({
    where, limit, offset,
    distinct: true,
    col: 'MaDOAN',
    include: [{ model: NhanVien, as: 'nhanViens', through: { attributes: ['VaiTro', 'ThoiGianTG'] } }],
    order: [['NgayBD', 'DESC']],
  });
  return getPagingData(data, page, limit);
};

const getById = async (id) => {
  const da = await DuAn.findByPk(id, {
    include: [{ model: NhanVien, as: 'nhanViens', through: { attributes: ['VaiTro', 'ThoiGianTG'] } }],
  });
  if (!da) throw { status: 404, message: 'Không tìm thấy dự án' };
  return da;
};

const create = async (data) => {
  const exists = await DuAn.findByPk(data.MaDOAN);
  if (exists) throw { status: 400, message: 'Mã dự án đã tồn tại' };
  return DuAn.create(data);
};

const update = async (id, data) => {
  const da = await DuAn.findByPk(id);
  if (!da) throw { status: 404, message: 'Không tìm thấy dự án' };
  return da.update(data);
};

const remove = async (id) => {
  const da = await DuAn.findByPk(id);
  if (!da) throw { status: 404, message: 'Không tìm thấy dự án' };
  await da.destroy();
};

// Kiểm tra NV có đang bận dự án nào không (dùng trước khi thêm, để frontend hiện confirm)
const checkMemberBusy = async (maDoan, maNV1) => {
  const { PhongBan } = require('../models');

  const nhanVien = await NhanVien.findByPk(maNV1, { attributes: ['MaNV1', 'TenNV', 'MaPB'] });
  if (!nhanVien) throw { status: 404, message: 'Không tìm thấy nhân viên' };

  // Validate phòng ban
  const phongBan = await PhongBan.findByPk(nhanVien.MaPB, { attributes: ['TenPB'] });
  if (!phongBan?.TenPB?.includes('Kỹ Thuật')) {
    throw { status: 400, message: `Chỉ nhân viên Phòng Kỹ Thuật mới được tham gia dự án. ${nhanVien.TenNV} thuộc ${phongBan?.TenPB || 'phòng khác'}.` };
  }

  // Tìm các dự án "Đang thực hiện" mà NV đang tham gia (không tính dự án hiện tại)
  const duAnDangTham = await PhanCong.findAll({
    where: { MaNV1: maNV1, MaDOAN: { [Op.ne]: maDoan } },
    include: [{
      model: DuAn, as: 'duAn',
      where: { TrangThai: 'Đang thực hiện' },
      attributes: ['MaDOAN', 'TenDA', 'NgayBD', 'NgayKT'],
    }],
  });

  return {
    MaNV1: nhanVien.MaNV1,
    TenNV: nhanVien.TenNV,
    busy: duAnDangTham.length > 0,
    duAnDangTham: duAnDangTham.map((pc) => ({
      MaDOAN: pc.duAn.MaDOAN,
      TenDA: pc.duAn.TenDA,
      NgayBD: pc.duAn.NgayBD,
      NgayKT: pc.duAn.NgayKT,
      VaiTro: pc.VaiTro,
    })),
  };
};

const phanCong = async (maDoan, maNV1, vaiTro, thoiGianTG) => {
  const { PhongBan } = require('../models');

  const duAn = await DuAn.findByPk(maDoan);
  if (!duAn) throw { status: 404, message: 'Không tìm thấy dự án' };

  const nhanVien = await NhanVien.findByPk(maNV1, { attributes: ['MaNV1', 'TenNV', 'MaPB'] });
  if (!nhanVien) throw { status: 404, message: 'Không tìm thấy nhân viên' };

  // Validate phòng ban — chỉ Phòng Kỹ Thuật
  const phongBan = await PhongBan.findByPk(nhanVien.MaPB, { attributes: ['TenPB'] });
  if (!phongBan?.TenPB?.includes('Kỹ Thuật')) {
    throw { status: 400, message: `Chỉ nhân viên Phòng Kỹ Thuật mới được tham gia dự án. ${nhanVien.TenNV} thuộc ${phongBan?.TenPB || 'phòng khác'}.` };
  }

  const [pc, created] = await PhanCong.findOrCreate({
    where: { MaDOAN: maDoan, MaNV1: maNV1 },
    defaults: { VaiTro: vaiTro, ThoiGianTG: thoiGianTG || new Date() },
  });
  if (!created) await pc.update({ VaiTro: vaiTro, ThoiGianTG: thoiGianTG || pc.ThoiGianTG });
  return pc;
};

const huyPhanCong = async (maDoan, maNV1) => {
  await PhanCong.destroy({ where: { MaDOAN: maDoan, MaNV1: maNV1 } });
};

module.exports = { getAll, getById, create, update, remove, checkMemberBusy, phanCong, huyPhanCong };
