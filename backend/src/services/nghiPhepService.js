const { Op } = require('sequelize');
const { NghiPhep, NhanVien, ChucVu, PhongBan } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');

const getAll = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};
  if (query.MaNV1) where.MaNV1 = query.MaNV1;
  if (query.TrangThai) where.TrangThai = query.TrangThai;
  if (query.nam) {
    const y = query.nam;
    where.NgayBD = { [Op.between]: [`${y}-01-01`, `${y}-12-31`] };
  }

  const nhanVienWhere = {};
  if (query.tenNV) nhanVienWhere.TenNV = { [Op.like]: `%${query.tenNV}%` };
  if (query.MaPB) nhanVienWhere.MaPB = query.MaPB;

  const data = await NghiPhep.findAndCountAll({
    where, limit, offset,
    include: [{
      model: NhanVien, as: 'nhanVien', attributes: ['TenNV', 'Avatar', 'MaPB'],
      where: Object.keys(nhanVienWhere).length ? nhanVienWhere : undefined,
      required: Object.keys(nhanVienWhere).length > 0,
      include: [
        { model: ChucVu, as: 'chucVu', attributes: ['TenCV'] },
        { model: PhongBan, as: 'phongBan', attributes: ['TenPB'] },
      ],
    }],
    order: [['NgayBD', 'DESC']],
  });
  return getPagingData(data, page, limit);
};

const create = async (data) => NghiPhep.create({ ...data, TrangThai: 'Chờ duyệt' });

const approve = async (id) => {
  const don = await NghiPhep.findByPk(id);
  if (!don) throw { status: 404, message: 'Không tìm thấy đơn' };
  return don.update({ TrangThai: 'Đã duyệt' });
};

const reject = async (id) => {
  const don = await NghiPhep.findByPk(id);
  if (!don) throw { status: 404, message: 'Không tìm thấy đơn' };
  return don.update({ TrangThai: 'Từ chối' });
};

const remove = async (id) => {
  const don = await NghiPhep.findByPk(id);
  if (!don) throw { status: 404, message: 'Không tìm thấy đơn' };
  await don.destroy();
};

module.exports = { getAll, create, approve, reject, remove };
