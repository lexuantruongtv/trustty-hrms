const pool = require('../config/database');

async function layDanhSach(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT bdl.*, nv.TenNV
       FROM BienDongLuong bdl
       JOIN NhanVien nv ON bdl.MaNV = nv.MaNV
       ORDER BY bdl.NgayQuyetDinh DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Lỗi lấy danh sách biến động lương:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function layTheoNV(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM BienDongLuong WHERE MaNV = ? ORDER BY NgayQuyetDinh DESC`,
      [req.params.maNV]
    );
    res.json(rows);
  } catch (error) {
    console.error('Lỗi lấy biến động lương theo nhân viên:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function taoMoi(req, res) {
  const { maNV, hinhThuc, noiDung, giaTien, ngayQuyetDinh } = req.body;

  if (!maNV || !hinhThuc || giaTien === undefined) {
    return res.status(400).json({ message: 'Mã nhân viên, hình thức và giá trị là bắt buộc' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO BienDongLuong (MaNV, HinhThuc, NoiDung, GiaTien, NgayQuyetDinh)
       VALUES (?, ?, ?, ?, ?)`,
      [maNV, hinhThuc, noiDung || null, giaTien, ngayQuyetDinh || null]
    );
    res.status(201).json({ message: 'Tạo biến động lương thành công', maBD: result.insertId });
  } catch (error) {
    console.error('Lỗi tạo biến động lương:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function xoa(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM BienDongLuong WHERE MaBD = ?', [req.params.maBD]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy biến động lương' });
    }
    res.json({ message: 'Xóa biến động lương thành công' });
  } catch (error) {
    console.error('Lỗi xóa biến động lương:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

module.exports = { layDanhSach, layTheoNV, taoMoi, xoa };
