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
    include: [{ model: NhanVien, as: 'nhanViens', through: { attributes: ['VaiTro'] } }],
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

const phanCong = async (maDoan, maNV1, vaiTro) => {
  const [pc, created] = await PhanCong.findOrCreate({
    where: { MaDOAN: maDoan, MaNV1: maNV1 },
    defaults: { VaiTro: vaiTro, ThoiGianTG: new Date() },
  });
  if (!created) await pc.update({ VaiTro: vaiTro });
  return pc;
};

const huyPhanCong = async (maDoan, maNV1) => {
  await PhanCong.destroy({ where: { MaDOAN: maDoan, MaNV1: maNV1 } });
};

module.exports = { getAll, getById, create, update, remove, phanCong, huyPhanCong };
