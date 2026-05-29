const svc = require('../services/duAnService');
const { success } = require('../utils/response');

const getAll = async (req, res, next) => {
  try { success(res, await svc.getAll(req.query)); } catch (e) { next(e); }
};
const getById = async (req, res, next) => {
  try { success(res, await svc.getById(req.params.id)); } catch (e) { next(e); }
};
const create = async (req, res, next) => {
  try { success(res, await svc.create(req.body), 'Tạo dự án thành công', 201); } catch (e) { next(e); }
};
const update = async (req, res, next) => {
  try { success(res, await svc.update(req.params.id, req.body), 'Cập nhật thành công'); } catch (e) { next(e); }
};
const remove = async (req, res, next) => {
  try { await svc.remove(req.params.id); success(res, null, 'Xóa thành công'); } catch (e) { next(e); }
};
const phanCong = async (req, res, next) => {
  try {
    const { MaNV1, VaiTro } = req.body;
    success(res, await svc.phanCong(req.params.id, MaNV1, VaiTro), 'Phân công thành công');
  } catch (e) { next(e); }
};
const huyPhanCong = async (req, res, next) => {
  try {
    await svc.huyPhanCong(req.params.id, req.params.maNV1);
    success(res, null, 'Hủy phân công thành công');
  } catch (e) { next(e); }
};

module.exports = { getAll, getById, create, update, remove, phanCong, huyPhanCong };
