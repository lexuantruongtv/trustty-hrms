require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const phongBanRoutes = require('./routes/phongBan.routes');
const chucVuRoutes = require('./routes/chucVu.routes');
const nhanVienRoutes = require('./routes/nhanVien.routes');
const duAnRoutes = require('./routes/duAn.routes');
const phanCongRoutes = require('./routes/phanCong.routes');
const chamCongRoutes = require('./routes/chamCong.routes');
const nghiPhepRoutes = require('./routes/nghiPhep.routes');
const bangLuongRoutes = require('./routes/bangLuong.routes');
const bienDongLuongRoutes = require('./routes/bienDongLuong.routes');
const hopDongRoutes = require('./routes/hopDong.routes');
const baoHiemRoutes = require('./routes/baoHiem.routes');
const trinhDoRoutes = require('./routes/trinhDo.routes');
const thongKeRoutes = require('./routes/thongKe.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/phong-ban', phongBanRoutes);
app.use('/api/chuc-vu', chucVuRoutes);
app.use('/api/nhan-vien', nhanVienRoutes);
app.use('/api/du-an', duAnRoutes);
app.use('/api/phan-cong', phanCongRoutes);
app.use('/api/cham-cong', chamCongRoutes);
app.use('/api/nghi-phep', nghiPhepRoutes);
app.use('/api/bang-luong', bangLuongRoutes);
app.use('/api/bien-dong-luong', bienDongLuongRoutes);
app.use('/api/hop-dong', hopDongRoutes);
app.use('/api/bao-hiem', baoHiemRoutes);
app.use('/api/trinh-do', trinhDoRoutes);
app.use('/api/thong-ke', thongKeRoutes);

// Xử lý lỗi toàn cục
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server TrustTY HRMS đang chạy tại cổng ${PORT}`);
});
