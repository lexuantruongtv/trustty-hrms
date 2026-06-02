require('dotenv').config();
const { sequelize, NhanVien, TaiKhoan } = require('../models');

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const [, nvCreated] = await NhanVien.findOrCreate({
      where: { MaNV1: 'NV008' },
      defaults: {
        MaNV1: 'NV008', TenNV: 'Nguyễn Kế Toán',
        NgaySinh: '1990-04-10', Email: 'ketoan@trustty.vn',
        SDT: '0908000001', MaPB: 'PB004', MaCV: 'CV003',
        TrangThai: 'Đang làm việc', DiaChi: 'Hà Nội',
      },
    });

    const [, tkCreated] = await TaiKhoan.findOrCreate({
      where: { TenTaiKhoan: 'ketoan' },
      defaults: { TenTaiKhoan: 'ketoan', MaNV1: 'NV008', MatKhau: '123456', PhanQuyen: 'Ketoan' },
    });

    if (nvCreated) console.log('✅ Nhân viên Kế toán đã được tạo (NV008)');
    else console.log('ℹ️  Nhân viên NV008 đã tồn tại');

    if (tkCreated) console.log('✅ Tài khoản Kế toán đã được tạo: ketoan / 123456');
    else console.log('ℹ️  Tài khoản ketoan đã tồn tại');

    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
};

run();
