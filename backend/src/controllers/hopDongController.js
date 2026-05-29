const { HopDong, NhanVien } = require('../models');
const { success } = require('../utils/response');
const { getPagination, getPagingData } = require('../utils/pagination');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const where = {};
    if (req.query.MaNV1) where.MaNV1 = req.query.MaNV1;
    const data = await HopDong.findAndCountAll({
      where, limit, offset,
      include: [{ model: NhanVien, as: 'nhanVien', attributes: ['TenNV'] }],
      order: [['NgayKy', 'DESC']],
    });
    success(res, getPagingData(data, page, limit));
  } catch (e) { next(e); }
};
const create = async (req, res, next) => {
  try { success(res, await HopDong.create(req.body), 'Thêm hợp đồng thành công', 201); } catch (e) { next(e); }
};
const update = async (req, res, next) => {
  try {
    const hd = await HopDong.findByPk(req.params.id);
    if (!hd) return next({ status: 404, message: 'Không tìm thấy hợp đồng' });
    success(res, await hd.update(req.body), 'Cập nhật thành công');
  } catch (e) { next(e); }
};
const remove = async (req, res, next) => {
  try {
    const hd = await HopDong.findByPk(req.params.id);
    if (!hd) return next({ status: 404, message: 'Không tìm thấy hợp đồng' });
    await hd.destroy(); success(res, null, 'Xóa thành công');
  } catch (e) { next(e); }
};

module.exports = { getAll, create, update, remove };
