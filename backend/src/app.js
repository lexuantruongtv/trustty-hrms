require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/nhanVien'));
app.use('/api/departments', require('./routes/phongBan'));
app.use('/api/positions', require('./routes/chucVu'));
app.use('/api/projects', require('./routes/duAn'));
app.use('/api/attendance', require('./routes/chamCong'));
app.use('/api/leave', require('./routes/nghiPhep'));
app.use('/api/payroll', require('./routes/luong'));
app.use('/api/contracts', require('./routes/hopDong'));
app.use('/api/insurance', require('./routes/baoHiem'));
app.use('/api/education', require('./routes/trinhDo'));
app.use('/api/notifications', require('./routes/thongBao'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/salary-changes', require('./routes/bienDongLuong'));
app.use('/api/thong-ke', require('./routes/thongKe'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', time: new Date() }));

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  });
