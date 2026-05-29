/**
 * TrustTY HRMS - Dữ liệu mẫu (Seed Data)
 * =========================================
 * File này chứa toàn bộ dữ liệu mẫu với mật khẩu ở dạng PLAIN TEXT
 * để dễ đọc, dễ chỉnh sửa.
 *
 * Script seed.js sẽ đọc file này, tự động băm (bcrypt) các mật khẩu
 * rồi insert vào cơ sở dữ liệu.
 *
 * KHÔNG lưu file này lên môi trường production.
 */

const danhSachPhongBan = [
  { MaPB: 'PB001', TenPB: 'Ban Giám Đốc',               MoTa: 'Lãnh đạo và điều hành công ty' },
  { MaPB: 'PB002', TenPB: 'Phòng Hành chính - Nhân sự', MoTa: 'Quản lý nhân sự và hành chính' },
  { MaPB: 'PB003', TenPB: 'Phòng Kế toán',              MoTa: 'Quản lý tài chính và kế toán' },
  { MaPB: 'PB004', TenPB: 'Đội Phát triển (Dev)',        MoTa: 'Lập trình và phát triển phần mềm' },
  { MaPB: 'PB005', TenPB: 'Đội Kiểm thử (QA)',           MoTa: 'Kiểm thử và đảm bảo chất lượng' },
  { MaPB: 'PB006', TenPB: 'Đội Phân tích nghiệp vụ (BA)', MoTa: 'Phân tích yêu cầu và nghiệp vụ' },
];

const danhSachChucVu = [
  { MaCV: 'CV001', TenCV: 'Giám Đốc',         CapBac: 1 },
  { MaCV: 'CV002', TenCV: 'Trưởng Phòng',     CapBac: 2 },
  { MaCV: 'CV003', TenCV: 'Phó Phòng',        CapBac: 3 },
  { MaCV: 'CV004', TenCV: 'Nhân viên Senior', CapBac: 4 },
  { MaCV: 'CV005', TenCV: 'Nhân viên',        CapBac: 5 },
  { MaCV: 'CV006', TenCV: 'Thực tập sinh',    CapBac: 6 },
];

const danhSachNhanVien = [
  {
    MaNV: 'NV001', TenNV: 'Nguyễn Văn An',
    NgaySinh: '1985-03-15', DiaChi: 'Hà Nội',
    SoCCCD: '001085003456', Email: 'an.nguyen@trustty.vn',
    SDT: '0901234567', TrangThai: 'Đang làm',
    SoTaiKhoanNH: '1234567890', MaPB: 'PB001', MaCV: 'CV001',
  },
  {
    MaNV: 'NV002', TenNV: 'Trần Thị Bình',
    NgaySinh: '1990-07-22', DiaChi: 'TP.HCM',
    SoCCCD: '079090007891', Email: 'binh.tran@trustty.vn',
    SDT: '0912345678', TrangThai: 'Đang làm',
    SoTaiKhoanNH: '2345678901', MaPB: 'PB002', MaCV: 'CV002',
  },
  {
    MaNV: 'NV003', TenNV: 'Lê Văn Cường',
    NgaySinh: '1992-11-10', DiaChi: 'Đà Nẵng',
    SoCCCD: '048092011234', Email: 'cuong.le@trustty.vn',
    SDT: '0923456789', TrangThai: 'Đang làm',
    SoTaiKhoanNH: '3456789012', MaPB: 'PB004', MaCV: 'CV004',
  },
  {
    MaNV: 'NV004', TenNV: 'Phạm Thị Dung',
    NgaySinh: '1995-05-18', DiaChi: 'Cần Thơ',
    SoCCCD: '092095005678', Email: 'dung.pham@trustty.vn',
    SDT: '0934567890', TrangThai: 'Đang làm',
    SoTaiKhoanNH: '4567890123', MaPB: 'PB004', MaCV: 'CV005',
  },
  {
    MaNV: 'NV005', TenNV: 'Hoàng Văn Em',
    NgaySinh: '1993-09-25', DiaChi: 'Hải Phòng',
    SoCCCD: '031093009012', Email: 'em.hoang@trustty.vn',
    SDT: '0945678901', TrangThai: 'Đang làm',
    SoTaiKhoanNH: '5678901234', MaPB: 'PB005', MaCV: 'CV004',
  },
  {
    MaNV: 'NV006', TenNV: 'Vũ Thị Phương',
    NgaySinh: '1997-01-30', DiaChi: 'Bình Dương',
    SoCCCD: '074097013456', Email: 'phuong.vu@trustty.vn',
    SDT: '0956789012', TrangThai: 'Đang làm',
    SoTaiKhoanNH: '6789012345', MaPB: 'PB006', MaCV: 'CV005',
  },
];

/**
 * Danh sách tài khoản với mật khẩu PLAIN TEXT.
 * Script seed.js sẽ tự động băm trường matKhauGoc trước khi lưu vào DB.
 *
 * Các quyền hợp lệ: Admin | HR | Manager | Employee
 */
const danhSachTaiKhoan = [
  { TenTaiKhoan: 'admin',      matKhauGoc: 'TrustTY@2024', PhanQuyen: 'Admin',    MaNV: 'NV001' },
  { TenTaiKhoan: 'hr.binh',    matKhauGoc: 'TrustTY@2024', PhanQuyen: 'HR',       MaNV: 'NV002' },
  { TenTaiKhoan: 'dev.cuong',  matKhauGoc: 'TrustTY@2024', PhanQuyen: 'Employee', MaNV: 'NV003' },
  { TenTaiKhoan: 'dev.dung',   matKhauGoc: 'TrustTY@2024', PhanQuyen: 'Employee', MaNV: 'NV004' },
  { TenTaiKhoan: 'qa.em',      matKhauGoc: 'TrustTY@2024', PhanQuyen: 'Manager',  MaNV: 'NV005' },
  { TenTaiKhoan: 'ba.phuong',  matKhauGoc: 'TrustTY@2024', PhanQuyen: 'Employee', MaNV: 'NV006' },
];

const danhSachDuAn = [
  {
    MaDA: 'DA001', TenDA: 'TrustTY HRMS',
    MoTa: 'Hệ thống quản lý nhân sự nội bộ',
    TrangThai: 'Đang chạy', NgayBD: '2026-01-01', NgayKT: '2026-12-31',
    ChiPhiDuKien: 500000000, ChiPhiThucTe: null,
  },
  {
    MaDA: 'DA002', TenDA: 'Cổng thông tin khách hàng',
    MoTa: 'Portal dành cho khách hàng doanh nghiệp',
    TrangThai: 'Đang chạy', NgayBD: '2026-03-01', NgayKT: '2026-09-30',
    ChiPhiDuKien: 300000000, ChiPhiThucTe: null,
  },
  {
    MaDA: 'DA003', TenDA: 'Ứng dụng di động TrustTY',
    MoTa: 'App iOS và Android cho nhân viên',
    TrangThai: 'Hoàn thành', NgayBD: '2025-06-01', NgayKT: '2025-12-31',
    ChiPhiDuKien: 200000000, ChiPhiThucTe: 195000000,
  },
];

const danhSachPhanCong = [
  { MaNV: 'NV003', MaDA: 'DA001', VaiTro: 'Developer', ThoiGianTG: '2026-01-01' },
  { MaNV: 'NV004', MaDA: 'DA001', VaiTro: 'Developer', ThoiGianTG: '2026-01-01' },
  { MaNV: 'NV005', MaDA: 'DA001', VaiTro: 'Tester',    ThoiGianTG: '2026-01-01' },
  { MaNV: 'NV006', MaDA: 'DA001', VaiTro: 'BA',        ThoiGianTG: '2026-01-01' },
  { MaNV: 'NV003', MaDA: 'DA002', VaiTro: 'Developer', ThoiGianTG: '2026-03-01' },
  { MaNV: 'NV005', MaDA: 'DA002', VaiTro: 'Tester',    ThoiGianTG: '2026-03-01' },
];

const danhSachBangLuong = [
  { MaBL: 'BL202604NV003', MaNV: 'NV003', Thang: 4, Nam: 2026, LuongCB: 18000000, PhuCap: 2000000, ThueTNCN: 450000,  ThucLinh: 17050000 },
  { MaBL: 'BL202604NV004', MaNV: 'NV004', Thang: 4, Nam: 2026, LuongCB: 12000000, PhuCap: 1500000, ThueTNCN: 0,       ThucLinh: 12050000 },
  { MaBL: 'BL202604NV005', MaNV: 'NV005', Thang: 4, Nam: 2026, LuongCB: 15000000, PhuCap: 1500000, ThueTNCN: 150000,  ThucLinh: 14400000 },
  { MaBL: 'BL202604NV006', MaNV: 'NV006', Thang: 4, Nam: 2026, LuongCB: 11000000, PhuCap: 1000000, ThueTNCN: 0,       ThucLinh: 10450000 },
];

module.exports = {
  danhSachPhongBan,
  danhSachChucVu,
  danhSachNhanVien,
  danhSachTaiKhoan,
  danhSachDuAn,
  danhSachPhanCong,
  danhSachBangLuong,
};
