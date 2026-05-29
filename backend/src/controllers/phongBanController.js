const svc = require('../services/phongBanService');
const { success } = require('../utils/response');

const getAll = async (req, res, next) => {
  try { success(res, await svc.getAll()); } catch (e) { next(e); }
};
const getById = async (req, res, next) => {
  try { success(res, await svc.getById(req.params.id)); } catch (e) { next(e); }
};
const create = async (req, res, next) => {
  try { success(res, await svc.create(req.body), 'Thêm phòng ban thành công', 201); } catch (e) { next(e); }
};
const update = async (req, res, next) => {
  try { success(res, await svc.update(req.params.id, req.body), 'Cập nhật thành công'); } catch (e) { next(e); }
};
const remove = async (req, res, next) => {
  try { await svc.remove(req.params.id); success(res, null, 'Xóa thành công'); } catch (e) { next(e); }
};

module.exports = { getAll, getById, create, update, remove };
