-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th6 04, 2026 lúc 02:14 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `quanlynhansu`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bangluong`
--

CREATE TABLE `bangluong` (
  `MaBL` char(20) NOT NULL,
  `MaNV1` char(20) DEFAULT NULL,
  `Thang` int(11) DEFAULT NULL,
  `Nam` int(11) DEFAULT NULL,
  `LuongCB` decimal(18,2) DEFAULT NULL,
  `PhuCap` decimal(18,2) DEFAULT NULL,
  `ThueTNCN` decimal(18,2) DEFAULT NULL,
  `ThucLinh` decimal(18,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `bangluong`
--

INSERT INTO `bangluong` (`MaBL`, `MaNV1`, `Thang`, `Nam`, `LuongCB`, `PhuCap`, `ThueTNCN`, `ThucLinh`) VALUES
('BL001', 'NV001', 5, 2026, 30000000.00, 5000000.00, 3000000.00, 32000000.00),
('BL002', 'NV002', 5, 2026, 20000000.00, 3000000.00, 2000000.00, 21000000.00),
('BL003', 'NV003', 5, 2026, 25000000.00, 4000000.00, 2500000.00, 26500000.00),
('BL004', 'NV004', 5, 2026, 15000000.00, 2000000.00, 1500000.00, 15500000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `baohiem`
--

CREATE TABLE `baohiem` (
  `MaBH` char(20) NOT NULL,
  `MaNV1` char(20) DEFAULT NULL,
  `TenBH` varchar(100) DEFAULT NULL,
  `NgayHetHan` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `biendongluong`
--

CREATE TABLE `biendongluong` (
  `MaBD` int(11) NOT NULL,
  `MaNV1` char(20) DEFAULT NULL,
  `HinhThuc` varchar(100) DEFAULT NULL,
  `NoiDung` varchar(255) DEFAULT NULL,
  `NgayQuyetDinh` date DEFAULT NULL,
  `GiaTien` decimal(15,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `biendongluong`
--

INSERT INTO `biendongluong` (`MaBD`, `MaNV1`, `HinhThuc`, `NoiDung`, `NgayQuyetDinh`, `GiaTien`) VALUES
(3, 'NV004', 'Tăng lương', 'Thưởng tăng ca', '2026-05-14', 50000.00),
(4, 'NV004', 'Giảm lương', 'Đi trễ', '2026-05-06', -300000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chamcong`
--

CREATE TABLE `chamcong` (
  `MaCC` int(11) NOT NULL,
  `MaNV1` char(20) DEFAULT NULL,
  `Ngay` date DEFAULT NULL,
  `GioVao` time DEFAULT NULL,
  `GioRa` time DEFAULT NULL,
  `SoGioLam` float DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `chamcong`
--

INSERT INTO `chamcong` (`MaCC`, `MaNV1`, `Ngay`, `GioVao`, `GioRa`, `SoGioLam`) VALUES
(1, 'NV004', '2026-05-29', '10:12:22', '10:12:28', 0),
(2, 'NV002', '2026-05-29', '10:16:55', '10:17:07', 0.02),
(3, 'NV003', '2026-05-29', '10:29:35', '10:31:24', 0.03),
(4, 'NV004', '2026-06-04', '07:07:26', NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `chucvu`
--

CREATE TABLE `chucvu` (
  `MaCV` char(10) NOT NULL,
  `TenCV` varchar(100) DEFAULT NULL,
  `CapBac` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `chucvu`
--

INSERT INTO `chucvu` (`MaCV`, `TenCV`, `CapBac`) VALUES
('CV001', 'Giám Đốc', 1),
('CV002', 'Trưởng Phòng', 2),
('CV003', 'Nhân Viên', 3),
('CV004', 'Thực Tập Sinh', 4),
('CV005', 'Senior Developer', 2),
('CV006', 'Junior Developer', 3),
('CV007', 'Quản Lý', 2);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `duan`
--

CREATE TABLE `duan` (
  `MaDOAN` char(20) NOT NULL,
  `TenDA` varchar(100) DEFAULT NULL,
  `MoTa` text DEFAULT NULL,
  `TrangThai` varchar(50) DEFAULT 'Đang thực hiện',
  `NgayBD` date DEFAULT NULL,
  `NgayKT` date DEFAULT NULL,
  `ChiPhiDuKien` decimal(18,2) DEFAULT NULL,
  `ChiPhiThucTe` decimal(18,2) DEFAULT NULL,
  `TienDo` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `duan`
--

INSERT INTO `duan` (`MaDOAN`, `TenDA`, `MoTa`, `TrangThai`, `NgayBD`, `NgayKT`, `ChiPhiDuKien`, `ChiPhiThucTe`, `TienDo`) VALUES
('DA001', 'TrustTY HRMS', 'Hệ thống quản lý nhân sự', 'Đang thực hiện', '2024-01-01', '2024-12-31', 500000000.00, 200000000.00, 0),
('DA002', 'E-Commerce Platform', 'Nền tảng thương mại điện tử', 'Đang thực hiện', '2024-03-01', '2024-09-30', 300000000.00, 150000000.00, 14),
('DA003', 'Mobile Banking App', 'Ứng dụng ngân hàng di động', 'Hoàn thành', '2023-06-01', '2024-01-31', 800000000.00, 820000000.00, 100);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `ghichuduan`
--

CREATE TABLE `ghichuduan` (
  `MaGC` int(11) NOT NULL,
  `MaDOAN` char(20) NOT NULL,
  `MaNV1` char(20) NOT NULL,
  `NoiDung` text NOT NULL,
  `NgayTao` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `ghichuduan`
--

INSERT INTO `ghichuduan` (`MaGC`, `MaDOAN`, `MaNV1`, `NoiDung`, `NgayTao`) VALUES
(1, 'DA002', 'NV004', 'Đã fix lỗi A001', '2026-06-02 16:31:57'),
(2, 'DA002', 'NV003', 'Oke tốt', '2026-06-02 17:21:30'),
(3, 'DA002', 'NV003', 'Hoàng Văn Minh chuyển giao dự án qua phía Tester nhé', '2026-06-02 17:24:33');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hopdong`
--

CREATE TABLE `hopdong` (
  `SoHD` char(50) NOT NULL,
  `MaNV1` char(20) DEFAULT NULL,
  `LoaiHD` varchar(100) DEFAULT NULL,
  `NgayKy` date DEFAULT NULL,
  `NgayHH` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `hopdong`
--

INSERT INTO `hopdong` (`SoHD`, `MaNV1`, `LoaiHD`, `NgayKy`, `NgayHH`) VALUES
('HD001', 'NV004', 'Thời vụ', '2026-04-01', '2028-04-01');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nghiphep`
--

CREATE TABLE `nghiphep` (
  `MaDon` int(11) NOT NULL,
  `MaNV1` char(20) DEFAULT NULL,
  `NgayBD` date DEFAULT NULL,
  `NgayKT` date DEFAULT NULL,
  `LyDo` varchar(255) DEFAULT NULL,
  `TrangThai` varchar(50) DEFAULT 'Chờ duyệt'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `nghiphep`
--

INSERT INTO `nghiphep` (`MaDon`, `MaNV1`, `NgayBD`, `NgayKT`, `LyDo`, `TrangThai`) VALUES
(4, 'NV004', '2026-06-02', '2026-06-03', 'Bệnh', 'Chờ duyệt');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nhanvien`
--

CREATE TABLE `nhanvien` (
  `MaNV1` char(20) NOT NULL,
  `TenNV` varchar(100) DEFAULT NULL,
  `NgaySinh` date DEFAULT NULL,
  `DiaChi` varchar(255) DEFAULT NULL,
  `SoCCCD` char(12) DEFAULT NULL,
  `Email` char(100) DEFAULT NULL,
  `SDT` char(15) DEFAULT NULL,
  `TrangThai` varchar(50) DEFAULT 'Đang làm việc',
  `SoTaiKhoanNN` char(20) DEFAULT NULL,
  `MaCV` char(10) DEFAULT NULL,
  `MaPB` char(10) DEFAULT NULL,
  `Avatar` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `nhanvien`
--

INSERT INTO `nhanvien` (`MaNV1`, `TenNV`, `NgaySinh`, `DiaChi`, `SoCCCD`, `Email`, `SDT`, `TrangThai`, `SoTaiKhoanNN`, `MaCV`, `MaPB`, `Avatar`) VALUES
('NV001', 'Trần Trung Quân', '1985-01-15', 'Hà Nội', NULL, 'admin@trustty.vn', '0901234567', 'Đang làm việc', NULL, 'CV001', 'PB001', NULL),
('NV002', 'Trần Thị Cúc', '1990-05-20', 'TP.HCM', NULL, 'hr@trustty.vn', '0902345678', 'Đang làm việc', NULL, 'CV002', 'PB003', NULL),
('NV003', 'Nguyễn Tuấn Tú', '1988-08-10', 'Đà Nẵng', NULL, 'manager@trustty.vn', '0903456789', 'Đang làm việc', NULL, 'CV007', 'PB002', NULL),
('NV004', 'Phạm Thị Mỹ Hương', '1995-12-25', 'Cần Thơ', NULL, 'employee@trustty.vn', '0904567890', 'Đang làm việc', NULL, 'CV003', 'PB002', NULL),
('NV005', 'Hoàng Văn Minh', '1992-03-18', 'Hà Nội', NULL, 'minh@trustty.vn', '0905678901', 'Đang làm việc', NULL, 'CV005', 'PB002', NULL),
('NV006', 'Nguyễn Thị Lan', '1993-07-22', 'TP.HCM', NULL, 'lan@trustty.vn', '0906789012', 'Đang làm việc', NULL, 'CV003', 'PB004', NULL),
('NV007', 'Trần Văn Hùng', '1991-11-05', 'Hà Nội', NULL, 'hung@trustty.vn', '0907890123', 'Đang làm việc', NULL, 'CV003', 'PB005', NULL),
('NV008', 'Nguyễn Văn Đạt', '1990-04-10', 'Hà Nội', NULL, 'vandat@trustty.vn', '0908000001', 'Đang làm việc', NULL, 'CV002', 'PB004', NULL),
('NV009', 'Đạt Văn Tây', '1987-06-15', 'Hà Nội', NULL, 'truongphong@trustty.vn', '0909000001', 'Đang làm việc', NULL, 'CV002', 'PB002', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `phancong`
--

CREATE TABLE `phancong` (
  `MaNV1` char(20) NOT NULL,
  `MaDOAN` char(20) NOT NULL,
  `VaiTro` varchar(50) DEFAULT NULL,
  `ThoiGianTG` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `phancong`
--

INSERT INTO `phancong` (`MaNV1`, `MaDOAN`, `VaiTro`, `ThoiGianTG`) VALUES
('NV003', 'DA002', 'Quản lý dự án', '2026-06-01'),
('NV004', 'DA002', 'Lập trình viên', '2026-06-02'),
('NV005', 'DA002', 'Thiết kế', '2026-06-03');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `phongban`
--

CREATE TABLE `phongban` (
  `MaPB` char(10) NOT NULL,
  `TenPB` varchar(100) DEFAULT NULL,
  `MoTa` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `phongban`
--

INSERT INTO `phongban` (`MaPB`, `TenPB`, `MoTa`) VALUES
('PB001', 'Ban Giám Đốc', 'Lãnh đạo công ty'),
('PB002', 'Phòng Kỹ Thuật', 'Phát triển phần mềm'),
('PB003', 'Phòng Nhân Sự', 'Quản lý nhân sự'),
('PB004', 'Phòng Kế Toán', 'Tài chính kế toán'),
('PB005', 'Phòng Marketing', 'Marketing & Sales');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `taikhoan`
--

CREATE TABLE `taikhoan` (
  `TenTaiKhoan` char(50) NOT NULL,
  `MaNV1` char(20) DEFAULT NULL,
  `MatKhau` char(255) DEFAULT NULL,
  `PhanQuyen` varchar(50) DEFAULT 'Employee'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `taikhoan`
--

INSERT INTO `taikhoan` (`TenTaiKhoan`, `MaNV1`, `MatKhau`, `PhanQuyen`) VALUES
('admin', 'NV001', '123456', 'Admin'),
('employee', 'NV004', '123456', 'Employee'),
('hr', 'NV002', '123456', 'HR'),
('ketoan', 'NV008', '123456', 'Ketoan'),
('manager', 'NV003', '123456', 'Manager'),
('truongphong', 'NV009', '123456', 'TruongPhong');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `thongbao`
--

CREATE TABLE `thongbao` (
  `MaTB` int(11) NOT NULL,
  `MaNV1` char(20) DEFAULT NULL,
  `TieuDe` varchar(200) DEFAULT NULL,
  `NoiDung` text DEFAULT NULL,
  `DaDoc` tinyint(1) DEFAULT 0,
  `NgayTao` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `thongbao`
--

INSERT INTO `thongbao` (`MaTB`, `MaNV1`, `TieuDe`, `NoiDung`, `DaDoc`, `NgayTao`) VALUES
(1, 'NV001', 'Chào mừng đến TrustTY HRMS', 'Hệ thống đã sẵn sàng hoạt động.', 1, '2026-05-29 03:07:52'),
(2, 'NV002', 'Nhắc nhở chấm công', 'Vui lòng check-in đúng giờ.', 1, '2026-05-29 03:07:52'),
(3, 'NV004', 'Lương tháng đã được duyệt', 'Bảng lương tháng này đã được xử lý.', 1, '2026-05-29 03:07:52');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `trinhdo`
--

CREATE TABLE `trinhdo` (
  `MaTD` int(11) NOT NULL,
  `MaNV1` char(20) DEFAULT NULL,
  `TenBangCap` varchar(100) DEFAULT NULL,
  `ChuyenNganh` varchar(100) DEFAULT NULL,
  `NoiDaoTao` varchar(150) DEFAULT NULL,
  `NamHoanThanh` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `trinhdo`
--

INSERT INTO `trinhdo` (`MaTD`, `MaNV1`, `TenBangCap`, `ChuyenNganh`, `NoiDaoTao`, `NamHoanThanh`) VALUES
(2, 'NV004', 'Đại học Chính Quy', 'CNTT', 'Đại học Trà Vinh', 2024);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `bangluong`
--
ALTER TABLE `bangluong`
  ADD PRIMARY KEY (`MaBL`),
  ADD KEY `MaNV1` (`MaNV1`);

--
-- Chỉ mục cho bảng `baohiem`
--
ALTER TABLE `baohiem`
  ADD PRIMARY KEY (`MaBH`),
  ADD KEY `MaNV1` (`MaNV1`);

--
-- Chỉ mục cho bảng `biendongluong`
--
ALTER TABLE `biendongluong`
  ADD PRIMARY KEY (`MaBD`),
  ADD KEY `MaNV1` (`MaNV1`);

--
-- Chỉ mục cho bảng `chamcong`
--
ALTER TABLE `chamcong`
  ADD PRIMARY KEY (`MaCC`),
  ADD KEY `MaNV1` (`MaNV1`);

--
-- Chỉ mục cho bảng `chucvu`
--
ALTER TABLE `chucvu`
  ADD PRIMARY KEY (`MaCV`);

--
-- Chỉ mục cho bảng `duan`
--
ALTER TABLE `duan`
  ADD PRIMARY KEY (`MaDOAN`);

--
-- Chỉ mục cho bảng `ghichuduan`
--
ALTER TABLE `ghichuduan`
  ADD PRIMARY KEY (`MaGC`),
  ADD KEY `MaDOAN` (`MaDOAN`),
  ADD KEY `MaNV1` (`MaNV1`);

--
-- Chỉ mục cho bảng `hopdong`
--
ALTER TABLE `hopdong`
  ADD PRIMARY KEY (`SoHD`),
  ADD KEY `MaNV1` (`MaNV1`);

--
-- Chỉ mục cho bảng `nghiphep`
--
ALTER TABLE `nghiphep`
  ADD PRIMARY KEY (`MaDon`),
  ADD KEY `MaNV1` (`MaNV1`);

--
-- Chỉ mục cho bảng `nhanvien`
--
ALTER TABLE `nhanvien`
  ADD PRIMARY KEY (`MaNV1`),
  ADD KEY `MaCV` (`MaCV`),
  ADD KEY `MaPB` (`MaPB`);

--
-- Chỉ mục cho bảng `phancong`
--
ALTER TABLE `phancong`
  ADD PRIMARY KEY (`MaNV1`,`MaDOAN`),
  ADD UNIQUE KEY `PhanCong_MaDOAN_MaNV1_unique` (`MaNV1`,`MaDOAN`),
  ADD KEY `MaDOAN` (`MaDOAN`);

--
-- Chỉ mục cho bảng `phongban`
--
ALTER TABLE `phongban`
  ADD PRIMARY KEY (`MaPB`);

--
-- Chỉ mục cho bảng `taikhoan`
--
ALTER TABLE `taikhoan`
  ADD PRIMARY KEY (`TenTaiKhoan`),
  ADD KEY `MaNV1` (`MaNV1`);

--
-- Chỉ mục cho bảng `thongbao`
--
ALTER TABLE `thongbao`
  ADD PRIMARY KEY (`MaTB`),
  ADD KEY `MaNV1` (`MaNV1`);

--
-- Chỉ mục cho bảng `trinhdo`
--
ALTER TABLE `trinhdo`
  ADD PRIMARY KEY (`MaTD`),
  ADD KEY `MaNV1` (`MaNV1`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `biendongluong`
--
ALTER TABLE `biendongluong`
  MODIFY `MaBD` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `chamcong`
--
ALTER TABLE `chamcong`
  MODIFY `MaCC` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `ghichuduan`
--
ALTER TABLE `ghichuduan`
  MODIFY `MaGC` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `nghiphep`
--
ALTER TABLE `nghiphep`
  MODIFY `MaDon` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `thongbao`
--
ALTER TABLE `thongbao`
  MODIFY `MaTB` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `trinhdo`
--
ALTER TABLE `trinhdo`
  MODIFY `MaTD` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `bangluong`
--
ALTER TABLE `bangluong`
  ADD CONSTRAINT `bangluong_ibfk_1` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_10` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_11` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_12` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_13` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_14` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_15` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_16` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_17` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_18` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_19` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_2` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_20` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_21` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_22` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_23` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_24` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_25` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_26` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_27` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_28` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_29` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_3` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_30` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_31` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_32` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_33` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_34` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_35` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_36` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_37` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_38` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_4` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_5` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_6` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_7` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_8` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bangluong_ibfk_9` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `baohiem`
--
ALTER TABLE `baohiem`
  ADD CONSTRAINT `baohiem_ibfk_1` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_10` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_11` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_12` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_13` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_14` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_15` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_16` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_17` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_18` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_19` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_2` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_20` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_21` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_22` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_23` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_24` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_25` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_26` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_27` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_28` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_29` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_3` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_30` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_31` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_32` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_33` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_34` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_35` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_36` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_37` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_4` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_5` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_6` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_7` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_8` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `baohiem_ibfk_9` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `biendongluong`
--
ALTER TABLE `biendongluong`
  ADD CONSTRAINT `biendongluong_ibfk_1` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_10` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_11` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_12` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_13` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_14` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_15` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_16` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_17` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_18` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_19` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_2` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_20` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_21` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_22` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_23` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_24` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_25` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_26` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_27` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_28` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_29` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_3` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_30` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_31` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_32` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_33` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_34` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_35` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_36` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_37` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_38` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_4` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_5` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_6` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_7` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_8` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `biendongluong_ibfk_9` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `chamcong`
--
ALTER TABLE `chamcong`
  ADD CONSTRAINT `chamcong_ibfk_1` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_10` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_11` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_12` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_13` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_14` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_15` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_16` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_17` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_18` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_19` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_2` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_20` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_21` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_22` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_23` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_24` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_25` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_26` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_27` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_28` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_29` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_3` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_30` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_31` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_32` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_33` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_34` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_35` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_36` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_37` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_38` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_4` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_5` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_6` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_7` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_8` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `chamcong_ibfk_9` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `ghichuduan`
--
ALTER TABLE `ghichuduan`
  ADD CONSTRAINT `ghichuduan_ibfk_1` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_10` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_11` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_12` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_13` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_14` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_15` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_16` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_17` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_18` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_19` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_2` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_20` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_21` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_22` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_23` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_24` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_25` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_26` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_27` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_28` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_29` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_3` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_30` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_31` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_32` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_33` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_34` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_35` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_36` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_37` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_38` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_39` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_4` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_40` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_41` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_42` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_43` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_44` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_45` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_46` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_47` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_48` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_49` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_5` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_50` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_51` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_52` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_53` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_54` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_55` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_56` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_57` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_58` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_6` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_7` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_8` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ghichuduan_ibfk_9` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `hopdong`
--
ALTER TABLE `hopdong`
  ADD CONSTRAINT `hopdong_ibfk_1` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_10` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_11` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_12` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_13` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_14` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_15` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_16` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_17` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_18` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_19` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_2` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_20` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_21` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_22` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_23` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_24` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_25` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_26` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_27` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_28` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_29` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_3` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_30` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_31` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_32` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_33` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_34` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_35` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_36` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_37` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_4` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_5` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_6` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_7` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_8` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `hopdong_ibfk_9` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `nghiphep`
--
ALTER TABLE `nghiphep`
  ADD CONSTRAINT `nghiphep_ibfk_1` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_10` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_11` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_12` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_13` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_14` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_15` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_16` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_17` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_18` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_19` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_2` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_20` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_21` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_22` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_23` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_24` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_25` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_26` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_27` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_28` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_29` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_3` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_30` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_31` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_32` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_33` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_34` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_35` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_36` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_37` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_38` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_4` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_5` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_6` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_7` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_8` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nghiphep_ibfk_9` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `nhanvien`
--
ALTER TABLE `nhanvien`
  ADD CONSTRAINT `nhanvien_ibfk_1` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_10` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_11` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_12` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_13` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_14` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_15` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_16` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_17` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_18` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_19` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_2` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_20` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_21` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_22` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_23` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_24` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_25` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_26` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_27` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_28` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_29` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_3` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_30` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_31` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_32` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_33` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_34` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_35` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_36` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_37` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_38` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_39` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_4` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_40` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_41` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_42` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_43` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_44` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_45` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_46` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_47` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_48` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_49` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_5` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_50` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_51` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_52` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_53` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_54` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_55` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_56` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_57` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_58` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_59` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_6` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_60` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_61` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_62` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_63` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_64` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_65` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_66` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_67` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_68` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_69` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_7` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_70` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_71` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_72` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_73` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_74` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_75` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_76` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_8` FOREIGN KEY (`MaPB`) REFERENCES `phongban` (`MaPB`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `nhanvien_ibfk_9` FOREIGN KEY (`MaCV`) REFERENCES `chucvu` (`MaCV`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `phancong`
--
ALTER TABLE `phancong`
  ADD CONSTRAINT `phancong_ibfk_1` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `phancong_ibfk_2` FOREIGN KEY (`MaDOAN`) REFERENCES `duan` (`MaDOAN`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `taikhoan`
--
ALTER TABLE `taikhoan`
  ADD CONSTRAINT `taikhoan_ibfk_1` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_10` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_11` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_12` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_13` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_14` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_15` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_16` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_17` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_18` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_19` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_2` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_20` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_21` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_22` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_23` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_24` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_25` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_26` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_27` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_28` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_29` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_3` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_30` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_31` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_32` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_33` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_34` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_35` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_36` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_37` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_38` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_4` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_5` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_6` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_7` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_8` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `taikhoan_ibfk_9` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `thongbao`
--
ALTER TABLE `thongbao`
  ADD CONSTRAINT `thongbao_ibfk_1` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_10` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_11` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_12` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_13` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_14` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_15` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_16` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_17` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_18` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_19` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_2` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_20` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_21` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_22` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_23` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_24` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_25` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_26` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_27` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_28` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_29` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_3` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_30` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_31` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_32` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_33` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_34` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_35` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_36` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_37` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_4` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_5` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_6` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_7` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_8` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `thongbao_ibfk_9` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Các ràng buộc cho bảng `trinhdo`
--
ALTER TABLE `trinhdo`
  ADD CONSTRAINT `trinhdo_ibfk_1` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_10` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_11` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_12` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_13` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_14` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_15` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_16` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_17` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_18` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_19` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_2` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_20` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_21` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_22` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_23` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_24` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_25` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_26` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_27` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_28` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_29` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_3` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_30` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_31` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_32` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_33` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_34` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_35` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_36` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_37` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_4` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_5` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_6` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_7` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_8` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trinhdo_ibfk_9` FOREIGN KEY (`MaNV1`) REFERENCES `nhanvien` (`MaNV1`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
