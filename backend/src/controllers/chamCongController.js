const svc = require('../services/chamCongService');
const { success } = require('../utils/response');

const getAll = async (req, res, next) => {
  try { success(res, await svc.getAll(req.query)); } catch (e) { next(e); }
};
const checkIn = async (req, res, next) => {
  try { success(res, await svc.checkIn(req.user.MaNV1), 'Check-in thành công'); } catch (e) { next(e); }
};
const checkOut = async (req, res, next) => {
  try { success(res, await svc.checkOut(req.user.MaNV1), 'Check-out thành công'); } catch (e) { next(e); }
};
const getTodayStatus = async (req, res, next) => {
  try { success(res, await svc.getTodayStatus(req.user.MaNV1)); } catch (e) { next(e); }
};

module.exports = { getAll, checkIn, checkOut, getTodayStatus };
