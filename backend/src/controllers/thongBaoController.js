const { ThongBao } = require('../models');
const { success } = require('../utils/response');

const getMyNotifications = async (req, res, next) => {
  try {
    const data = await ThongBao.findAll({
      where: { MaNV1: req.user.MaNV1 },
      order: [['NgayTao', 'DESC']],
      limit: 20,
    });
    success(res, data);
  } catch (e) { next(e); }
};

const markRead = async (req, res, next) => {
  try {
    await ThongBao.update({ DaDoc: true }, { where: { MaNV1: req.user.MaNV1 } });
    success(res, null, 'Đã đánh dấu đọc tất cả');
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try { success(res, await ThongBao.create(req.body), 'Gửi thông báo thành công', 201); } catch (e) { next(e); }
};

module.exports = { getMyNotifications, markRead, create };
