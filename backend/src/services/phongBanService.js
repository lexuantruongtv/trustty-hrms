const { PhongBan, NhanVien } = require('../models');

const getAll = async () => PhongBan.findAll({
  include: [{ model: NhanVien, as: 'nhanViens', attributes: ['MaNV1'] }],
  order: [['TenPB', 'ASC']],
});

const getById = async (id) => {
  const pb = await PhongBan.findByPk(id, {
    include: [{ model: NhanVien, as: 'nhanViens' }],
  });
  if (!pb) throw { status: 404, message: 'Không tìm thấy phòng ban' };
  return pb;
};

const create = async (data) => {
  const exists = await PhongBan.findByPk(data.MaPB);
  if (exists) throw { status: 400, message: 'Mã phòng ban đã tồn tại' };
  return PhongBan.create(data);
};

const update = async (id, data) => {
  const pb = await PhongBan.findByPk(id);
  if (!pb) throw { status: 404, message: 'Không tìm thấy phòng ban' };
  return pb.update(data);
};

const remove = async (id) => {
  const pb = await PhongBan.findByPk(id);
  if (!pb) throw { status: 404, message: 'Không tìm thấy phòng ban' };
  await pb.destroy();
};

module.exports = { getAll, getById, create, update, remove };
