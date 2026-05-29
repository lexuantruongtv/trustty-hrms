const pool = require('../config/database');

async function layTheoNV(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM HopDong WHERE MaNV = ? ORDER BY NgayKy DESC',
      [req.params.maNV]
    );
    res.json(rows);
  } catch (error) {
    console.error('Lỗi lấy hợp đồng:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function taoMoi(req, res) {
  const { soHD, maNV, loaiHD, ngayKy, ngayHH } = req.body;

  if (!soHD || !maNV || !ngayKy) {
    return res.status(400).json({ message: 'Số hợp đồng, mã nhân viên và ngày ký là bắt buộc' });
  }

  try {
    await pool.query(
      'INSERT INTO HopDong (SoHD, MaNV, LoaiHD, NgayKy, NgayHH) VALUES (?, ?, ?, ?, ?)',
      [soHD, maNV, loaiHD || null, ngayKy, ngayHH || null]
    );
    res.status(201).json({ message: 'Tạo hợp đồng thành công', soHD });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Số hợp đồng đã tồn tại' });
    }
    console.error('Lỗi tạo hợp đồng:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function capNhat(req, res) {
  const { loaiHD, ngayKy, ngayHH } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE HopDong SET LoaiHD=?, NgayKy=?, NgayHH=? WHERE SoHD=?',
      [loaiHD || null, ngayKy || null, ngayHH || null, req.params.soHD]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
    }
    res.json({ message: 'Cập nhật hợp đồng thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật hợp đồng:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function xoa(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM HopDong WHERE SoHD = ?', [req.params.soHD]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy hợp đồng' });
    }
    res.json({ message: 'Xóa hợp đồng thành công' });
  } catch (error) {
    console.error('Lỗi xóa hợp đồng:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

module.exports = { layTheoNV, taoMoi, capNhat, xoa };
