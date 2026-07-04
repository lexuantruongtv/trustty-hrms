const svc = require('../services/luongService');
const { success } = require('../utils/response');

const getAll = async (req, res, next) => {
  try { success(res, await svc.getAll(req.query)); } catch (e) { next(e); }
};
const tinhLuong = async (req, res, next) => {
  try { success(res, await svc.tinhLuong(req.body), 'Tính lương thành công'); } catch (e) { next(e); }
};
const remove = async (req, res, next) => {
  try { await svc.remove(req.params.id); success(res, null, 'Xóa thành công'); } catch (e) { next(e); }
};
const autoTinhLuong = async (req, res, next) => {
  try {
    const result = await svc.autoTinhLuongThang(req.body);
    success(res, result, result.message);
  } catch (e) { next(e); }
};

module.exports = { getAll, tinhLuong, remove, autoTinhLuong };
