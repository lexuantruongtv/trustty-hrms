require('dotenv').config();
const { sequelize, NhanVien, BangLuong, DuAn, PhanCong } = require('../models');
const { Op } = require('sequelize');

const LUONG_THEO_CV = {
  CV001: { luongCB: 50000000, phuCap: 10000000 }, // Giám Đốc
  CV002: { luongCB: 30000000, phuCap: 5000000  }, // Trưởng Phòng
  CV007: { luongCB: 28000000, phuCap: 4000000  }, // Quản Lý
  CV005: { luongCB: 25000000, phuCap: 4000000  }, // Senior Developer (đã đổi, giữ CV)
  CV003: { luongCB: 18000000, phuCap: 2000000  }, // Nhân Viên
  CV006: { luongCB: 14000000, phuCap: 1500000  }, // Junior Developer
  CV004: { luongCB:  8000000, phuCap: 500000   }, // Thực Tập Sinh
};

const THANG = 6;
const NAM = 2026;

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Lấy dự án đang chạy trong tháng 6/2026
    const duAnT6 = await DuAn.findAll({
      where: {
        NgayBD: { [Op.lte]: `${NAM}-${String(THANG).padStart(2, '0')}-30` },
        NgayKT: { [Op.gte]: `${NAM}-${String(THANG).padStart(2, '0')}-01` },
      },
      attributes: ['MaDOAN', 'TenDA'],
    });

    const maDoanList = duAnT6.map((d) => d.MaDOAN);
    console.log(`📋 Dự án hoạt động T${THANG}/${NAM}: ${duAnT6.map((d) => d.TenDA).join(', ')}`);

    // Nhân viên tham gia các dự án đó
    const phanCongs = await PhanCong.findAll({
      where: { MaDOAN: { [Op.in]: maDoanList } },
      attributes: ['MaNV1'],
    });
    const maNVTrongDA = [...new Set(phanCongs.map((p) => p.MaNV1))];

    // Thêm Giám đốc (CV001) nếu chưa có
    const giamDoc = await NhanVien.findAll({ where: { MaCV: 'CV001', TrangThai: 'Đang làm việc' }, attributes: ['MaNV1'] });
    const giamDocIds = giamDoc.map((n) => n.MaNV1);
    const allMaNV = [...new Set([...maNVTrongDA, ...giamDocIds])];

    console.log(`👥 Tổng nhân viên được tính lương: ${allMaNV.length}`);

    // Lấy thông tin chức vụ
    const nhanViens = await NhanVien.findAll({
      where: { MaNV1: { [Op.in]: allMaNV } },
      attributes: ['MaNV1', 'TenNV', 'MaCV'],
    });

    let created = 0, skipped = 0;
    for (const nv of nhanViens) {
      const config = LUONG_THEO_CV[nv.MaCV];
      if (!config) {
        console.log(`⚠️  Bỏ qua ${nv.TenNV} — không có cấu hình lương CV ${nv.MaCV}`);
        skipped++;
        continue;
      }

      const { luongCB, phuCap } = config;
      const thueTNCN = parseFloat((luongCB * 0.1).toFixed(2));
      const thucLinh = parseFloat((luongCB + phuCap - thueTNCN).toFixed(2));
      const MaBL = `BL${nv.MaNV1}${NAM}${String(THANG).padStart(2, '0')}`;

      const [, wasCreated] = await BangLuong.findOrCreate({
        where: { MaBL },
        defaults: { MaBL, MaNV1: nv.MaNV1, Thang: THANG, Nam: NAM, LuongCB: luongCB, PhuCap: phuCap, ThueTNCN: thueTNCN, ThucLinh: thucLinh },
      });

      if (wasCreated) {
        console.log(`✅ ${nv.TenNV.padEnd(25)} | CB: ${(luongCB/1e6).toFixed(0)}M | Net: ${(thucLinh/1e6).toFixed(2)}M`);
        created++;
      } else {
        console.log(`ℹ️  ${nv.TenNV} — đã có lương T${THANG}/${NAM}`);
        skipped++;
      }
    }

    console.log(`\n🎉 Hoàn tất! Đã tạo: ${created} | Bỏ qua: ${skipped}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
};

run();
