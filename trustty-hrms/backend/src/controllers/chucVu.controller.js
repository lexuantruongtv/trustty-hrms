const pool = require('../config/database');

async function layDanhSach(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM ChucVu ORDER BY CapBac, TenCV'
    );
    res.json(rows);
  } catch (error) {
    console.error('Lỗi lấy danh sách chức vụ:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function layChiTiet(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM ChucVu WHERE MaCV = ?',
      [req.params.maCV]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy chức vụ' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Lỗi lấy chi tiết chức vụ:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function taoMoi(req, res) {
  const { maCV, tenCV, capBac } = req.body;

  if (!maCV || !tenCV) {
    return res.status(400).json({ message: 'Mã chức vụ và tên chức vụ là bắt buộc' });
  }

  try {
    await pool.query(
      'INSERT INTO ChucVu (MaCV, TenCV, CapBac) VALUES (?, ?, ?)',
      [maCV, tenCV, capBac || null]
    );
    res.status(201).json({ message: 'Tạo chức vụ thành công', maCV });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Mã chức vụ đã tồn tại' });
    }
    console.error('Lỗi tạo chức vụ:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function capNhat(req, res) {
  const { tenCV, capBac } = req.body;

  if (!tenCV) {
    return res.status(400).json({ message: 'Tên chức vụ là bắt buộc' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE ChucVu SET TenCV = ?, CapBac = ? WHERE MaCV = ?',
      [tenCV, capBac || null, req.params.maCV]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy chức vụ' });
    }
    res.json({ message: 'Cập nhật chức vụ thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật chức vụ:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function xoa(req, res) {
  try {
    const [nhanVien] = await pool.query(
      'SELECT COUNT(*) AS soLuong FROM NhanVien WHERE MaCV = ?',
      [req.params.maCV]
    );
    if (nhanVien[0].soLuong > 0) {
      return res.status(409).json({ message: 'Không thể xóa chức vụ đang có nhân viên' });
    }

    const [result] = await pool.query(
      'DELETE FROM ChucVu WHERE MaCV = ?',
      [req.params.maCV]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy chức vụ' });
    }
    res.json({ message: 'Xóa chức vụ thành công' });
  } catch (error) {
    console.error('Lỗi xóa chức vụ:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

module.exports = { layDanhSach, layChiTiet, taoMoi, capNhat, xoa };
