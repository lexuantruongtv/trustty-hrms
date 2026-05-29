# TrustTY HRMS - Hệ thống Quản lý Nhân sự

## Cấu trúc dự án

```
trustty-hrms/
├── backend/                    # Node.js + Express + mysql2
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js     # Kết nối MySQL (connection pool)
│   │   ├── middleware/
│   │   │   └── auth.middleware.js  # Xác thực JWT + phân quyền
│   │   ├── routes/             # Định nghĩa các endpoint API
│   │   ├── controllers/        # Xử lý logic nghiệp vụ
│   │   └── server.js           # Entry point
│   ├── .env                    # Biến môi trường
│   ├── Dockerfile
│   └── package.json
├── frontend/                   # ReactJS + Material-UI v5
│   ├── src/
│   │   ├── contexts/
│   │   │   └── AuthContext.js  # Quản lý trạng thái đăng nhập
│   │   ├── services/
│   │   │   └── apiClient.js    # Axios với interceptor tự động gắn token
│   │   ├── components/
│   │   │   ├── Layout.js       # Sidebar + AppBar responsive
│   │   │   └── XacNhanXoaDialog.js
│   │   ├── pages/              # Các trang chức năng
│   │   └── App.js              # Router + Theme
│   ├── .env
│   ├── nginx.conf
│   ├── Dockerfile
│   └── package.json
├── database/
│   └── init.sql                # Script tạo bảng + dữ liệu mẫu
└── docker-compose.yml
```

---

## Hướng dẫn thiết lập và chạy

### Cách 1: Dev mode — chạy cả hai cùng lúc (Khuyến nghị khi phát triển)

Chạy backend + frontend song song bằng **một lệnh duy nhất**, tự động reload khi sửa code.

**Yêu cầu:** Node.js >= 18, MySQL 8.0 đang chạy.

**Bước 1:** Cài đặt tất cả dependencies:
```bash
cd trustty-hrms
npm run install:all
```

**Bước 2:** Khởi tạo cơ sở dữ liệu (chỉ cần làm một lần):
```bash
# Tạo bảng
mysql -u root -p < database/init.sql

# Seed dữ liệu mẫu (tự động băm mật khẩu)
npm run seed
```

**Bước 3:** Chạy cả backend lẫn frontend cùng lúc:
```bash
npm run dev
```

Terminal sẽ hiển thị log màu sắc phân biệt:
- `[BACKEND]` màu cyan — Node.js/Express tại http://localhost:5000
- `[FRONTEND]` màu magenta — React tại http://localhost:3000

Khi sửa file `.js` trong `backend/src/` → nodemon tự restart server.
Khi sửa file trong `frontend/src/` → React Hot Reload cập nhật ngay trên trình duyệt.

---

### Cách 2: Chạy riêng từng service

```bash
# Terminal 1 — Backend
cd trustty-hrms/backend
npm run dev

# Terminal 2 — Frontend
cd trustty-hrms/frontend
npm start
```

---

### Cách 3: Docker (Production / Demo)

```bash
cd trustty-hrms
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- MySQL: localhost:3306

Dừng: `docker-compose down` | Dừng + xóa data: `docker-compose down -v`

---

## Tài khoản mặc định

| Tài khoản | Mật khẩu | Quyền |
|-----------|----------|-------|
| admin | TrustTY@2024 | Admin - Toàn quyền |
| hr.binh | TrustTY@2024 | HR - Quản lý nhân sự |
| qa.em | TrustTY@2024 | Manager - Duyệt nghỉ phép |
| dev.cuong | TrustTY@2024 | Employee - Nhân viên |

---

## Phân quyền hệ thống

| Chức năng | Admin | HR | Manager | Employee |
|-----------|-------|----|---------|----------|
| Quản lý phòng ban/chức vụ | ✅ | ✅ | ❌ | ❌ |
| Thêm/sửa nhân viên | ✅ | ✅ | ❌ | ❌ |
| Xem danh sách nhân viên | ✅ | ✅ | ✅ | ❌ |
| Quản lý dự án | ✅ | ✅ | ✅ | ❌ |
| Xem chấm công tất cả | ✅ | ✅ | ✅ | ❌ |
| Check-in/Check-out | ✅ | ✅ | ✅ | ✅ |
| Duyệt đơn nghỉ phép | ✅ | ✅ | ✅ | ❌ |
| Xin nghỉ phép | ✅ | ✅ | ✅ | ✅ |
| Tính lương tự động | ✅ | ✅ | ❌ | ❌ |
| Xem bảng lương cá nhân | ✅ | ✅ | ✅ | ✅ |
| Thống kê & báo cáo | ✅ | ✅ | ✅ | ❌ |

---

## API Endpoints

### Xác thực
- `POST /api/auth/dang-nhap` - Đăng nhập
- `GET /api/auth/thong-tin-ca-nhan` - Lấy thông tin cá nhân
- `PUT /api/auth/doi-mat-khau` - Đổi mật khẩu

### Nhân viên
- `GET /api/nhan-vien` - Danh sách (hỗ trợ lọc: tuKhoa, maPB, trangThai)
- `GET /api/nhan-vien/:maNV` - Chi tiết
- `POST /api/nhan-vien` - Tạo mới (kèm tài khoản)
- `PUT /api/nhan-vien/:maNV` - Cập nhật
- `DELETE /api/nhan-vien/:maNV` - Xóa

### Chấm công
- `GET /api/cham-cong` - Danh sách (Admin/HR/Manager)
- `GET /api/cham-cong/ca-nhan` - Chấm công cá nhân
- `POST /api/cham-cong/check-in` - Check-in
- `PUT /api/cham-cong/check-out/:maCC` - Check-out

### Bảng lương
- `POST /api/bang-luong/tinh-luong` - Tính lương tự động theo tháng
  - Tự động tính: BHXH (8%), BHYT (1.5%), BHTN (1%), thuế TNCN lũy tiến 7 bậc

### Thống kê
- `GET /api/thong-ke/tong-quan` - Số liệu tổng quan dashboard
- `GET /api/thong-ke/nhan-su` - Thống kê nhân sự theo phòng ban, chức vụ
- `GET /api/thong-ke/du-an` - Thống kê dự án, nhân viên chưa phân công
- `GET /api/thong-ke/luong?nam=2026` - Thống kê chi phí lương theo tháng/phòng ban
