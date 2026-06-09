const { BangLuong, NhanVien, BienDongLuong, ChucVu, PhongBan } = require('../models');
const { sequelize } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const { getPagination, getPagingData } = require('../utils/pagination');

const getAll = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};
  if (query.MaNV1) where.MaNV1 = query.MaNV1;
  if (query.Thang) where.Thang = query.Thang;
  if (query.Nam) where.Nam = query.Nam;

  const includeWhere = {};
  if (query.search) includeWhere.TenNV = { [Op.like]: `%${query.search}%` };

  const data = await BangLuong.findAndCountAll({
    where, limit, offset,
    include: [{
      model: NhanVien, as: 'nhanVien',
      attributes: ['MaNV1', 'TenNV', 'Avatar', 'MaPB', 'MaCV', 'Email', 'SDT', 'SoTaiKhoanNN'],
      where: Object.keys(includeWhere).length ? includeWhere : undefined,
      required: Object.keys(includeWhere).length > 0,
      include: [
        { model: ChucVu, as: 'chucVu', attributes: ['TenCV'] },
        { model: PhongBan, as: 'phongBan', attributes: ['TenPB'] },
      ],
    }],
    order: [['Nam', 'DESC'], ['Thang', 'DESC']],
  });

  // Tính SUM biến động lương cho từng bản ghi
  const rows = await Promise.all(data.rows.map(async (bl) => {
    const result = await BienDongLuong.findOne({
      where: {
        MaNV1: bl.MaNV1,
        NgayQuyetDinh: {
          [Op.between]: [
            `${bl.Nam}-${String(bl.Thang).padStart(2, '0')}-01`,
            `${bl.Nam}-${String(bl.Thang).padStart(2, '0')}-31`,
          ],
        },
      },
      attributes: [[fn('COALESCE', fn('SUM', col('GiaTien')), 0), 'TongBienDong']],
      raw: true,
    });
    return { ...bl.toJSON(), TongBienDong: parseFloat(result?.TongBienDong ?? 0) };
  }));

  return { ...getPagingData(data, page, limit), items: rows };
};

/**
 * Tính lương tự động cho nhân viên theo tháng
 * Khấu trừ:
 *   - Thuế TNCN  : 10%   lương cơ bản
 *   - BHXH       : 8%    lương cơ bản (hưu trí & tử tuất)
 *   - BHYT       : 1.5%  lương cơ bản (bảo hiểm y tế)
 *   - BHTN       : 1%    lương cơ bản (bảo hiểm thất nghiệp)
 * Công thức: ThucLinh = LuongCB + PhuCap - ThueTNCN - BHXH - BHYT - BHTN
 */
const tinhLuong = async ({ MaNV1, Thang, Nam, LuongCB, PhuCap }) => {
  const MaBL = `BL${MaNV1}${Nam}${String(Thang).padStart(2, '0')}`;
  const ThueTNCN = parseFloat((LuongCB * 0.10).toFixed(2));
  const BHXH     = parseFloat((LuongCB * 0.08).toFixed(2));
  const BHYT     = parseFloat((LuongCB * 0.015).toFixed(2));
  const BHTN     = parseFloat((LuongCB * 0.01).toFixed(2));
  const ThucLinh = parseFloat((LuongCB + PhuCap - ThueTNCN - BHXH - BHYT - BHTN).toFixed(2));

  const [bl, created] = await BangLuong.findOrCreate({
    where: { MaBL },
    defaults: { MaNV1, Thang, Nam, LuongCB, PhuCap, ThueTNCN, BHXH, BHYT, BHTN, ThucLinh },
  });
  if (!created) await bl.update({ LuongCB, PhuCap, ThueTNCN, BHXH, BHYT, BHTN, ThucLinh });
  return bl;
};

const remove = async (id) => {
  const bl = await BangLuong.findByPk(id);
  if (!bl) throw { status: 404, message: 'Không tìm thấy bảng lương' };
  await bl.destroy();
};

module.exports = { getAll, tinhLuong, remove };
