require('dotenv').config();
const { sequelize, NhanVien, TaiKhoan } = require('../models');

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const [, nvCreated] = await NhanVien.findOrCreate({
      where: { MaNV1: 'NV009' },
      defaults: {
        MaNV1: 'NV009', TenNV: 'Lê Trưởng Phòng',
        NgaySinh: '1987-06-15', Email: 'truongphong@trustty.vn',
        SDT: '0909000001', MaPB: 'PB002', MaCV: 'CV002',
        TrangThai: 'Đang làm việc', DiaChi: 'Hà Nội',
      },
    });

    const [, tkCreated] = await TaiKhoan.findOrCreate({
      where: { TenTaiKhoan: 'truongphong' },
      defaults: { TenTaiKhoan: 'truongphong', MaNV1: 'NV009', MatKhau: '123456', PhanQuyen: 'TruongPhong' },
    });

    if (nvCreated) console.log('✅ Nhân viên Trưởng phòng đã được tạo (NV009)');
    else console.log('ℹ️  Nhân viên NV009 đã tồn tại');

    if (tkCreated) console.log('✅ Tài khoản Trưởng phòng đã được tạo: truongphong / 123456');
    else console.log('ℹ️  Tài khoản truongphong đã tồn tại');

    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
};

run();
