const svc = require('../services/nhanVienService');
const { success, error } = require('../utils/response');

const getAll = async (req, res, next) => {
  try { success(res, await svc.getAll(req.query)); } catch (e) { next(e); }
};
const getById = async (req, res, next) => {
  try { success(res, await svc.getById(req.params.id)); } catch (e) { next(e); }
};
const create = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) data.Avatar = `/uploads/${req.file.filename}`;
    success(res, await svc.create(data), 'Thêm nhân viên thành công', 201);
  } catch (e) { next(e); }
};
const update = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.file) data.Avatar = `/uploads/${req.file.filename}`;
    success(res, await svc.update(req.params.id, data), 'Cập nhật thành công');
  } catch (e) { next(e); }
};
const remove = async (req, res, next) => {
  try {
    await svc.remove(req.params.id);
    success(res, null, 'Xóa nhân viên thành công');
  } catch (e) { next(e); }
};

module.exports = { getAll, getById, create, update, remove };
