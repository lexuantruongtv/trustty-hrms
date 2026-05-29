/**
 * TrustTY HRMS - Script Seed Dữ Liệu Mẫu
 * =========================================
 * Script này đọc dữ liệu từ seed-data.js, tự động băm (bcrypt) các
 * mật khẩu plain text, rồi insert toàn bộ vào cơ sở dữ liệu.
 *
 * Cách chạy (từ thư mục gốc trustty-hrms/):
 *   node database/seed.js
 *
 * Hoặc với biến môi trường tùy chỉnh:
 *   DB_HOST=localhost DB_USER=root DB_PASSWORD=abc123 node database/seed.js
 *
 * Lưu ý: Script sẽ XÓA toàn bộ dữ liệu cũ trước khi insert lại.
 * Chỉ dùng cho môi trường development.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });

const mysql  = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path   = require('path');

// Khi chạy trong Docker: seed-data.js được mount tại /database/seed-data.js
// Khi chạy local:        seed-data.js nằm cùng thư mục với seed.js
const seedDataPath = process.env.SEED_DATA_PATH
  || path.join(__dirname, 'seed-data.js');

const {
  danhSachPhongBan,
  danhSachChucVu,
  danhSachNhanVien,
  danhSachTaiKhoan,
  danhSachDuAn,
  danhSachPhanCong,
  danhSachBangLuong,
} = require(seedDataPath);

const BCRYPT_SALT_ROUNDS = 10;

const dbConfig = {
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || 'trustty123',
  database: process.env.DB_NAME     || 'QuanLyNhanSu',
  multipleStatements: true,
};

async function seed() {
  console.log('=== TrustTY HRMS - Seed Dữ Liệu Mẫu ===\n');

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log(`✔ Kết nối database thành công (${dbConfig.host}:${dbConfig.port}/${dbConfig.database})\n`);

    // Tắt kiểm tra khóa ngoại để xóa dữ liệu cũ an toàn
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // Xóa dữ liệu cũ theo thứ tự phụ thuộc
    const bangCanXoa = [
      'BangLuong', 'BienDongLuong', 'PhanCong', 'ChamCong',
      'NghiPhep', 'BaoHiem', 'HopDong', 'TrinhDo',
      'TaiKhoan', 'NhanVien', 'DuAn', 'ChucVu', 'PhongBan',
    ];
    for (const bang of bangCanXoa) {
      await connection.query(`DELETE FROM ${bang}`);
    }
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✔ Đã xóa dữ liệu cũ\n');

    // 1. Phòng ban
    for (const pb of danhSachPhongBan) {
      await connection.query(
        'INSERT INTO PhongBan (MaPB, TenPB, MoTa) VALUES (?, ?, ?)',
        [pb.MaPB, pb.TenPB, pb.MoTa]
      );
    }
    console.log(`✔ Đã thêm ${danhSachPhongBan.length} phòng ban`);

    // 2. Chức vụ
    for (const cv of danhSachChucVu) {
      await connection.query(
        'INSERT INTO ChucVu (MaCV, TenCV, CapBac) VALUES (?, ?, ?)',
        [cv.MaCV, cv.TenCV, cv.CapBac]
      );
    }
    console.log(`✔ Đã thêm ${danhSachChucVu.length} chức vụ`);

    // 3. Nhân viên
    for (const nv of danhSachNhanVien) {
      await connection.query(
        `INSERT INTO NhanVien
           (MaNV, TenNV, NgaySinh, DiaChi, SoCCCD, Email, SDT, TrangThai, SoTaiKhoanNH, MaPB, MaCV)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [nv.MaNV, nv.TenNV, nv.NgaySinh, nv.DiaChi, nv.SoCCCD,
         nv.Email, nv.SDT, nv.TrangThai, nv.SoTaiKhoanNH, nv.MaPB, nv.MaCV]
      );
    }
    console.log(`✔ Đã thêm ${danhSachNhanVien.length} nhân viên`);

    // 4. Tài khoản — băm mật khẩu plain text trước khi lưu
    console.log('\n  Đang băm mật khẩu...');
    for (const tk of danhSachTaiKhoan) {
      const matKhauBam = await bcrypt.hash(tk.matKhauGoc, BCRYPT_SALT_ROUNDS);
      await connection.query(
        'INSERT INTO TaiKhoan (TenTaiKhoan, MatKhau, PhanQuyen, MaNV) VALUES (?, ?, ?, ?)',
        [tk.TenTaiKhoan, matKhauBam, tk.PhanQuyen, tk.MaNV]
      );
      console.log(`  ✔ ${tk.TenTaiKhoan.padEnd(12)} | Quyền: ${tk.PhanQuyen.padEnd(8)} | Mật khẩu gốc: ${tk.matKhauGoc}`);
    }
    console.log(`\n✔ Đã thêm ${danhSachTaiKhoan.length} tài khoản`);

    // 5. Dự án
    for (const da of danhSachDuAn) {
      await connection.query(
        `INSERT INTO DuAn (MaDA, TenDA, MoTa, TrangThai, NgayBD, NgayKT, ChiPhiDuKien, ChiPhiThucTe)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [da.MaDA, da.TenDA, da.MoTa, da.TrangThai,
         da.NgayBD, da.NgayKT, da.ChiPhiDuKien, da.ChiPhiThucTe]
      );
    }
    console.log(`✔ Đã thêm ${danhSachDuAn.length} dự án`);

    // 6. Phân công
    for (const pc of danhSachPhanCong) {
      await connection.query(
        'INSERT INTO PhanCong (MaNV, MaDA, VaiTro, ThoiGianTG) VALUES (?, ?, ?, ?)',
        [pc.MaNV, pc.MaDA, pc.VaiTro, pc.ThoiGianTG]
      );
    }
    console.log(`✔ Đã thêm ${danhSachPhanCong.length} phân công`);

    // 7. Bảng lương
    for (const bl of danhSachBangLuong) {
      await connection.query(
        `INSERT INTO BangLuong (MaBL, MaNV, Thang, Nam, LuongCB, PhuCap, ThueTNCN, ThucLinh)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [bl.MaBL, bl.MaNV, bl.Thang, bl.Nam,
         bl.LuongCB, bl.PhuCap, bl.ThueTNCN, bl.ThucLinh]
      );
    }
    console.log(`✔ Đã thêm ${danhSachBangLuong.length} bảng lương`);

    console.log('\n=== Seed hoàn tất! ===');
    console.log('\nDanh sách tài khoản để đăng nhập:');
    console.log('─'.repeat(50));
    danhSachTaiKhoan.forEach((tk) => {
      console.log(`  Tài khoản: ${tk.TenTaiKhoan.padEnd(12)} | Mật khẩu: ${tk.matKhauGoc} | Quyền: ${tk.PhanQuyen}`);
    });
    console.log('─'.repeat(50));

  } catch (error) {
    console.error('\n✖ Lỗi khi seed dữ liệu:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

seed();
