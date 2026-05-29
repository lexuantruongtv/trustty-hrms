const pool = require('../config/database');

async function layTheoNV(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM BaoHiem WHERE MaNV = ? ORDER BY TenBH',
      [req.params.maNV]
    );
    res.json(rows);
  } catch (error) {
    console.error('Lỗi lấy bảo hiểm:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function taoMoi(req, res) {
  const { maBH, maNV, tenBH, ngayHetHan } = req.body;

  if (!maBH || !maNV || !tenBH) {
    return res.status(400).json({ message: 'Mã bảo hiểm, mã nhân viên và tên bảo hiểm là bắt buộc' });
  }

  try {
    await pool.query(
      'INSERT INTO BaoHiem (MaBH, MaNV, TenBH, NgayHetHan) VALUES (?, ?, ?, ?)',
      [maBH, maNV, tenBH, ngayHetHan || null]
    );
    res.status(201).json({ message: 'Tạo bảo hiểm thành công', maBH });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Mã bảo hiểm đã tồn tại' });
    }
    console.error('Lỗi tạo bảo hiểm:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function capNhat(req, res) {
  const { tenBH, ngayHetHan } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE BaoHiem SET TenBH=?, NgayHetHan=? WHERE MaBH=?',
      [tenBH || null, ngayHetHan || null, req.params.maBH]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bảo hiểm' });
    }
    res.json({ message: 'Cập nhật bảo hiểm thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật bảo hiểm:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function xoa(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM BaoHiem WHERE MaBH = ?', [req.params.maBH]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bảo hiểm' });
    }
    res.json({ message: 'Xóa bảo hiểm thành công' });
  } catch (error) {
    console.error('Lỗi xóa bảo hiểm:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

module.exports = { layTheoNV, taoMoi, capNhat, xoa };
