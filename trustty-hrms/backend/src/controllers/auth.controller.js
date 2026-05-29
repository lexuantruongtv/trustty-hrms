const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

async function dangNhap(req, res) {
  const { tenTaiKhoan, matKhau } = req.body;

  if (!tenTaiKhoan || !matKhau) {
    return res.status(400).json({ message: 'Vui lòng nhập tên tài khoản và mật khẩu' });
  }

  try {
    const [rows] = await pool.query(
      `SELECT tk.TenTaiKhoan, tk.MatKhau, tk.PhanQuyen, tk.MaNV,
              nv.TenNV, nv.Email
       FROM TaiKhoan tk
       LEFT JOIN NhanVien nv ON tk.MaNV = nv.MaNV
       WHERE tk.TenTaiKhoan = ?`,
      [tenTaiKhoan]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Tên tài khoản hoặc mật khẩu không đúng' });
    }

    const taiKhoan = rows[0];
    const matKhauHopLe = await bcrypt.compare(matKhau, taiKhoan.MatKhau);

    if (!matKhauHopLe) {
      return res.status(401).json({ message: 'Tên tài khoản hoặc mật khẩu không đúng' });
    }

    const token = jwt.sign(
      {
        tenTaiKhoan: taiKhoan.TenTaiKhoan,
        maNV: taiKhoan.MaNV,
        phanQuyen: taiKhoan.PhanQuyen,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      token,
      nguoiDung: {
        tenTaiKhoan: taiKhoan.TenTaiKhoan,
        maNV: taiKhoan.MaNV,
        tenNV: taiKhoan.TenNV,
        email: taiKhoan.Email,
        phanQuyen: taiKhoan.PhanQuyen,
      },
    });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function layThongTinCaNhan(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT nv.MaNV, nv.TenNV, nv.NgaySinh, nv.DiaChi, nv.SoCCCD,
              nv.Email, nv.SDT, nv.TrangThai, nv.SoTaiKhoanNH,
              pb.TenPB, cv.TenCV, tk.PhanQuyen
       FROM NhanVien nv
       LEFT JOIN PhongBan pb ON nv.MaPB = pb.MaPB
       LEFT JOIN ChucVu cv ON nv.MaCV = cv.MaCV
       LEFT JOIN TaiKhoan tk ON tk.MaNV = nv.MaNV
       WHERE nv.MaNV = ?`,
      [req.nguoiDung.maNV]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thông tin nhân viên' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Lỗi lấy thông tin cá nhân:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function doiMatKhau(req, res) {
  const { matKhauCu, matKhauMoi } = req.body;

  if (!matKhauCu || !matKhauMoi) {
    return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
  }

  if (matKhauMoi.length < 6) {
    return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT MatKhau FROM TaiKhoan WHERE TenTaiKhoan = ?',
      [req.nguoiDung.tenTaiKhoan]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    }

    const matKhauHopLe = await bcrypt.compare(matKhauCu, rows[0].MatKhau);
    if (!matKhauHopLe) {
      return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });
    }

    const matKhauMaHoa = await bcrypt.hash(matKhauMoi, 10);
    await pool.query(
      'UPDATE TaiKhoan SET MatKhau = ? WHERE TenTaiKhoan = ?',
      [matKhauMaHoa, req.nguoiDung.tenTaiKhoan]
    );

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

module.exports = { dangNhap, layThongTinCaNhan, doiMatKhau };
