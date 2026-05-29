const pool = require('../config/database');

// Tỷ lệ bảo hiểm theo quy định hiện hành (phần trăm người lao động đóng)
const TY_LE_BHXH = 0.08;   // 8%
const TY_LE_BHYT = 0.015;  // 1.5%
const TY_LE_BHTN = 0.01;   // 1%
const GIAM_TRU_BAN_THAN = 11000000; // 11 triệu/tháng
const GIAM_TRU_PHU_THUOC = 4400000; // 4.4 triệu/người phụ thuộc

function tinhThueTNCN(thuNhapChiuThue) {
  if (thuNhapChiuThue <= 0) return 0;
  // Biểu thuế lũy tiến 7 bậc
  const bieu = [
    { den: 5000000, ty_le: 0.05 },
    { den: 10000000, ty_le: 0.10 },
    { den: 18000000, ty_le: 0.15 },
    { den: 32000000, ty_le: 0.20 },
    { den: 52000000, ty_le: 0.25 },
    { den: 80000000, ty_le: 0.30 },
    { den: Infinity, ty_le: 0.35 },
  ];

  let thue = 0;
  let conLai = thuNhapChiuThue;
  let nguong = 0;

  for (const bac of bieu) {
    if (conLai <= 0) break;
    const phanTinhThue = Math.min(conLai, bac.den - nguong);
    thue += phanTinhThue * bac.ty_le;
    conLai -= phanTinhThue;
    nguong = bac.den;
  }

  return Math.round(thue);
}

async function layDanhSach(req, res) {
  const { thang, nam, maNV } = req.query;
  let query = `
    SELECT bl.*, nv.TenNV, pb.TenPB
    FROM BangLuong bl
    JOIN NhanVien nv ON bl.MaNV = nv.MaNV
    LEFT JOIN PhongBan pb ON nv.MaPB = pb.MaPB
    WHERE 1=1
  `;
  const thamSo = [];

  if (thang) { query += ' AND bl.Thang = ?'; thamSo.push(thang); }
  if (nam) { query += ' AND bl.Nam = ?'; thamSo.push(nam); }
  if (maNV) { query += ' AND bl.MaNV = ?'; thamSo.push(maNV); }

  query += ' ORDER BY bl.Nam DESC, bl.Thang DESC, nv.TenNV';

  try {
    const [rows] = await pool.query(query, thamSo);
    res.json(rows);
  } catch (error) {
    console.error('Lỗi lấy danh sách bảng lương:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function layCaNhan(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT MaBL, Thang, Nam, LuongCB, PhuCap, ThueTNCN, ThucLinh
       FROM BangLuong WHERE MaNV = ? ORDER BY Nam DESC, Thang DESC`,
      [req.nguoiDung.maNV]
    );
    res.json(rows);
  } catch (error) {
    console.error('Lỗi lấy bảng lương cá nhân:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function layChiTiet(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT bl.*, nv.TenNV, nv.Email, nv.SDT, pb.TenPB, cv.TenCV
       FROM BangLuong bl
       JOIN NhanVien nv ON bl.MaNV = nv.MaNV
       LEFT JOIN PhongBan pb ON nv.MaPB = pb.MaPB
       LEFT JOIN ChucVu cv ON nv.MaCV = cv.MaCV
       WHERE bl.MaBL = ?`,
      [req.params.maBL]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bảng lương' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Lỗi lấy chi tiết bảng lương:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function tinhLuong(req, res) {
  const { thang, nam, congChuan } = req.body;

  if (!thang || !nam) {
    return res.status(400).json({ message: 'Tháng và năm là bắt buộc' });
  }

  const soNgayCongChuan = congChuan || 26;

  try {
    // Lấy tất cả nhân viên đang làm việc
    const [nhanViens] = await pool.query(
      `SELECT nv.MaNV, nv.TenNV,
              COALESCE(bl_cu.LuongCB, 0) AS luongCoBan,
              COALESCE(bl_cu.PhuCap, 0) AS phuCap
       FROM NhanVien nv
       LEFT JOIN BangLuong bl_cu ON nv.MaNV = bl_cu.MaNV
         AND bl_cu.Nam = (SELECT MAX(b2.Nam) FROM BangLuong b2 WHERE b2.MaNV = nv.MaNV)
         AND bl_cu.Thang = (SELECT MAX(b3.Thang) FROM BangLuong b3 WHERE b3.MaNV = nv.MaNV AND b3.Nam = bl_cu.Nam)
       WHERE nv.TrangThai = 'Đang làm'`,
    );

    const ketQua = [];

    for (const nv of nhanViens) {
      // Tính số ngày công thực tế trong tháng
      const [chamCong] = await pool.query(
        `SELECT COUNT(*) AS soCong FROM ChamCong
         WHERE MaNV = ? AND MONTH(Ngay) = ? AND YEAR(Ngay) = ? AND GioRa IS NOT NULL`,
        [nv.MaNV, thang, nam]
      );

      const soCongThucTe = chamCong[0].soCong;
      const luongCoBan = nv.luongCoBan || 0;
      const phuCap = nv.phuCap || 0;

      // Lương theo ngày công thực tế
      const luongTheoNgayCong = (luongCoBan / soNgayCongChuan) * soCongThucTe;

      // Tính bảo hiểm
      const bhxh = luongCoBan * TY_LE_BHXH;
      const bhyt = luongCoBan * TY_LE_BHYT;
      const bhtn = luongCoBan * TY_LE_BHTN;
      const tongBaoHiem = bhxh + bhyt + bhtn;

      // Thu nhập trước thuế
      const thuNhapTruocThue = luongTheoNgayCong + phuCap - tongBaoHiem;

      // Thu nhập chịu thuế (sau giảm trừ bản thân)
      const thuNhapChiuThue = Math.max(0, thuNhapTruocThue - GIAM_TRU_BAN_THAN);

      const thueTNCN = tinhThueTNCN(thuNhapChiuThue);
      const thucLinh = Math.max(0, thuNhapTruocThue - thueTNCN);

      const maBL = `BL${nam}${String(thang).padStart(2, '0')}${nv.MaNV}`;

      // Kiểm tra đã có bảng lương chưa
      const [daCoPhieu] = await pool.query(
        'SELECT MaBL FROM BangLuong WHERE MaNV = ? AND Thang = ? AND Nam = ?',
        [nv.MaNV, thang, nam]
      );

      if (daCoPhieu.length === 0) {
        await pool.query(
          `INSERT INTO BangLuong (MaBL, MaNV, Thang, Nam, LuongCB, PhuCap, ThueTNCN, ThucLinh)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [maBL, nv.MaNV, thang, nam,
           Math.round(luongTheoNgayCong), Math.round(phuCap),
           thueTNCN, Math.round(thucLinh)]
        );
      }

      ketQua.push({
        maNV: nv.MaNV,
        tenNV: nv.TenNV,
        soCongThucTe,
        luongCoBan: Math.round(luongTheoNgayCong),
        phuCap: Math.round(phuCap),
        bhxh: Math.round(bhxh),
        bhyt: Math.round(bhyt),
        bhtn: Math.round(bhtn),
        thueTNCN,
        thucLinh: Math.round(thucLinh),
      });
    }

    res.json({ message: `Tính lương tháng ${thang}/${nam} thành công`, soLuong: ketQua.length, chiTiet: ketQua });
  } catch (error) {
    console.error('Lỗi tính lương:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function taoThuCong(req, res) {
  const { maBL, maNV, thang, nam, luongCB, phuCap, thueTNCN, thucLinh } = req.body;

  if (!maBL || !maNV || !thang || !nam || luongCB === undefined || thucLinh === undefined) {
    return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
  }

  try {
    await pool.query(
      `INSERT INTO BangLuong (MaBL, MaNV, Thang, Nam, LuongCB, PhuCap, ThueTNCN, ThucLinh)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [maBL, maNV, thang, nam, luongCB, phuCap || 0, thueTNCN || 0, thucLinh]
    );
    res.status(201).json({ message: 'Tạo bảng lương thành công', maBL });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Mã bảng lương đã tồn tại' });
    }
    console.error('Lỗi tạo bảng lương:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function capNhat(req, res) {
  const { luongCB, phuCap, thueTNCN, thucLinh } = req.body;

  if (luongCB === undefined || thucLinh === undefined) {
    return res.status(400).json({ message: 'Lương cơ bản và thực lĩnh là bắt buộc' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE BangLuong SET LuongCB=?, PhuCap=?, ThueTNCN=?, ThucLinh=? WHERE MaBL=?',
      [luongCB, phuCap || 0, thueTNCN || 0, thucLinh, req.params.maBL]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bảng lương' });
    }
    res.json({ message: 'Cập nhật bảng lương thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật bảng lương:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function xoa(req, res) {
  try {
    const [result] = await pool.query('DELETE FROM BangLuong WHERE MaBL = ?', [req.params.maBL]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy bảng lương' });
    }
    res.json({ message: 'Xóa bảng lương thành công' });
  } catch (error) {
    console.error('Lỗi xóa bảng lương:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

module.exports = { layDanhSach, layCaNhan, layChiTiet, tinhLuong, taoThuCong, capNhat, xoa };
