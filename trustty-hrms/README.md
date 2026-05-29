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

### Cách 1: Chạy bằng Docker (Khuyến nghị)

**Yêu cầu:** Docker Desktop đã được cài đặt và đang chạy.

**Bước 1:** Mở terminal, di chuyển vào thư mục dự án:
```bash
cd trustty-hrms
```

**Bước 2:** Build và khởi động toàn bộ hệ thống:
```bash
docker-compose up --build
```

Lần đầu chạy sẽ mất 3-5 phút để build image. Các lần sau chạy nhanh hơn.

**Bước 3:** Truy cập ứng dụng:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- MySQL: localhost:3306

**Dừng hệ thống:**
```bash
docker-compose down
```

**Dừng và xóa toàn bộ dữ liệu:**
```bash
docker-compose down -v
```

---

### Cách 2: Chạy thủ công (Development)

**Yêu cầu:** Node.js >= 18, MySQL 8.0 đã cài đặt và đang chạy.

#### Bước 1: Thiết lập cơ sở dữ liệu

Đăng nhập MySQL và chạy script khởi tạo:
```bash
mysql -u root -p < database/init.sql
```

#### Bước 2: Cài đặt và chạy Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt các package
npm install

# Sao chép file cấu hình môi trường
copy .env.example .env   # Windows CMD
# hoặc: cp .env.example .env  (Linux/Mac)

# Chỉnh sửa .env nếu cần (mật khẩu MySQL, v.v.)

# Chạy server (development với nodemon)
npm run dev

# Hoặc chạy production
npm start
```

Server sẽ chạy tại: http://localhost:5000

#### Bước 3: Cài đặt và chạy Frontend

Mở terminal mới:
```bash
# Di chuyển vào thư mục frontend
cd frontend

# Cài đặt các package
npm install

# Chạy development server
npm start
```

Ứng dụng sẽ tự động mở tại: http://localhost:3000

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
