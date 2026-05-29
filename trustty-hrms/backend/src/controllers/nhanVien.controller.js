const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function layDanhSach(req, res) {
  const { tuKhoa, maPB, trangThai } = req.query;

  let query = `
    SELECT nv.MaNV, nv.TenNV, nv.NgaySinh, nv.Email, nv.SDT,
           nv.TrangThai, pb.TenPB, cv.TenCV
    FROM NhanVien nv
    LEFT JOIN PhongBan pb ON nv.MaPB = pb.MaPB
    LEFT JOIN ChucVu cv ON nv.MaCV = cv.MaCV
    WHERE 1=1
  `;
  const thamSo = [];

  if (tuKhoa) {
    query += ' AND (nv.TenNV LIKE ? OR nv.MaNV LIKE ? OR nv.Email LIKE ? OR nv.SDT LIKE ?)';
    const giaTri = `%${tuKhoa}%`;
    thamSo.push(giaTri, giaTri, giaTri, giaTri);
  }
  if (maPB) {
    query += ' AND nv.MaPB = ?';
    thamSo.push(maPB);
  }
  if (trangThai) {
    query += ' AND nv.TrangThai = ?';
    thamSo.push(trangThai);
  }

  query += ' ORDER BY nv.TenNV';

  try {
    const [rows] = await pool.query(query, thamSo);
    res.json(rows);
  } catch (error) {
    console.error('Lỗi lấy danh sách nhân viên:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function layChiTiet(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT nv.*, pb.TenPB, cv.TenCV
       FROM NhanVien nv
       LEFT JOIN PhongBan pb ON nv.MaPB = pb.MaPB
       LEFT JOIN ChucVu cv ON nv.MaCV = cv.MaCV
       WHERE nv.MaNV = ?`,
      [req.params.maNV]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Lỗi lấy chi tiết nhân viên:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function taoMoi(req, res) {
  const {
    maNV, tenNV, ngaySinh, diaChi, soCCCD, email, sDT,
    trangThai, soTaiKhoanNH, maPB, maCV,
    tenTaiKhoan, matKhau, phanQuyen,
  } = req.body;

  if (!maNV || !tenNV || !tenTaiKhoan || !matKhau || !phanQuyen) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(
      `INSERT INTO NhanVien (MaNV, TenNV, NgaySinh, DiaChi, SoCCCD, Email, SDT, TrangThai, SoTaiKhoanNH, MaPB, MaCV)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [maNV, tenNV, ngaySinh || null, diaChi || null, soCCCD || null,
       email || null, sDT || null, trangThai || 'Đang làm',
       soTaiKhoanNH || null, maPB || null, maCV || null]
    );

    const matKhauMaHoa = await bcrypt.hash(matKhau, 10);
    await connection.query(
      'INSERT INTO TaiKhoan (TenTaiKhoan, MatKhau, PhanQuyen, MaNV) VALUES (?, ?, ?, ?)',
      [tenTaiKhoan, matKhauMaHoa, phanQuyen, maNV]
    );

    await connection.commit();
    res.status(201).json({ message: 'Tạo nhân viên thành công', maNV });
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Mã nhân viên, CCCD, email hoặc tên tài khoản đã tồn tại' });
    }
    console.error('Lỗi tạo nhân viên:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  } finally {
    connection.release();
  }
}

async function capNhat(req, res) {
  const {
    tenNV, ngaySinh, diaChi, soCCCD, email, sDT,
    trangThai, soTaiKhoanNH, maPB, maCV,
  } = req.body;

  if (!tenNV) {
    return res.status(400).json({ message: 'Tên nhân viên là bắt buộc' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE NhanVien SET TenNV=?, NgaySinh=?, DiaChi=?, SoCCCD=?, Email=?,
       SDT=?, TrangThai=?, SoTaiKhoanNH=?, MaPB=?, MaCV=?
       WHERE MaNV=?`,
      [tenNV, ngaySinh || null, diaChi || null, soCCCD || null, email || null,
       sDT || null, trangThai || 'Đang làm', soTaiKhoanNH || null,
       maPB || null, maCV || null, req.params.maNV]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    res.json({ message: 'Cập nhật nhân viên thành công' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'CCCD hoặc email đã tồn tại' });
    }
    console.error('Lỗi cập nhật nhân viên:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function xoa(req, res) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM TaiKhoan WHERE MaNV = ?', [req.params.maNV]);
    const [result] = await connection.query(
      'DELETE FROM NhanVien WHERE MaNV = ?',
      [req.params.maNV]
    );
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    await connection.commit();
    res.json({ message: 'Xóa nhân viên thành công' });
  } catch (error) {
    await connection.rollback();
    console.error('Lỗi xóa nhân viên:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  } finally {
    connection.release();
  }
}

module.exports = { layDanhSach, layChiTiet, taoMoi, capNhat, xoa };
