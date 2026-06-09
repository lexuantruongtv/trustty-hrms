require('dotenv').config();
const { sequelize, NhanVien, TaiKhoan, DuAn, PhanCong } = require('../models');

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // ── 10 Nhân viên Phòng Kỹ Thuật (PB002) ─────────────────────────────
    const nhanViens = [
      { MaNV1: 'NV010', TenNV: 'Lê Minh Khoa',      Email: 'khoa@trustty.vn',    MaCV: 'CV005' },
      { MaNV1: 'NV011', TenNV: 'Phan Thị Ngọc',     Email: 'ngoc@trustty.vn',    MaCV: 'CV006' },
      { MaNV1: 'NV012', TenNV: 'Trần Quốc Bảo',     Email: 'bao@trustty.vn',     MaCV: 'CV006' },
      { MaNV1: 'NV013', TenNV: 'Nguyễn Thành Đạt',  Email: 'dat@trustty.vn',     MaCV: 'CV006' },
      { MaNV1: 'NV014', TenNV: 'Võ Hoàng Nam',      Email: 'nam@trustty.vn',     MaCV: 'CV005' },
      { MaNV1: 'NV015', TenNV: 'Đinh Thị Hoa',      Email: 'hoa@trustty.vn',     MaCV: 'CV006' },
      { MaNV1: 'NV016', TenNV: 'Bùi Văn Tuấn',      Email: 'tuan@trustty.vn',    MaCV: 'CV006' },
      { MaNV1: 'NV017', TenNV: 'Đặng Thị Lan Anh',  Email: 'lananh@trustty.vn',  MaCV: 'CV006' },
      { MaNV1: 'NV018', TenNV: 'Huỳnh Công Minh',   Email: 'hcminh@trustty.vn',  MaCV: 'CV005' },
      { MaNV1: 'NV019', TenNV: 'Cao Thị Thanh Hà',  Email: 'hatha@trustty.vn',   MaCV: 'CV006' },
    ];

    for (const nv of nhanViens) {
      const [, created] = await NhanVien.findOrCreate({
        where: { MaNV1: nv.MaNV1 },
        defaults: {
          ...nv,
          NgaySinh: '1995-01-01',
          DiaChi: 'Hà Nội',
          SDT: `090${nv.MaNV1.slice(-4)}`,
          MaPB: 'PB002',
          TrangThai: 'Đang làm việc',
        },
      });
      console.log(created ? `✅ Tạo ${nv.TenNV}` : `ℹ️  ${nv.MaNV1} đã tồn tại`);
    }

    // ── 5 Dự án mới ───────────────────────────────────────────────────────
    const duAns = [
      {
        MaDOAN: 'DA004', TenDA: 'AI Customer Service',
        MoTa: 'Hệ thống chatbot AI chăm sóc khách hàng',
        TrangThai: 'Đang thực hiện', NgayBD: '2025-01-01', NgayKT: '2025-12-31',
        ChiPhiDuKien: 400000000, ChiPhiThucTe: 120000000, DoanhThu: 0, TienDo: 30,
      },
      {
        MaDOAN: 'DA005', TenDA: 'Smart Inventory System',
        MoTa: 'Hệ thống quản lý kho thông minh tích hợp IoT',
        TrangThai: 'Đang thực hiện', NgayBD: '2025-03-01', NgayKT: '2025-10-31',
        ChiPhiDuKien: 250000000, ChiPhiThucTe: 80000000, DoanhThu: 0, TienDo: 45,
      },
      {
        MaDOAN: 'DA006', TenDA: 'Payment Gateway v2',
        MoTa: 'Nâng cấp cổng thanh toán hỗ trợ đa tiền tệ',
        TrangThai: 'Hoàn thành', NgayBD: '2024-06-01', NgayKT: '2025-02-28',
        ChiPhiDuKien: 600000000, ChiPhiThucTe: 580000000, DoanhThu: 900000000, TienDo: 100,
      },
      {
        MaDOAN: 'DA007', TenDA: 'Cloud Migration Project',
        MoTa: 'Di chuyển hạ tầng hệ thống lên cloud',
        TrangThai: 'Đang thực hiện', NgayBD: '2025-04-01', NgayKT: '2025-11-30',
        ChiPhiDuKien: 350000000, ChiPhiThucTe: 60000000, DoanhThu: 0, TienDo: 20,
      },
      {
        MaDOAN: 'DA008', TenDA: 'Data Analytics Platform',
        MoTa: 'Nền tảng phân tích dữ liệu và báo cáo BI',
        TrangThai: 'Hoàn thành', NgayBD: '2024-01-01', NgayKT: '2024-11-30',
        ChiPhiDuKien: 500000000, ChiPhiThucTe: 470000000, DoanhThu: 750000000, TienDo: 100,
      },
    ];

    for (const da of duAns) {
      const [, created] = await DuAn.findOrCreate({
        where: { MaDOAN: da.MaDOAN },
        defaults: da,
      });
      console.log(created ? `✅ Tạo dự án ${da.TenDA}` : `ℹ️  ${da.MaDOAN} đã tồn tại`);
    }

    // ── Phân công nhân viên mới vào dự án ────────────────────────────────
    const phanCongs = [
      // DA004
      { MaNV1: 'NV010', MaDOAN: 'DA004', VaiTro: 'Senior Developer',   ThoiGianTG: '2025-01-05' },
      { MaNV1: 'NV011', MaDOAN: 'DA004', VaiTro: 'Lập trình viên',     ThoiGianTG: '2025-01-05' },
      { MaNV1: 'NV012', MaDOAN: 'DA004', VaiTro: 'Kiểm thử',           ThoiGianTG: '2025-01-10' },
      // DA005
      { MaNV1: 'NV013', MaDOAN: 'DA005', VaiTro: 'Lập trình viên',     ThoiGianTG: '2025-03-05' },
      { MaNV1: 'NV014', MaDOAN: 'DA005', VaiTro: 'Senior Developer',   ThoiGianTG: '2025-03-05' },
      { MaNV1: 'NV015', MaDOAN: 'DA005', VaiTro: 'Phân tích',          ThoiGianTG: '2025-03-10' },
      // DA006
      { MaNV1: 'NV016', MaDOAN: 'DA006', VaiTro: 'Lập trình viên',     ThoiGianTG: '2024-06-05' },
      { MaNV1: 'NV017', MaDOAN: 'DA006', VaiTro: 'Kiểm thử',           ThoiGianTG: '2024-06-05' },
      // DA007
      { MaNV1: 'NV018', MaDOAN: 'DA007', VaiTro: 'Senior Developer',   ThoiGianTG: '2025-04-05' },
      { MaNV1: 'NV019', MaDOAN: 'DA007', VaiTro: 'Lập trình viên',     ThoiGianTG: '2025-04-05' },
      // DA008 — để lại NV010, NV014 chưa tham gia dự án nào khác (demo panel rảnh)
      { MaNV1: 'NV012', MaDOAN: 'DA008', VaiTro: 'Kiểm thử',           ThoiGianTG: '2024-01-10' },
      { MaNV1: 'NV016', MaDOAN: 'DA008', VaiTro: 'Lập trình viên',     ThoiGianTG: '2024-01-10' },
    ];

    for (const pc of phanCongs) {
      const [, created] = await PhanCong.findOrCreate({
        where: { MaNV1: pc.MaNV1, MaDOAN: pc.MaDOAN },
        defaults: pc,
      });
      console.log(created ? `✅ Phân công ${pc.MaNV1} → ${pc.MaDOAN}` : `ℹ️  Đã có phân công ${pc.MaNV1}/${pc.MaDOAN}`);
    }

    console.log('\n🎉 Seed hoàn tất!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
};

run();
