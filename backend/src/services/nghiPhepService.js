const { NghiPhep, NhanVien } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');

const getAll = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};
  if (query.MaNV1) where.MaNV1 = query.MaNV1;
  if (query.TrangThai) where.TrangThai = query.TrangThai;

  const data = await NghiPhep.findAndCountAll({
    where, limit, offset,
    include: [{ model: NhanVien, as: 'nhanVien', attributes: ['TenNV', 'Avatar', 'MaPB'] }],
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
