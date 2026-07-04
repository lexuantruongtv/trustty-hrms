const { ThongBao, NhanVien } = require('../models');
const { success } = require('../utils/response');
const { Op, fn, col } = require('sequelize');

const getMyNotifications = async (req, res, next) => {
  try {
    const data = await ThongBao.findAll({
      where: { MaNV1: req.user.MaNV1 },
      order: [['NgayTao', 'DESC']],
      limit: 50,
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

// Admin: lấy danh sách các đợt thông báo đã gửi (group theo TieuDe + NgayTao cùng giây)
const getAdminNotifications = async (req, res, next) => {
  try {
    // Lấy distinct thông báo theo TieuDe, NoiDung, NgayTao (nhóm đợt gửi)
    const rows = await ThongBao.findAll({
      attributes: [
        'TieuDe', 'NoiDung',
        [fn('MIN', col('NgayTao')), 'NgayTao'],
        [fn('COUNT', col('MaTB')), 'SoNguoiNhan'],
        [fn('SUM', col('DaDoc')), 'DaDocCount'],
      ],
      group: ['TieuDe', 'NoiDung'],
      order: [[fn('MIN', col('NgayTao')), 'DESC']],
      limit: 50,
      raw: true,
    });
    success(res, rows);
  } catch (e) { next(e); }
};

// Admin: xem chi tiết người nhận của 1 đợt thông báo
const getDetailByGroup = async (req, res, next) => {
  try {
    const { TieuDe, NoiDung } = req.query;
    const rows = await ThongBao.findAll({
      where: { TieuDe, NoiDung },
      include: [{ model: NhanVien, as: 'nhanVien', attributes: ['TenNV', 'MaNV1', 'Email'] }],
      order: [['DaDoc', 'ASC'], ['MaNV1', 'ASC']],
    });
    success(res, rows);
  } catch (e) { next(e); }
};

// Admin: cập nhật tiêu đề + nội dung toàn bộ thông báo cùng nhóm
const updateByGroup = async (req, res, next) => {
  try {
    const { TieuDeOld, NoiDungOld, TieuDeNew, NoiDungNew } = req.body;
    if (!TieuDeOld || !TieuDeNew || !NoiDungNew) return next({ status: 400, message: 'Thiếu thông tin' });
    await ThongBao.update(
      { TieuDe: TieuDeNew, NoiDung: NoiDungNew },
      { where: { TieuDe: TieuDeOld, NoiDung: NoiDungOld } },
    );
    success(res, null, 'Đã cập nhật thông báo');
  } catch (e) { next(e); }
};
const deleteByGroup = async (req, res, next) => {
  try {
    const { TieuDe, NoiDung } = req.body;
    if (!TieuDe) return next({ status: 400, message: 'Thiếu tiêu đề' });
    await ThongBao.destroy({ where: { TieuDe, NoiDung } });
    success(res, null, 'Đã xóa thông báo');
  } catch (e) { next(e); }
};

// Gửi thông báo đến 1 hoặc nhiều người (hoặc tất cả nếu MaNV1List rỗng)
const create = async (req, res, next) => {
  try {
    const { TieuDe, NoiDung, MaNV1List } = req.body;
    if (!TieuDe || !NoiDung) return next({ status: 400, message: 'Thiếu tiêu đề hoặc nội dung' });

    let targets = MaNV1List;
    if (!targets || targets.length === 0) {
      const all = await NhanVien.findAll({ where: { TrangThai: 'Đang làm việc' }, attributes: ['MaNV1'] });
      targets = all.map((nv) => nv.MaNV1);
    }

    const now = new Date();
    const records = targets.map((MaNV1) => ({
      MaNV1, TieuDe, NoiDung, DaDoc: false, NgayTao: now,
    }));

    await ThongBao.bulkCreate(records);
    success(res, null, `Đã gửi thông báo đến ${records.length} người`, 201);
  } catch (e) { next(e); }
};

module.exports = { getMyNotifications, markRead, create, getAdminNotifications, deleteByGroup, getDetailByGroup, updateByGroup };
