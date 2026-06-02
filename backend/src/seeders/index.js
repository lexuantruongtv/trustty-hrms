require('dotenv').config();
const { sequelize, PhongBan, ChucVu, NhanVien, TaiKhoan, DuAn, BangLuong, ThongBao } = require('../models');

const ensureKetoan = async () => {
  // Tạo NV + TK Kế toán nếu chưa có
  await NhanVien.findOrCreate({
    where: { MaNV1: 'NV008' },
    defaults: { MaNV1: 'NV008', TenNV: 'Nguyễn Kế Toán', NgaySinh: '1990-04-10', Email: 'ketoan@trustty.vn', SDT: '0908000001', MaPB: 'PB004', MaCV: 'CV003', TrangThai: 'Đang làm việc', DiaChi: 'Hà Nội' },
  });
  const [, created] = await TaiKhoan.findOrCreate({
    where: { TenTaiKhoan: 'ketoan' },
    defaults: { TenTaiKhoan: 'ketoan', MaNV1: 'NV008', MatKhau: '123456', PhanQuyen: 'Ketoan' },
  });
  if (created) console.log('✅ Tài khoản Kế toán đã được tạo: ketoan / 123456');
  else console.log('ℹ️  Tài khoản Kế toán đã tồn tại');
};

const seed = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('✅ Database synced');

    // Phòng ban
    await PhongBan.bulkCreate([
      { MaPB: 'PB001', TenPB: 'Ban Giám Đốc', MoTa: 'Lãnh đạo công ty' },
      { MaPB: 'PB002', TenPB: 'Phòng Kỹ Thuật', MoTa: 'Phát triển phần mềm' },
      { MaPB: 'PB003', TenPB: 'Phòng Nhân Sự', MoTa: 'Quản lý nhân sự' },
      { MaPB: 'PB004', TenPB: 'Phòng Kế Toán', MoTa: 'Tài chính kế toán' },
      { MaPB: 'PB005', TenPB: 'Phòng Marketing', MoTa: 'Marketing & Sales' },
    ]);
    console.log('✅ PhongBan seeded');

    // Chức vụ
    await ChucVu.bulkCreate([
      { MaCV: 'CV001', TenCV: 'Giám Đốc', CapBac: 1 },
      { MaCV: 'CV002', TenCV: 'Trưởng Phòng', CapBac: 2 },
      { MaCV: 'CV003', TenCV: 'Nhân Viên', CapBac: 3 },
      { MaCV: 'CV004', TenCV: 'Thực Tập Sinh', CapBac: 4 },
      { MaCV: 'CV005', TenCV: 'Senior Developer', CapBac: 2 },
      { MaCV: 'CV006', TenCV: 'Junior Developer', CapBac: 3 },
    ]);
    console.log('✅ ChucVu seeded');

    // Nhân viên
    await NhanVien.bulkCreate([
      { MaNV1: 'NV001', TenNV: 'Nguyễn Văn Admin', NgaySinh: '1985-01-15', Email: 'admin@trustty.vn', SDT: '0901234567', MaPB: 'PB001', MaCV: 'CV001', TrangThai: 'Đang làm việc', DiaChi: 'Hà Nội' },
      { MaNV1: 'NV002', TenNV: 'Trần Thị HR', NgaySinh: '1990-05-20', Email: 'hr@trustty.vn', SDT: '0902345678', MaPB: 'PB003', MaCV: 'CV002', TrangThai: 'Đang làm việc', DiaChi: 'TP.HCM' },
      { MaNV1: 'NV003', TenNV: 'Lê Văn Manager', NgaySinh: '1988-08-10', Email: 'manager@trustty.vn', SDT: '0903456789', MaPB: 'PB002', MaCV: 'CV002', TrangThai: 'Đang làm việc', DiaChi: 'Đà Nẵng' },
      { MaNV1: 'NV004', TenNV: 'Phạm Thị Employee', NgaySinh: '1995-12-25', Email: 'employee@trustty.vn', SDT: '0904567890', MaPB: 'PB002', MaCV: 'CV006', TrangThai: 'Đang làm việc', DiaChi: 'Cần Thơ' },
      { MaNV1: 'NV005', TenNV: 'Hoàng Văn Minh', NgaySinh: '1992-03-18', Email: 'minh@trustty.vn', SDT: '0905678901', MaPB: 'PB002', MaCV: 'CV005', TrangThai: 'Đang làm việc', DiaChi: 'Hà Nội' },
      { MaNV1: 'NV006', TenNV: 'Nguyễn Thị Lan', NgaySinh: '1993-07-22', Email: 'lan@trustty.vn', SDT: '0906789012', MaPB: 'PB004', MaCV: 'CV003', TrangThai: 'Đang làm việc', DiaChi: 'TP.HCM' },
      { MaNV1: 'NV007', TenNV: 'Trần Văn Hùng', NgaySinh: '1991-11-05', Email: 'hung@trustty.vn', SDT: '0907890123', MaPB: 'PB005', MaCV: 'CV003', TrangThai: 'Đang làm việc', DiaChi: 'Hà Nội' },
    ]);
    console.log('✅ NhanVien seeded');

    // Tài khoản (plain text password - demo only)
    await TaiKhoan.bulkCreate([
      { TenTaiKhoan: 'admin', MaNV1: 'NV001', MatKhau: '123456', PhanQuyen: 'Admin' },
      { TenTaiKhoan: 'hr', MaNV1: 'NV002', MatKhau: '123456', PhanQuyen: 'HR' },
      { TenTaiKhoan: 'manager', MaNV1: 'NV003', MatKhau: '123456', PhanQuyen: 'Manager' },
      { TenTaiKhoan: 'employee', MaNV1: 'NV004', MatKhau: '123456', PhanQuyen: 'Employee' },
    ]);
    console.log('✅ TaiKhoan seeded');

    // Dự án
    await DuAn.bulkCreate([
      { MaDOAN: 'DA001', TenDA: 'TrustTY HRMS', MoTa: 'Hệ thống quản lý nhân sự', TrangThai: 'Đang thực hiện', NgayBD: '2024-01-01', NgayKT: '2024-12-31', ChiPhiDuKien: 500000000, ChiPhiThucTe: 200000000 },
      { MaDOAN: 'DA002', TenDA: 'E-Commerce Platform', MoTa: 'Nền tảng thương mại điện tử', TrangThai: 'Đang thực hiện', NgayBD: '2024-03-01', NgayKT: '2024-09-30', ChiPhiDuKien: 300000000, ChiPhiThucTe: 150000000 },
      { MaDOAN: 'DA003', TenDA: 'Mobile Banking App', MoTa: 'Ứng dụng ngân hàng di động', TrangThai: 'Hoàn thành', NgayBD: '2023-06-01', NgayKT: '2024-01-31', ChiPhiDuKien: 800000000, ChiPhiThucTe: 820000000 },
    ]);
    console.log('✅ DuAn seeded');

    // Bảng lương mẫu
    const now = new Date();
    await BangLuong.bulkCreate([
      { MaBL: 'BL001', MaNV1: 'NV001', Thang: now.getMonth() + 1, Nam: now.getFullYear(), LuongCB: 30000000, PhuCap: 5000000, ThueTNCN: 3000000, ThucLinh: 32000000 },
      { MaBL: 'BL002', MaNV1: 'NV002', Thang: now.getMonth() + 1, Nam: now.getFullYear(), LuongCB: 20000000, PhuCap: 3000000, ThueTNCN: 2000000, ThucLinh: 21000000 },
      { MaBL: 'BL003', MaNV1: 'NV003', Thang: now.getMonth() + 1, Nam: now.getFullYear(), LuongCB: 25000000, PhuCap: 4000000, ThueTNCN: 2500000, ThucLinh: 26500000 },
      { MaBL: 'BL004', MaNV1: 'NV004', Thang: now.getMonth() + 1, Nam: now.getFullYear(), LuongCB: 15000000, PhuCap: 2000000, ThueTNCN: 1500000, ThucLinh: 15500000 },
    ]);
    console.log('✅ BangLuong seeded');

    // Thông báo mẫu
    await ThongBao.bulkCreate([
      { MaNV1: 'NV001', TieuDe: 'Chào mừng đến TrustTY HRMS', NoiDung: 'Hệ thống đã sẵn sàng hoạt động.', DaDoc: false },
      { MaNV1: 'NV002', TieuDe: 'Nhắc nhở chấm công', NoiDung: 'Vui lòng check-in đúng giờ.', DaDoc: false },
      { MaNV1: 'NV004', TieuDe: 'Lương tháng đã được duyệt', NoiDung: 'Bảng lương tháng này đã được xử lý.', DaDoc: false },
    ]);
    console.log('✅ ThongBao seeded');

    console.log('\n🎉 Seed hoàn tất!');
    console.log('📋 Tài khoản demo:');
    console.log('   Admin:    admin / 123456');
    console.log('   HR:       hr / 123456');
    console.log('   Manager:  manager / 123456');
    console.log('   Employee: employee / 123456');
    console.log('   Kế toán:  ketoan / 123456');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed lỗi:', err.message);
    console.error(err);
    process.exit(1);
  }
};

seed();
