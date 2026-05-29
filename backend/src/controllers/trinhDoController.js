const { TrinhDo, NhanVien } = require('../models');
const { success } = require('../utils/response');

const getAll = async (req, res, next) => {
  try {
    const where = {};
    if (req.query.MaNV1) where.MaNV1 = req.query.MaNV1;
    success(res, await TrinhDo.findAll({
      where,
      include: [{ model: NhanVien, as: 'nhanVien', attributes: ['TenNV'] }],
    }));
  } catch (e) { next(e); }
};
const create = async (req, res, next) => {
  try { success(res, await TrinhDo.create(req.body), 'Thêm trình độ thành công', 201); } catch (e) { next(e); }
};
const update = async (req, res, next) => {
  try {
    const td = await TrinhDo.findByPk(req.params.id);
    if (!td) return next({ status: 404, message: 'Không tìm thấy' });
    success(res, await td.update(req.body), 'Cập nhật thành công');
  } catch (e) { next(e); }
};
const remove = async (req, res, next) => {
  try {
    const td = await TrinhDo.findByPk(req.params.id);
    if (!td) return next({ status: 404, message: 'Không tìm thấy' });
    await td.destroy(); success(res, null, 'Xóa thành công');
  } catch (e) { next(e); }
};

module.exports = { getAll, create, update, remove };
