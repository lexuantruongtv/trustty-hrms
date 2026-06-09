const svc = require('../services/thongKeService');
const { success } = require('../utils/response');

const thongKeDuAn = async (req, res, next) => {
  try { success(res, await svc.getThongKeDuAn(req.query)); } catch (e) { next(e); }
};
const bangLuongCongTy = async (req, res, next) => {
  try { success(res, await svc.getBangLuongCongTy(req.query)); } catch (e) { next(e); }
};
const chiPhiTheoPhongBan = async (req, res, next) => {
  try { success(res, await svc.getChiPhiTheoPhongBan(req.query)); } catch (e) { next(e); }
};
const chiPhiTheoDuAn = async (req, res, next) => {
  try { success(res, await svc.getChiPhiTheoDuAn(req.query)); } catch (e) { next(e); }
};
const chenhLech = async (req, res, next) => {
  try { success(res, await svc.getChenhLech(req.query)); } catch (e) { next(e); }
};
const getChiPhiHoatDong = async (req, res, next) => {
  try { success(res, await svc.getChiPhiHoatDong(req.query)); } catch (e) { next(e); }
};
const createChiPhiHoatDong = async (req, res, next) => {
  try { success(res, await svc.createChiPhiHoatDong(req.body), 'Thêm thành công', 201); } catch (e) { next(e); }
};
const deleteChiPhiHoatDong = async (req, res, next) => {
  try { await svc.deleteChiPhiHoatDong(req.params.id); success(res, null, 'Đã xóa'); } catch (e) { next(e); }
};

module.exports = { thongKeDuAn, bangLuongCongTy, chiPhiTheoPhongBan, chiPhiTheoDuAn, chenhLech, getChiPhiHoatDong, createChiPhiHoatDong, deleteChiPhiHoatDong };
