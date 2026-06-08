const svc = require('../services/dashboardService');
const { success } = require('../utils/response');

const getStats = async (req, res, next) => {
  try { success(res, await svc.getStats(req.user)); } catch (e) { next(e); }
};

module.exports = { getStats };
