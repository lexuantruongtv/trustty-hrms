CREATE DATABASE IF NOT EXISTS QuanLyNhanSu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE QuanLyNhanSu;

-- 1. Bảng PHONG_BAN
CREATE TABLE IF NOT EXISTS PhongBan (
  MaPB    VARCHAR(10)   NOT NULL,
  TenPB   VARCHAR(100)  NOT NULL,
  MoTa    TEXT,
  CONSTRAINT PK_PHONGBAN PRIMARY KEY (MaPB)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Bảng DU_AN
CREATE TABLE IF NOT EXISTS DuAn (
  MaDA          VARCHAR(20)    NOT NULL,
  TenDA         VARCHAR(100)   NOT NULL,
  MoTa          TEXT,
  TrangThai     VARCHAR(50),
  NgayBD        DATE,
  NgayKT        DATE,
  ChiPhiDuKien  DECIMAL(15,2),
  ChiPhiThucTe  DECIMAL(15,2),
  CONSTRAINT PK_DUAN PRIMARY KEY (MaDA)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Bảng CHUC_VU
CREATE TABLE IF NOT EXISTS ChucVu (
  MaCV    VARCHAR(10)   NOT NULL,
  TenCV   VARCHAR(100)  NOT NULL,
  CapBac  INT,
  CONSTRAINT PK_CHUCVU PRIMARY KEY (MaCV)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Bảng NHAN_VIEN
CREATE TABLE IF NOT EXISTS NhanVien (
  MaNV          VARCHAR(20)   NOT NULL,
  TenNV         VARCHAR(100)  NOT NULL,
  NgaySinh      DATE,
  DiaChi        VARCHAR(255),
  SoCCCD        VARCHAR(12)   UNIQUE,
  Email         VARCHAR(100)  UNIQUE,
  SDT           VARCHAR(15),
  TrangThai     VARCHAR(50)   DEFAULT 'Đang làm',
  SoTaiKhoanNH  VARCHAR(20),
  MaPB          VARCHAR(10),
  MaCV          VARCHAR(10),
  CONSTRAINT PK_NHANVIEN PRIMARY KEY (MaNV),
  CONSTRAINT FK_NV_PHONGBAN FOREIGN KEY (MaPB) REFERENCES PhongBan(MaPB) ON DELETE SET NULL,
  CONSTRAINT FK_NV_CHUCVU   FOREIGN KEY (MaCV) REFERENCES ChucVu(MaCV)   ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Bảng TAI_KHOAN
CREATE TABLE IF NOT EXISTS TaiKhoan (
  TenTaiKhoan  VARCHAR(50)   NOT NULL,
  MatKhau      VARCHAR(255)  NOT NULL,
  PhanQuyen    VARCHAR(50)   NOT NULL,
  MaNV         VARCHAR(20),
  CONSTRAINT PK_TAIKHOAN PRIMARY KEY (TenTaiKhoan),
  CONSTRAINT FK_TK_NHANVIEN FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Bảng HOP_DONG
CREATE TABLE IF NOT EXISTS HopDong (
  SoHD    VARCHAR(50)   NOT NULL,
  MaNV    VARCHAR(20),
  LoaiHD  VARCHAR(100),
  NgayKy  DATE          NOT NULL,
  NgayHH  DATE,
  CONSTRAINT PK_HOPDONG PRIMARY KEY (SoHD),
  CONSTRAINT FK_HD_NHANVIEN FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Bảng TRINH_DO
CREATE TABLE IF NOT EXISTS TrinhDo (
  MaTD          INT           NOT NULL AUTO_INCREMENT,
  MaNV          VARCHAR(20),
  TenBangCap    VARCHAR(100)  NOT NULL,
  ChuyenNganh   VARCHAR(100),
  NoiDaoTao     VARCHAR(150),
  NamHoanThanh  INT,
  CONSTRAINT PK_TRINHDO PRIMARY KEY (MaTD),
  CONSTRAINT FK_TD_NHANVIEN FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Bảng BAO_HIEM
CREATE TABLE IF NOT EXISTS BaoHiem (
  MaBH        VARCHAR(20)   NOT NULL,
  MaNV        VARCHAR(20),
  TenBH       VARCHAR(100)  NOT NULL,
  NgayHetHan  DATE,
  CONSTRAINT PK_BAOHIEM PRIMARY KEY (MaBH),
  CONSTRAINT FK_BH_NHANVIEN FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Bảng PHAN_CONG
CREATE TABLE IF NOT EXISTS PhanCong (
  MaNV        VARCHAR(20)  NOT NULL,
  MaDA        VARCHAR(20)  NOT NULL,
  VaiTro      VARCHAR(50),
  ThoiGianTG  DATE,
  CONSTRAINT PK_PHANCONG PRIMARY KEY (MaNV, MaDA),
  CONSTRAINT FK_PC_NHANVIEN FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV) ON DELETE CASCADE,
  CONSTRAINT FK_PC_DUAN     FOREIGN KEY (MaDA) REFERENCES DuAn(MaDA)     ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Bảng CHAM_CONG
CREATE TABLE IF NOT EXISTS ChamCong (
  MaCC      INT           NOT NULL AUTO_INCREMENT,
  MaNV      VARCHAR(20),
  Ngay      DATE          NOT NULL,
  GioVao    TIME,
  GioRa     TIME,
  SoGioLam  FLOAT,
  CONSTRAINT PK_CHAMCONG PRIMARY KEY (MaCC),
  CONSTRAINT FK_CC_NHANVIEN FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Bảng NGHI_PHEP
CREATE TABLE IF NOT EXISTS NghiPhep (
  MaDon      INT           NOT NULL AUTO_INCREMENT,
  MaNV       VARCHAR(20),
  NgayBD     DATE          NOT NULL,
  NgayKT     DATE          NOT NULL,
  LyDo       VARCHAR(255),
  TrangThai  VARCHAR(50)   DEFAULT 'Chờ duyệt',
  CONSTRAINT PK_NGHIPHEP PRIMARY KEY (MaDon),
  CONSTRAINT FK_NP_NHANVIEN FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Bảng BANG_LUONG
CREATE TABLE IF NOT EXISTS BangLuong (
  MaBL      VARCHAR(20)    NOT NULL,
  MaNV      VARCHAR(20),
  Thang     INT            NOT NULL,
  Nam       INT            NOT NULL,
  LuongCB   DECIMAL(15,2)  NOT NULL,
  PhuCap    DECIMAL(15,2)  DEFAULT 0,
  ThueTNCN  DECIMAL(15,2)  DEFAULT 0,
  ThucLinh  DECIMAL(15,2)  NOT NULL,
  CONSTRAINT PK_BANGLUONG PRIMARY KEY (MaBL),
  CONSTRAINT FK_BL_NHANVIEN FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Bảng BIEN_DONG_LUONG
CREATE TABLE IF NOT EXISTS BienDongLuong (
  MaBD           INT           NOT NULL AUTO_INCREMENT,
  MaNV           VARCHAR(20),
  HinhThuc       VARCHAR(100),
  NoiDung        VARCHAR(255),
  GiaTien        DECIMAL(15,2),
  NgayQuyetDinh  DATE,
  CONSTRAINT PK_BIENDONGLUONG PRIMARY KEY (MaBD),
  CONSTRAINT FK_BDL_NHANVIEN FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- DỮ LIỆU MẪU
-- =============================================

INSERT INTO PhongBan (MaPB, TenPB, MoTa) VALUES
('PB001', 'Ban Giám Đốc', 'Lãnh đạo và điều hành công ty'),
('PB002', 'Phòng Hành chính - Nhân sự', 'Quản lý nhân sự và hành chính'),
('PB003', 'Phòng Kế toán', 'Quản lý tài chính và kế toán'),
('PB004', 'Đội Phát triển (Dev)', 'Lập trình và phát triển phần mềm'),
('PB005', 'Đội Kiểm thử (QA)', 'Kiểm thử và đảm bảo chất lượng'),
('PB006', 'Đội Phân tích nghiệp vụ (BA)', 'Phân tích yêu cầu và nghiệp vụ');

INSERT INTO ChucVu (MaCV, TenCV, CapBac) VALUES
('CV001', 'Giám Đốc', 1),
('CV002', 'Trưởng Phòng', 2),
('CV003', 'Phó Phòng', 3),
('CV004', 'Nhân viên Senior', 4),
('CV005', 'Nhân viên', 5),
('CV006', 'Thực tập sinh', 6);

-- Mật khẩu mặc định: TrustTY@2024 (đã mã hóa bcrypt)
INSERT INTO NhanVien (MaNV, TenNV, NgaySinh, DiaChi, SoCCCD, Email, SDT, TrangThai, MaPB, MaCV) VALUES
('NV001', 'Nguyễn Văn An', '1985-03-15', 'Hà Nội', '001085003456', 'an.nguyen@trustty.vn', '0901234567', 'Đang làm', 'PB001', 'CV001'),
('NV002', 'Trần Thị Bình', '1990-07-22', 'TP.HCM', '079090007891', 'binh.tran@trustty.vn', '0912345678', 'Đang làm', 'PB002', 'CV002'),
('NV003', 'Lê Văn Cường', '1992-11-10', 'Đà Nẵng', '048092011234', 'cuong.le@trustty.vn', '0923456789', 'Đang làm', 'PB004', 'CV004'),
('NV004', 'Phạm Thị Dung', '1995-05-18', 'Cần Thơ', '092095005678', 'dung.pham@trustty.vn', '0934567890', 'Đang làm', 'PB004', 'CV005'),
('NV005', 'Hoàng Văn Em', '1993-09-25', 'Hải Phòng', '031093009012', 'em.hoang@trustty.vn', '0945678901', 'Đang làm', 'PB005', 'CV004'),
('NV006', 'Vũ Thị Phương', '1997-01-30', 'Bình Dương', '074097013456', 'phuong.vu@trustty.vn', '0956789012', 'Đang làm', 'PB006', 'CV005');

-- Mật khẩu: TrustTY@2024
INSERT INTO TaiKhoan (TenTaiKhoan, MatKhau, PhanQuyen, MaNV) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhu2', 'Admin', 'NV001'),
('hr.binh', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhu2', 'HR', 'NV002'),
('dev.cuong', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhu2', 'Employee', 'NV003'),
('dev.dung', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhu2', 'Employee', 'NV004'),
('qa.em', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhu2', 'Manager', 'NV005'),
('ba.phuong', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhu2', 'Employee', 'NV006');

INSERT INTO DuAn (MaDA, TenDA, MoTa, TrangThai, NgayBD, NgayKT, ChiPhiDuKien) VALUES
('DA001', 'TrustTY HRMS', 'Hệ thống quản lý nhân sự nội bộ', 'Đang chạy', '2026-01-01', '2026-12-31', 500000000),
('DA002', 'Cổng thông tin khách hàng', 'Portal dành cho khách hàng doanh nghiệp', 'Đang chạy', '2026-03-01', '2026-09-30', 300000000),
('DA003', 'Ứng dụng di động TrustTY', 'App iOS và Android cho nhân viên', 'Hoàn thành', '2025-06-01', '2025-12-31', 200000000);

INSERT INTO PhanCong (MaNV, MaDA, VaiTro, ThoiGianTG) VALUES
('NV003', 'DA001', 'Developer', '2026-01-01'),
('NV004', 'DA001', 'Developer', '2026-01-01'),
('NV005', 'DA001', 'Tester', '2026-01-01'),
('NV006', 'DA001', 'BA', '2026-01-01'),
('NV003', 'DA002', 'Developer', '2026-03-01'),
('NV005', 'DA002', 'Tester', '2026-03-01');

INSERT INTO BangLuong (MaBL, MaNV, Thang, Nam, LuongCB, PhuCap, ThueTNCN, ThucLinh) VALUES
('BL202604NV003', 'NV003', 4, 2026, 18000000, 2000000, 450000, 17050000),
('BL202604NV004', 'NV004', 4, 2026, 12000000, 1500000, 0, 12050000),
('BL202604NV005', 'NV005', 4, 2026, 15000000, 1500000, 150000, 14400000),
('BL202604NV006', 'NV006', 4, 2026, 11000000, 1000000, 0, 10450000);
