const pool = require('../config/database');

async function layTheoNV(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM TrinhDo WHERE MaNV = ? ORDER BY NamHoanThanh DESC',
      [req.params.maNV]
    );
    res.json(rows);
  } catch (error) {
    console.error('Lỗi lấy trình độ:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function taoMoi(req, res) {
  const { maNV, tenBangCap, chuyenNganh, noiDaoTao, namHoanThanh } = req.body;

  if (!maNV || !tenBangCap) {
    return res.status(400).json({ message: 'Mã nhân viên và tên bằng cấp là bắt buộc' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO TrinhDo (MaNV, TenBangCap, ChuyenNganh, NoiDaoTao, NamHoanThanh)
       VALUES (?, ?, ?, ?, ?)`,
      [maNV, tenBangCap, chuyenNganh || null, noiDaoTao || null, namHoanThanh || null]
    );
    res.status(201).json({ message: 'Thêm trình độ thành công', maTD: result.insertId });
  } catch (error) {
    console.error('Lỗi thêm trình độ:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function capNhat(req, res) {
  const { tenBangCap, chuyenNganh, noiDaoTao, namHoanThanh } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE TrinhDo SET TenBangCap=?, ChuyenNganh=?, NoiDaoTao=?, NamHoanThanh=? WHERE MaTD=?',
      [tenBangCap || null, chuyenNganh || null, noiDaoTao || null, namHoanThanh || null, req.params.maTD]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy trình độ' });
    }
    res.json({ message: 'Cập nhật trình độ thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật trình độ:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function xoa(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM TrinhDo WHERE MaTD = ?', [req.params.maTD]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy trình độ' });
    }
    res.json({ message: 'Xóa trình độ thành công' });
  } catch (error) {
    console.error('Lỗi xóa trình độ:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

module.exports = { layTheoNV, taoMoi, capNhat, xoa };
