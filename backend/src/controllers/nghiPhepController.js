const svc = require('../services/nghiPhepService');
const { success } = require('../utils/response');

const getAll = async (req, res, next) => {
  try { success(res, await svc.getAll(req.query)); } catch (e) { next(e); }
};
const create = async (req, res, next) => {
  try {
    const data = { ...req.body, MaNV1: req.user.MaNV1 };
    success(res, await svc.create(data), 'Tạo đơn nghỉ phép thành công', 201);
  } catch (e) { next(e); }
};
const approve = async (req, res, next) => {
  try { success(res, await svc.approve(req.params.id), 'Đã duyệt đơn'); } catch (e) { next(e); }
};
const reject = async (req, res, next) => {
  try { success(res, await svc.reject(req.params.id), 'Đã từ chối đơn'); } catch (e) { next(e); }
};
const remove = async (req, res, next) => {
  try {
    const don = await require('../models').NghiPhep.findByPk(req.params.id);
    if (!don) return next({ status: 404, message: 'Không tìm thấy đơn' });
    // Ketoan chỉ xóa đơn của mình
    if (req.user.PhanQuyen === 'Ketoan' && don.MaNV1 !== req.user.MaNV1) {
      return next({ status: 403, message: 'Bạn không có quyền xóa đơn này' });
    }
    await svc.remove(req.params.id);
    success(res, null, 'Xóa thành công');
  } catch (e) { next(e); }
};

module.exports = { getAll, create, approve, reject, remove };
