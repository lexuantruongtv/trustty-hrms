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

module.exports = { thongKeDuAn, bangLuongCongTy, chiPhiTheoPhongBan, chiPhiTheoDuAn };
