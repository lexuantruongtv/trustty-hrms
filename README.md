# TrustTY HRMS

Hệ thống Quản lý Nhân sự cho công ty phần mềm TrustTY.

## Stack

- **Frontend**: ReactJS + Vite + MUI + Zustand + Recharts + Framer Motion
- **Backend**: Node.js + Express + Sequelize ORM
- **Database**: MySQL

## Cài đặt

### 1. Yêu cầu
- Node.js >= 18
- MySQL đang chạy

### 2. Cấu hình database

Tạo database MySQL:
```sql
CREATE DATABASE QuanLyNhanSu;
```

Chỉnh file `backend/.env`:
```
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=QuanLyNhanSu
```

### 3. Cài dependencies

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 4. Seed dữ liệu mẫu

```bash
npm run seed --prefix backend
```

### 5. Chạy hệ thống

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Tài khoản demo

| Role     | Username | Password |
|----------|----------|----------|
| Admin    | admin    | 123456   |
| HR       | hr       | 123456   |
| Manager  | manager  | 123456   |
| Employee | employee | 123456   |

## Cấu trúc thư mục

```
trustty-hrms/
├── backend/
│   └── src/
│       ├── config/       # Database, JWT config
│       ├── controllers/  # Request handlers
│       ├── services/     # Business logic
│       ├── routes/       # API routes
│       ├── middlewares/  # Auth, upload, error handler
│       ├── models/       # Sequelize models
│       ├── utils/        # Helpers
│       └── seeders/      # Seed data
├── frontend/
│   └── src/
│       ├── api/          # Axios API calls
│       ├── components/   # Reusable components
│       ├── contexts/     # Theme context
│       ├── hooks/        # Custom hooks
│       ├── layouts/      # Sidebar, Topbar, MainLayout
│       ├── pages/        # Page components
│       ├── routes/       # Protected routes
│       ├── store/        # Zustand store
│       ├── utils/        # Format helpers
│       └── constants/    # App constants
└── package.json          # Root scripts
```

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | /api/auth/login | Đăng nhập |
| GET | /api/auth/me | Lấy thông tin user |
| GET/POST/PUT/DELETE | /api/employees | Quản lý nhân viên |
| GET/POST/PUT/DELETE | /api/departments | Quản lý phòng ban |
| GET/POST/PUT/DELETE | /api/positions | Quản lý chức vụ |
| GET/POST/PUT/DELETE | /api/projects | Quản lý dự án |
| GET/POST | /api/attendance | Chấm công |
| GET/POST/PUT/DELETE | /api/leave | Nghỉ phép |
| GET/POST | /api/payroll | Bảng lương |
| GET/POST/PUT/DELETE | /api/contracts | Hợp đồng |
| GET/POST/PUT/DELETE | /api/insurance | Bảo hiểm |
| GET/POST/PUT/DELETE | /api/education | Trình độ học vấn |
| GET/PUT | /api/notifications | Thông báo |
| GET | /api/dashboard/stats | Thống kê dashboard |
