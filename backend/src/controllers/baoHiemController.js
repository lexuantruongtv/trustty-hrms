const { BaoHiem, NhanVien } = require('../models');
const { success } = require('../utils/response');
const { getPagination, getPagingData } = require('../utils/pagination');
const { Op } = require('sequelize');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const where = {};
    if (req.query.MaNV1) where.MaNV1 = req.query.MaNV1;
    if (req.query.TenBH) where.TenBH = req.query.TenBH;

    const includeWhere = {};
    if (req.query.search) includeWhere.TenNV = { [Op.like]: `%${req.query.search}%` };

    const data = await BaoHiem.findAndCountAll({
      where, limit, offset,
      include: [{
        model: NhanVien, as: 'nhanVien', attributes: ['TenNV'],
        where: Object.keys(includeWhere).length ? includeWhere : undefined,
        required: Object.keys(includeWhere).length > 0,
      }],
    });
    success(res, getPagingData(data, page, limit));
  } catch (e) { next(e); }
};
const create = async (req, res, next) => {
  try { success(res, await BaoHiem.create(req.body), 'Thêm bảo hiểm thành công', 201); } catch (e) { next(e); }
};
const update = async (req, res, next) => {
  try {
    const bh = await BaoHiem.findByPk(req.params.id);
    if (!bh) return next({ status: 404, message: 'Không tìm thấy bảo hiểm' });
    success(res, await bh.update(req.body), 'Cập nhật thành công');
  } catch (e) { next(e); }
};
const remove = async (req, res, next) => {
  try {
    const bh = await BaoHiem.findByPk(req.params.id);
    if (!bh) return next({ status: 404, message: 'Không tìm thấy bảo hiểm' });
    await bh.destroy(); success(res, null, 'Xóa thành công');
  } catch (e) { next(e); }
};

module.exports = { getAll, create, update, remove };
