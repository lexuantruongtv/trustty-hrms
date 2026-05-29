const pool = require('../config/database');

async function layDanhSach(req, res) {
  const { maNV, tuNgay, denNgay, maPB } = req.query;
  let query = `
    SELECT cc.MaCC, cc.MaNV, cc.Ngay, cc.GioVao, cc.GioRa, cc.SoGioLam,
           nv.TenNV, pb.TenPB
    FROM ChamCong cc
    JOIN NhanVien nv ON cc.MaNV = nv.MaNV
    LEFT JOIN PhongBan pb ON nv.MaPB = pb.MaPB
    WHERE 1=1
  `;
  const thamSo = [];

  if (maNV) { query += ' AND cc.MaNV = ?'; thamSo.push(maNV); }
  if (tuNgay) { query += ' AND cc.Ngay >= ?'; thamSo.push(tuNgay); }
  if (denNgay) { query += ' AND cc.Ngay <= ?'; thamSo.push(denNgay); }
  if (maPB) { query += ' AND nv.MaPB = ?'; thamSo.push(maPB); }

  query += ' ORDER BY cc.Ngay DESC, cc.GioVao DESC';

  try {
    const [rows] = await pool.query(query, thamSo);
    res.json(rows);
  } catch (error) {
    console.error('Lỗi lấy danh sách chấm công:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function layCaNhan(req, res) {
  const { tuNgay, denNgay } = req.query;
  let query = `
    SELECT MaCC, Ngay, GioVao, GioRa, SoGioLam
    FROM ChamCong
    WHERE MaNV = ?
  `;
  const thamSo = [req.nguoiDung.maNV];

  if (tuNgay) { query += ' AND Ngay >= ?'; thamSo.push(tuNgay); }
  if (denNgay) { query += ' AND Ngay <= ?'; thamSo.push(denNgay); }
  query += ' ORDER BY Ngay DESC';

  try {
    const [rows] = await pool.query(query, thamSo);
    res.json(rows);
  } catch (error) {
    console.error('Lỗi lấy chấm công cá nhân:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function checkIn(req, res) {
  const maNV = req.nguoiDung.maNV;
  const ngayHomNay = new Date().toISOString().split('T')[0];
  const gioVao = new Date().toTimeString().split(' ')[0];

  try {
    const [daCheckIn] = await pool.query(
      'SELECT MaCC FROM ChamCong WHERE MaNV = ? AND Ngay = ?',
      [maNV, ngayHomNay]
    );
    if (daCheckIn.length > 0) {
      return res.status(409).json({ message: 'Bạn đã check-in hôm nay rồi' });
    }

    const [result] = await pool.query(
      'INSERT INTO ChamCong (MaNV, Ngay, GioVao) VALUES (?, ?, ?)',
      [maNV, ngayHomNay, gioVao]
    );
    res.status(201).json({ message: 'Check-in thành công', maCC: result.insertId, gioVao });
  } catch (error) {
    console.error('Lỗi check-in:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function checkOut(req, res) {
  const gioRa = new Date().toTimeString().split(' ')[0];

  try {
    const [rows] = await pool.query(
      'SELECT * FROM ChamCong WHERE MaCC = ? AND MaNV = ?',
      [req.params.maCC, req.nguoiDung.maNV]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi chấm công' });
    }
    if (rows[0].GioRa) {
      return res.status(409).json({ message: 'Bạn đã check-out rồi' });
    }

    const gioVao = rows[0].GioVao;
    const [h1, m1, s1] = gioVao.split(':').map(Number);
    const [h2, m2, s2] = gioRa.split(':').map(Number);
    const soGioLam = ((h2 * 3600 + m2 * 60 + s2) - (h1 * 3600 + m1 * 60 + s1)) / 3600;

    await pool.query(
      'UPDATE ChamCong SET GioRa = ?, SoGioLam = ? WHERE MaCC = ?',
      [gioRa, Math.max(0, soGioLam).toFixed(2), req.params.maCC]
    );
    res.json({ message: 'Check-out thành công', gioRa, soGioLam: Math.max(0, soGioLam).toFixed(2) });
  } catch (error) {
    console.error('Lỗi check-out:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function taoThuCong(req, res) {
  const { maNV, ngay, gioVao, gioRa, soGioLam } = req.body;

  if (!maNV || !ngay) {
    return res.status(400).json({ message: 'Mã nhân viên và ngày là bắt buộc' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO ChamCong (MaNV, Ngay, GioVao, GioRa, SoGioLam) VALUES (?, ?, ?, ?, ?)',
      [maNV, ngay, gioVao || null, gioRa || null, soGioLam || null]
    );
    res.status(201).json({ message: 'Tạo bản ghi chấm công thành công', maCC: result.insertId });
  } catch (error) {
    console.error('Lỗi tạo chấm công thủ công:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function xoa(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM ChamCong WHERE MaCC = ?', [req.params.maCC]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bản ghi chấm công' });
    }
    res.json({ message: 'Xóa bản ghi chấm công thành công' });
  } catch (error) {
    console.error('Lỗi xóa chấm công:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

module.exports = { layDanhSach, layCaNhan, checkIn, checkOut, taoThuCong, xoa };
