const pool = require('../config/database');

async function layTheoDA(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT pc.MaNV, pc.VaiTro, pc.ThoiGianTG,
              nv.TenNV, nv.Email, nv.SDT, pb.TenPB, cv.TenCV
       FROM PhanCong pc
       JOIN NhanVien nv ON pc.MaNV = nv.MaNV
       LEFT JOIN PhongBan pb ON nv.MaPB = pb.MaPB
       LEFT JOIN ChucVu cv ON nv.MaCV = cv.MaCV
       WHERE pc.MaDA = ?`,
      [req.params.maDA]
    );
    res.json(rows);
  } catch (error) {
    console.error('Lỗi lấy phân công theo dự án:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function layTheoNV(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT pc.MaDA, pc.VaiTro, pc.ThoiGianTG,
              da.TenDA, da.TrangThai, da.NgayBD, da.NgayKT
       FROM PhanCong pc
       JOIN DuAn da ON pc.MaDA = da.MaDA
       WHERE pc.MaNV = ?
       ORDER BY pc.ThoiGianTG DESC`,
      [req.params.maNV]
    );
    res.json(rows);
  } catch (error) {
    console.error('Lỗi lấy phân công theo nhân viên:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function phanCong(req, res) {
  const { maNV, maDA, vaiTro, thoiGianTG } = req.body;

  if (!maNV || !maDA || !vaiTro) {
    return res.status(400).json({ message: 'Mã nhân viên, mã dự án và vai trò là bắt buộc' });
  }

  try {
    await pool.query(
      'INSERT INTO PhanCong (MaNV, MaDA, VaiTro, ThoiGianTG) VALUES (?, ?, ?, ?)',
      [maNV, maDA, vaiTro, thoiGianTG || null]
    );
    res.status(201).json({ message: 'Phân công thành công' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Nhân viên đã được phân công vào dự án này' });
    }
    console.error('Lỗi phân công:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function capNhat(req, res) {
  const { vaiTro, thoiGianTG } = req.body;

  if (!vaiTro) {
    return res.status(400).json({ message: 'Vai trò là bắt buộc' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE PhanCong SET VaiTro = ?, ThoiGianTG = ? WHERE MaNV = ? AND MaDA = ?',
      [vaiTro, thoiGianTG || null, req.params.maNV, req.params.maDA]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phân công' });
    }
    res.json({ message: 'Cập nhật phân công thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật phân công:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function huyPhanCong(req, res) {
  try {
    const [result] = await pool.query(
      'DELETE FROM PhanCong WHERE MaNV = ? AND MaDA = ?',
      [req.params.maNV, req.params.maDA]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phân công' });
    }
    res.json({ message: 'Hủy phân công thành công' });
  } catch (error) {
    console.error('Lỗi hủy phân công:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

module.exports = { layTheoDA, layTheoNV, phanCong, capNhat, huyPhanCong };
