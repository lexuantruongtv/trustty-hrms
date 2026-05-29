const { Op } = require('sequelize');
const { NhanVien, PhongBan, ChucVu, TaiKhoan } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');

const getAll = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};
  if (query.search) {
    where[Op.or] = [
      { TenNV: { [Op.like]: `%${query.search}%` } },
      { Email: { [Op.like]: `%${query.search}%` } },
      { MaNV1: { [Op.like]: `%${query.search}%` } },
    ];
  }
  if (query.MaPB) where.MaPB = query.MaPB;
  if (query.TrangThai) where.TrangThai = query.TrangThai;

  const data = await NhanVien.findAndCountAll({
    where,
    include: [
      { model: PhongBan, as: 'phongBan' },
      { model: ChucVu, as: 'chucVu' },
    ],
    limit,
    offset,
    order: [['TenNV', 'ASC']],
  });
  return getPagingData(data, page, limit);
};

const getById = async (id) => {
  const nv = await NhanVien.findOne({
    where: { MaNV1: id },
    include: [
      { model: PhongBan, as: 'phongBan' },
      { model: ChucVu, as: 'chucVu' },
      { model: TaiKhoan, as: 'taiKhoan', attributes: ['TenTaiKhoan', 'PhanQuyen'] },
    ],
  });
  if (!nv) throw { status: 404, message: 'Không tìm thấy nhân viên' };
  return nv;
};

const create = async (data) => {
  const exists = await NhanVien.findByPk(data.MaNV1);
  if (exists) throw { status: 400, message: 'Mã nhân viên đã tồn tại' };
  return NhanVien.create(data);
};

const update = async (id, data) => {
  const nv = await NhanVien.findByPk(id);
  if (!nv) throw { status: 404, message: 'Không tìm thấy nhân viên' };
  return nv.update(data);
};

const remove = async (id) => {
  const nv = await NhanVien.findByPk(id);
  if (!nv) throw { status: 404, message: 'Không tìm thấy nhân viên' };
  await nv.destroy();
};

module.exports = { getAll, getById, create, update, remove };
