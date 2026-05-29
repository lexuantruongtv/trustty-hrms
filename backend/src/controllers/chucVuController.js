const { ChucVu } = require('../models');
const { success } = require('../utils/response');

const getAll = async (req, res, next) => {
  try { success(res, await ChucVu.findAll({ order: [['CapBac', 'ASC']] })); } catch (e) { next(e); }
};
const create = async (req, res, next) => {
  try { success(res, await ChucVu.create(req.body), 'Thêm chức vụ thành công', 201); } catch (e) { next(e); }
};
const update = async (req, res, next) => {
  try {
    const cv = await ChucVu.findByPk(req.params.id);
    if (!cv) return next({ status: 404, message: 'Không tìm thấy chức vụ' });
    success(res, await cv.update(req.body), 'Cập nhật thành công');
  } catch (e) { next(e); }
};
const remove = async (req, res, next) => {
  try {
    const cv = await ChucVu.findByPk(req.params.id);
    if (!cv) return next({ status: 404, message: 'Không tìm thấy chức vụ' });
    await cv.destroy(); success(res, null, 'Xóa thành công');
  } catch (e) { next(e); }
};

module.exports = { getAll, create, update, remove };
