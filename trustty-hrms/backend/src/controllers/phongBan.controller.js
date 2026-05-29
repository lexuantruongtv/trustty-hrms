const pool = require('../config/database');

async function layDanhSach(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT pb.MaPB, pb.TenPB, pb.MoTa,
              COUNT(nv.MaNV) AS soNhanVien
       FROM PhongBan pb
       LEFT JOIN NhanVien nv ON pb.MaPB = nv.MaPB AND nv.TrangThai = 'Đang làm'
       GROUP BY pb.MaPB, pb.TenPB, pb.MoTa
       ORDER BY pb.TenPB`
    );
    res.json(rows);
  } catch (error) {
    console.error('Lỗi lấy danh sách phòng ban:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function layChiTiet(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM PhongBan WHERE MaPB = ?',
      [req.params.maPB]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phòng ban' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Lỗi lấy chi tiết phòng ban:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function taoMoi(req, res) {
  const { maPB, tenPB, moTa } = req.body;

  if (!maPB || !tenPB) {
    return res.status(400).json({ message: 'Mã phòng ban và tên phòng ban là bắt buộc' });
  }

  try {
    await pool.query(
      'INSERT INTO PhongBan (MaPB, TenPB, MoTa) VALUES (?, ?, ?)',
      [maPB, tenPB, moTa || null]
    );
    res.status(201).json({ message: 'Tạo phòng ban thành công', maPB });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Mã phòng ban đã tồn tại' });
    }
    console.error('Lỗi tạo phòng ban:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function capNhat(req, res) {
  const { tenPB, moTa } = req.body;

  if (!tenPB) {
    return res.status(400).json({ message: 'Tên phòng ban là bắt buộc' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE PhongBan SET TenPB = ?, MoTa = ? WHERE MaPB = ?',
      [tenPB, moTa || null, req.params.maPB]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phòng ban' });
    }
    res.json({ message: 'Cập nhật phòng ban thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật phòng ban:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function xoa(req, res) {
  try {
    const [nhanVien] = await pool.query(
      'SELECT COUNT(*) AS soLuong FROM NhanVien WHERE MaPB = ?',
      [req.params.maPB]
    );
    if (nhanVien[0].soLuong > 0) {
      return res.status(409).json({ message: 'Không thể xóa phòng ban đang có nhân viên' });
    }

    const [result] = await pool.query(
      'DELETE FROM PhongBan WHERE MaPB = ?',
      [req.params.maPB]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phòng ban' });
    }
    res.json({ message: 'Xóa phòng ban thành công' });
  } catch (error) {
    console.error('Lỗi xóa phòng ban:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

module.exports = { layDanhSach, layChiTiet, taoMoi, capNhat, xoa };
