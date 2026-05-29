const { BangLuong, NhanVien, ChucVu } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');

const getAll = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};
  if (query.MaNV1) where.MaNV1 = query.MaNV1;
  if (query.Thang) where.Thang = query.Thang;
  if (query.Nam) where.Nam = query.Nam;

  const data = await BangLuong.findAndCountAll({
    where, limit, offset,
    include: [{ model: NhanVien, as: 'nhanVien', attributes: ['TenNV', 'Avatar', 'MaPB'] }],
    order: [['Nam', 'DESC'], ['Thang', 'DESC']],
  });
  return getPagingData(data, page, limit);
};

/**
 * Tính lương tự động cho nhân viên theo tháng
 * Công thức: ThucLinh = LuongCB + PhuCap - ThueTNCN (10%)
 */
const tinhLuong = async ({ MaNV1, Thang, Nam, LuongCB, PhuCap }) => {
  const MaBL = `BL${MaNV1}${Nam}${String(Thang).padStart(2, '0')}`;
  const ThueTNCN = parseFloat(((LuongCB * 0.1)).toFixed(2));
  const ThucLinh = parseFloat((LuongCB + PhuCap - ThueTNCN).toFixed(2));

  const [bl, created] = await BangLuong.findOrCreate({
    where: { MaBL },
    defaults: { MaNV1, Thang, Nam, LuongCB, PhuCap, ThueTNCN, ThucLinh },
  });
  if (!created) await bl.update({ LuongCB, PhuCap, ThueTNCN, ThucLinh });
  return bl;
};

const remove = async (id) => {
  const bl = await BangLuong.findByPk(id);
  if (!bl) throw { status: 404, message: 'Không tìm thấy bảng lương' };
  await bl.destroy();
};

module.exports = { getAll, tinhLuong, remove };
