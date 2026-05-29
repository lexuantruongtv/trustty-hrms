const pool = require('../config/database');

async function layDanhSach(req, res) {
  const { maNV, trangThai, tuNgay, denNgay } = req.query;
  let query = `
    SELECT np.MaDon, np.MaNV, np.NgayBD, np.NgayKT, np.LyDo, np.TrangThai,
           nv.TenNV, pb.TenPB
    FROM NghiPhep np
    JOIN NhanVien nv ON np.MaNV = nv.MaNV
    LEFT JOIN PhongBan pb ON nv.MaPB = pb.MaPB
    WHERE 1=1
  `;
  const thamSo = [];

  if (maNV) { query += ' AND np.MaNV = ?'; thamSo.push(maNV); }
  if (trangThai) { query += ' AND np.TrangThai = ?'; thamSo.push(trangThai); }
  if (tuNgay) { query += ' AND np.NgayBD >= ?'; thamSo.push(tuNgay); }
  if (denNgay) { query += ' AND np.NgayKT <= ?'; thamSo.push(denNgay); }

  query += ' ORDER BY np.NgayBD DESC';

  try {
    const [rows] = await pool.query(query, thamSo);
    res.json(rows);
  } catch (error) {
    console.error('Lỗi lấy danh sách nghỉ phép:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function layCaNhan(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT MaDon, NgayBD, NgayKT, LyDo, TrangThai
       FROM NghiPhep WHERE MaNV = ? ORDER BY NgayBD DESC`,
      [req.nguoiDung.maNV]
    );
    res.json(rows);
  } catch (error) {
    console.error('Lỗi lấy nghỉ phép cá nhân:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function taoMoi(req, res) {
  const { ngayBD, ngayKT, lyDo } = req.body;

  if (!ngayBD || !ngayKT) {
    return res.status(400).json({ message: 'Ngày bắt đầu và ngày kết thúc là bắt buộc' });
  }

  if (new Date(ngayBD) > new Date(ngayKT)) {
    return res.status(400).json({ message: 'Ngày bắt đầu không được sau ngày kết thúc' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO NghiPhep (MaNV, NgayBD, NgayKT, LyDo, TrangThai)
       VALUES (?, ?, ?, ?, 'Chờ duyệt')`,
      [req.nguoiDung.maNV, ngayBD, ngayKT, lyDo || null]
    );
    res.status(201).json({ message: 'Gửi đơn xin nghỉ phép thành công', maDon: result.insertId });
  } catch (error) {
    console.error('Lỗi tạo đơn nghỉ phép:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function duyetDon(req, res) {
  const { trangThai } = req.body;

  if (!['Đã duyệt', 'Từ chối'].includes(trangThai)) {
    return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE NghiPhep SET TrangThai = ? WHERE MaDon = ? AND TrangThai = 'Chờ duyệt'`,
      [trangThai, req.params.maDon]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hoặc đơn đã được xử lý' });
    }
    res.json({ message: `${trangThai === 'Đã duyệt' ? 'Duyệt' : 'Từ chối'} đơn thành công` });
  } catch (error) {
    console.error('Lỗi duyệt đơn nghỉ phép:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function huyDon(req, res) {
  try {
    const [result] = await pool.query(
      `DELETE FROM NghiPhep WHERE MaDon = ? AND MaNV = ? AND TrangThai = 'Chờ duyệt'`,
      [req.params.maDon, req.nguoiDung.maNV]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hoặc đơn đã được xử lý' });
    }
    res.json({ message: 'Hủy đơn nghỉ phép thành công' });
  } catch (error) {
    console.error('Lỗi hủy đơn nghỉ phép:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

module.exports = { layDanhSach, layCaNhan, taoMoi, duyetDon, huyDon };
