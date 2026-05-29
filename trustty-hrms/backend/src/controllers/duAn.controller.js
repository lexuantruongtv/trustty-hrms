const pool = require('../config/database');

async function layDanhSach(req, res) {
  const { tuKhoa, trangThai } = req.query;
  let query = `
    SELECT da.*, COUNT(pc.MaNV) AS soNhanVien
    FROM DuAn da
    LEFT JOIN PhanCong pc ON da.MaDA = pc.MaDA
    WHERE 1=1
  `;
  const thamSo = [];

  if (tuKhoa) {
    query += ' AND (da.TenDA LIKE ? OR da.MaDA LIKE ?)';
    thamSo.push(`%${tuKhoa}%`, `%${tuKhoa}%`);
  }
  if (trangThai) {
    query += ' AND da.TrangThai = ?';
    thamSo.push(trangThai);
  }

  query += ' GROUP BY da.MaDA ORDER BY da.NgayBD DESC';

  try {
    const [rows] = await pool.query(query, thamSo);
    res.json(rows);
  } catch (error) {
    console.error('Lỗi lấy danh sách dự án:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function layChiTiet(req, res) {
  try {
    const [duAn] = await pool.query('SELECT * FROM DuAn WHERE MaDA = ?', [req.params.maDA]);
    if (duAn.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy dự án' });
    }

    const [thanhVien] = await pool.query(
      `SELECT pc.MaNV, pc.VaiTro, pc.ThoiGianTG, nv.TenNV, pb.TenPB
       FROM PhanCong pc
       JOIN NhanVien nv ON pc.MaNV = nv.MaNV
       LEFT JOIN PhongBan pb ON nv.MaPB = pb.MaPB
       WHERE pc.MaDA = ?`,
      [req.params.maDA]
    );

    res.json({ ...duAn[0], thanhVien });
  } catch (error) {
    console.error('Lỗi lấy chi tiết dự án:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function taoMoi(req, res) {
  const { maDA, tenDA, moTa, trangThai, ngayBD, ngayKT, chiPhiDuKien, chiPhiThucTe } = req.body;

  if (!maDA || !tenDA) {
    return res.status(400).json({ message: 'Mã dự án và tên dự án là bắt buộc' });
  }

  try {
    await pool.query(
      `INSERT INTO DuAn (MaDA, TenDA, MoTa, TrangThai, NgayBD, NgayKT, ChiPhiDuKien, ChiPhiThucTe)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [maDA, tenDA, moTa || null, trangThai || 'Đang chạy',
       ngayBD || null, ngayKT || null, chiPhiDuKien || null, chiPhiThucTe || null]
    );
    res.status(201).json({ message: 'Tạo dự án thành công', maDA });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Mã dự án đã tồn tại' });
    }
    console.error('Lỗi tạo dự án:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function capNhat(req, res) {
  const { tenDA, moTa, trangThai, ngayBD, ngayKT, chiPhiDuKien, chiPhiThucTe } = req.body;

  if (!tenDA) {
    return res.status(400).json({ message: 'Tên dự án là bắt buộc' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE DuAn SET TenDA=?, MoTa=?, TrangThai=?, NgayBD=?, NgayKT=?,
       ChiPhiDuKien=?, ChiPhiThucTe=? WHERE MaDA=?`,
      [tenDA, moTa || null, trangThai || 'Đang chạy',
       ngayBD || null, ngayKT || null, chiPhiDuKien || null,
       chiPhiThucTe || null, req.params.maDA]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy dự án' });
    }
    res.json({ message: 'Cập nhật dự án thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật dự án:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function xoa(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM DuAn WHERE MaDA = ?', [req.params.maDA]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy dự án' });
    }
    res.json({ message: 'Xóa dự án thành công' });
  } catch (error) {
    console.error('Lỗi xóa dự án:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

module.exports = { layDanhSach, layChiTiet, taoMoi, capNhat, xoa };
