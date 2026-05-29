const { Op } = require('sequelize');
const { ChamCong, NhanVien } = require('../models');
const { getPagination, getPagingData } = require('../utils/pagination');

const getAll = async (query) => {
  const { page, limit, offset } = getPagination(query);
  const where = {};
  if (query.MaNV1) where.MaNV1 = query.MaNV1;
  if (query.Ngay) where.Ngay = query.Ngay;
  if (query.thang && query.nam) {
    where.Ngay = {
      [Op.between]: [
        `${query.nam}-${String(query.thang).padStart(2, '0')}-01`,
        `${query.nam}-${String(query.thang).padStart(2, '0')}-31`,
      ],
    };
  }
  const data = await ChamCong.findAndCountAll({
    where, limit, offset,
    include: [{ model: NhanVien, as: 'nhanVien', attributes: ['TenNV', 'Avatar'] }],
    order: [['Ngay', 'DESC']],
  });
  return getPagingData(data, page, limit);
};

const checkIn = async (maNV1) => {
  const today = new Date().toISOString().split('T')[0];
  const existing = await ChamCong.findOne({ where: { MaNV1: maNV1, Ngay: today } });
  if (existing) throw { status: 400, message: 'Đã check-in hôm nay' };
  const now = new Date().toTimeString().split(' ')[0];
  return ChamCong.create({ MaNV1: maNV1, Ngay: today, GioVao: now });
};

const checkOut = async (maNV1) => {
  const today = new Date().toISOString().split('T')[0];
  const cc = await ChamCong.findOne({ where: { MaNV1: maNV1, Ngay: today } });
  if (!cc) throw { status: 400, message: 'Chưa check-in hôm nay' };
  if (cc.GioRa) throw { status: 400, message: 'Đã check-out hôm nay' };
  const now = new Date().toTimeString().split(' ')[0];
  // Tính số giờ làm
  const [h1, m1] = cc.GioVao.split(':').map(Number);
  const [h2, m2] = now.split(':').map(Number);
  const soGio = parseFloat(((h2 * 60 + m2 - h1 * 60 - m1) / 60).toFixed(2));
  return cc.update({ GioRa: now, SoGioLam: soGio });
};

const getTodayStatus = async (maNV1) => {
  const today = new Date().toISOString().split('T')[0];
  return ChamCong.findOne({ where: { MaNV1: maNV1, Ngay: today } });
};

module.exports = { getAll, checkIn, checkOut, getTodayStatus };
