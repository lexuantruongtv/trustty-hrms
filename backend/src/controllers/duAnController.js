const svc = require('../services/duAnService');
const { success } = require('../utils/response');
const { GhiChuDuAn, NhanVien, DuAn, PhanCong } = require('../models');

const getAll = async (req, res, next) => {
  try { success(res, await svc.getAll(req.query)); } catch (e) { next(e); }
};

const getById = async (req, res, next) => {
  try { success(res, await svc.getById(req.params.id)); } catch (e) { next(e); }
};

const getMyProjects = async (req, res, next) => {
  try {
    const maNV1 = req.user.MaNV1;
    const duAns = await DuAn.findAll({
      include: [
        {
          model: NhanVien, as: 'nhanViens',
          through: { attributes: ['VaiTro', 'ThoiGianTG'] },
          where: { MaNV1: maNV1 },
          required: true,
        },
        {
          model: GhiChuDuAn, as: 'ghiChus',
          where: { MaNV1: maNV1 },
          required: false,
          include: [{ model: NhanVien, as: 'nhanVien', attributes: ['TenNV'] }],
        },
      ],
      order: [['NgayBD', 'DESC']],
    });
    success(res, duAns);
  } catch (e) { next(e); }
};

const create = async (req, res, next) => {
  try { success(res, await svc.create(req.body), 'Tạo dự án thành công', 201); } catch (e) { next(e); }
};

const update = async (req, res, next) => {
  try { success(res, await svc.update(req.params.id, req.body), 'Cập nhật thành công'); } catch (e) { next(e); }
};

const remove = async (req, res, next) => {
  try { await svc.remove(req.params.id); success(res, null, 'Xóa thành công'); } catch (e) { next(e); }
};

const phanCong = async (req, res, next) => {
  try {
    const { MaNV1, VaiTro, ThoiGianTG } = req.body;
    success(res, await svc.phanCong(req.params.id, MaNV1, VaiTro, ThoiGianTG), 'Phân công thành công');
  } catch (e) { next(e); }
};

const checkMemberBusy = async (req, res, next) => {
  try {
    success(res, await svc.checkMemberBusy(req.params.id, req.params.maNV1));
  } catch (e) { next(e); }
};

const huyPhanCong = async (req, res, next) => {
  try {
    await svc.huyPhanCong(req.params.id, req.params.maNV1);
    success(res, null, 'Hủy phân công thành công');
  } catch (e) { next(e); }
};

const addNote = async (req, res, next) => {
  try {
    const maNV1 = req.user.MaNV1;
    const { id } = req.params;
    const { NoiDung } = req.body;
    if (!NoiDung?.trim()) return next({ status: 400, message: 'Nội dung không được trống' });
    // Manager/Admin/HR có thể gửi trực tiếp, Employee phải thuộc dự án
    const role = req.user.PhanQuyen;
    if (!['Admin', 'HR', 'Manager'].includes(role)) {
      const pc = await PhanCong.findOne({ where: { MaDOAN: id, MaNV1: maNV1 } });
      if (!pc) return next({ status: 403, message: 'Bạn không thuộc dự án này' });
    }
    const ghiChu = await GhiChuDuAn.create({ MaDOAN: id, MaNV1: maNV1, NoiDung });
    success(res, ghiChu, 'Gửi ghi chú thành công', 201);
  } catch (e) { next(e); }
};

const getNotes = async (req, res, next) => {
  try {
    const notes = await GhiChuDuAn.findAll({
      where: { MaDOAN: req.params.id },
      include: [{ model: NhanVien, as: 'nhanVien', attributes: ['TenNV', 'MaNV1'] }],
      order: [['NgayTao', 'ASC']],
    });
    success(res, notes);
  } catch (e) { next(e); }
};

const getNvChuaThamGia = async (req, res, next) => {
  try {
    const { Op, literal } = require('sequelize');
    const { PhongBan, ChucVu } = require('../models');

    const phongKT = await PhongBan.findOne({ where: { TenPB: { [Op.like]: '%Kỹ Thuật%' } } });
    if (!phongKT) return success(res, []);

    // Chỉ loại trừ NV đang tham gia dự án có trạng thái "Đang thực hiện"
    const nvChuaThamGia = await NhanVien.findAll({
      where: {
        MaPB: phongKT.MaPB,
        TrangThai: 'Đang làm việc',
        MaNV1: {
          [Op.notIn]: literal(`(
            SELECT DISTINCT pc.MaNV1
            FROM PhanCong pc
            INNER JOIN DuAn da ON pc.MaDOAN = da.MaDOAN
            WHERE da.TrangThai = 'Đang thực hiện'
          )`),
        },
      },
      attributes: ['MaNV1', 'TenNV', 'Email', 'SDT'],
      include: [{ model: ChucVu, as: 'chucVu', attributes: ['TenCV'] }],
    });
    success(res, nvChuaThamGia);
  } catch (e) { next(e); }
};

module.exports = { getAll, getById, getMyProjects, create, update, remove, phanCong, checkMemberBusy, huyPhanCong, addNote, getNotes, getNvChuaThamGia };
