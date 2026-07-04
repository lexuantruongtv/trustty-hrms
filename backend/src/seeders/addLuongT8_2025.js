require('dotenv').config();
const { sequelize, NhanVien, BangLuong } = require('../models');

// Lương cơ bản theo chức vụ (VNĐ)
const LUONG_THEO_CV = {
  CV001: { luongCB: 50000000, phuCap: 10000000 }, // Giám Đốc
  CV002: { luongCB: 30000000, phuCap: 5000000  }, // Trưởng Phòng
  CV007: { luongCB: 28000000, phuCap: 4000000  }, // Quản Lý
  CV005: { luongCB: 25000000, phuCap: 4000000  }, // Senior Developer
  CV003: { luongCB: 18000000, phuCap: 2000000  }, // Nhân Viên
  CV006: { luongCB: 14000000, phuCap: 1500000  }, // Junior Developer
  CV004: { luongCB:  8000000, phuCap: 500000   }, // Thực Tập Sinh
};

const THANG = 8;
const NAM = 2025;

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const nhanViens = await NhanVien.findAll({
      where: { TrangThai: 'Đang làm việc' },
      attributes: ['MaNV1', 'TenNV', 'MaCV'],
    });

    let created = 0, skipped = 0;

    for (const nv of nhanViens) {
      const config = LUONG_THEO_CV[nv.MaCV];
      if (!config) {
        console.log(`⚠️  Bỏ qua ${nv.TenNV} — không có cấu hình lương cho chức vụ ${nv.MaCV}`);
        skipped++;
        continue;
      }

      const { luongCB, phuCap } = config;
      const thueTNCN = parseFloat((luongCB * 0.10).toFixed(2));
      const bhxh     = parseFloat((luongCB * 0.08).toFixed(2));
      const bhyt     = parseFloat((luongCB * 0.015).toFixed(2));
      const bhtn     = parseFloat((luongCB * 0.01).toFixed(2));
      const thucLinh = parseFloat((luongCB + phuCap - thueTNCN - bhxh - bhyt - bhtn).toFixed(2));
      const MaBL = `BL${nv.MaNV1}${NAM}${String(THANG).padStart(2, '0')}`;

      const [, wasCreated] = await BangLuong.findOrCreate({
        where: { MaBL },
        defaults: { MaBL, MaNV1: nv.MaNV1, Thang: THANG, Nam: NAM, LuongCB: luongCB, PhuCap: phuCap, ThueTNCN: thueTNCN, BHXH: bhxh, BHYT: bhyt, BHTN: bhtn, ThucLinh: thucLinh },
      });

      if (wasCreated) {
        console.log(`✅ ${nv.TenNV.padEnd(25)} | CB: ${(luongCB/1e6).toFixed(0)}M | PC: ${(phuCap/1e6).toFixed(0)}M | Net: ${(thucLinh/1e6).toFixed(2)}M`);
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
