const { BienDongLuong, NhanVien, ChucVu, PhongBan } = require('../models');
const { success } = require('../utils/response');
const { getPagination, getPagingData } = require('../utils/pagination');

const getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const where = {};
    if (req.query.MaNV1) where.MaNV1 = req.query.MaNV1;
    const data = await BienDongLuong.findAndCountAll({
      where, limit, offset,
      include: [{
        model: NhanVien, as: 'nhanVien', attributes: ['TenNV', 'MaNV1'],
        include: [
          { model: ChucVu, as: 'chucVu', attributes: ['TenCV'] },
          { model: PhongBan, as: 'phongBan', attributes: ['TenPB'] },
        ],
      }],
      order: [['NgayQuyetDinh', 'DESC']],
    });
    success(res, getPagingData(data, page, limit));
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try {
    success(res, await BienDongLuong.create(req.body), 'Thêm thành công', 201);
  } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try {
    const bd = await BienDongLuong.findByPk(req.params.id);
    if (!bd) return next({ status: 404, message: 'Không tìm thấy' });
    await bd.destroy();
    success(res, null, 'Xóa thành công');
  } catch (e) { next(e); }
};

module.exports = { getAll, create, remove };
