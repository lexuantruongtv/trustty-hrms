const pool = require('../config/database');

async function tongQuan(req, res) {
  try {
    const [[{ tongNhanVien }]] = await pool.query(
      "SELECT COUNT(*) AS tongNhanVien FROM NhanVien WHERE TrangThai = 'Đang làm'"
    );
    const [[{ tongDuAn }]] = await pool.query(
      "SELECT COUNT(*) AS tongDuAn FROM DuAn WHERE TrangThai = 'Đang chạy'"
    );
    const [[{ donNghiPhepChoXuLy }]] = await pool.query(
      "SELECT COUNT(*) AS donNghiPhepChoXuLy FROM NghiPhep WHERE TrangThai = 'Chờ duyệt'"
    );
    const [[{ tongPhongBan }]] = await pool.query(
      'SELECT COUNT(*) AS tongPhongBan FROM PhongBan'
    );

    res.json({ tongNhanVien, tongDuAn, donNghiPhepChoXuLy, tongPhongBan });
  } catch (error) {
    console.error('Lỗi lấy thống kê tổng quan:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function nhanSu(req, res) {
  try {
    const [theoPhongBan] = await pool.query(
      `SELECT pb.TenPB, COUNT(nv.MaNV) AS soLuong
       FROM PhongBan pb
       LEFT JOIN NhanVien nv ON pb.MaPB = nv.MaPB AND nv.TrangThai = 'Đang làm'
       GROUP BY pb.MaPB, pb.TenPB
       ORDER BY soLuong DESC`
    );

    const [theoTrangThai] = await pool.query(
      `SELECT TrangThai, COUNT(*) AS soLuong
       FROM NhanVien GROUP BY TrangThai`
    );

    const [theoChucVu] = await pool.query(
      `SELECT cv.TenCV, COUNT(nv.MaNV) AS soLuong
       FROM ChucVu cv
       LEFT JOIN NhanVien nv ON cv.MaCV = nv.MaCV AND nv.TrangThai = 'Đang làm'
       GROUP BY cv.MaCV, cv.TenCV
       ORDER BY soLuong DESC`
    );

    res.json({ theoPhongBan, theoTrangThai, theoChucVu });
  } catch (error) {
    console.error('Lỗi lấy thống kê nhân sự:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function duAn(req, res) {
  try {
    const [theoTrangThai] = await pool.query(
      `SELECT TrangThai, COUNT(*) AS soLuong FROM DuAn GROUP BY TrangThai`
    );

    const [nhanVienChuaPhanCong] = await pool.query(
      `SELECT nv.MaNV, nv.TenNV, pb.TenPB, cv.TenCV
       FROM NhanVien nv
       LEFT JOIN PhongBan pb ON nv.MaPB = pb.MaPB
       LEFT JOIN ChucVu cv ON nv.MaCV = cv.MaCV
       WHERE nv.TrangThai = 'Đang làm'
         AND nv.MaNV NOT IN (
           SELECT DISTINCT pc.MaNV FROM PhanCong pc
           JOIN DuAn da ON pc.MaDA = da.MaDA
           WHERE da.TrangThai = 'Đang chạy'
         )`
    );

    const [phanBoNguonLuc] = await pool.query(
      `SELECT da.TenDA, COUNT(pc.MaNV) AS soNhanVien
       FROM DuAn da
       LEFT JOIN PhanCong pc ON da.MaDA = pc.MaDA
       WHERE da.TrangThai = 'Đang chạy'
       GROUP BY da.MaDA, da.TenDA
       ORDER BY soNhanVien DESC`
    );

    res.json({ theoTrangThai, nhanVienChuaPhanCong, phanBoNguonLuc });
  } catch (error) {
    console.error('Lỗi lấy thống kê dự án:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

async function luong(req, res) {
  const { nam } = req.query;
  const namThongKe = nam || new Date().getFullYear();

  try {
    const [theoThang] = await pool.query(
      `SELECT Thang, SUM(ThucLinh) AS tongThucLinh, COUNT(*) AS soNhanVien
       FROM BangLuong WHERE Nam = ?
       GROUP BY Thang ORDER BY Thang`,
      [namThongKe]
    );

    const [theoPhongBan] = await pool.query(
      `SELECT pb.TenPB, SUM(bl.ThucLinh) AS tongChiPhi
       FROM BangLuong bl
       JOIN NhanVien nv ON bl.MaNV = nv.MaNV
       LEFT JOIN PhongBan pb ON nv.MaPB = pb.MaPB
       WHERE bl.Nam = ?
       GROUP BY pb.MaPB, pb.TenPB
       ORDER BY tongChiPhi DESC`,
      [namThongKe]
    );

    res.json({ theoThang, theoPhongBan, nam: namThongKe });
  } catch (error) {
    console.error('Lỗi lấy thống kê lương:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}

module.exports = { tongQuan, nhanSu, duAn, luong };
