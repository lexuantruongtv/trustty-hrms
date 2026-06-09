require('dotenv').config();
const { sequelize, BangLuong } = require('../models');

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Lấy danh sách bảng lương T8/2025
    const rows = await BangLuong.findAll({ where: { Thang: 8, Nam: 2025 } });
    console.log(`Tìm thấy ${rows.length} bản ghi T8/2025`);

    for (const bl of rows) {
      const newMaBL = `BL${bl.MaNV1}202404`;
      // Xóa bản ghi cũ rồi tạo mới (vì MaBL là PK)
      await BangLuong.destroy({ where: { MaBL: bl.MaBL } });
      await BangLuong.create({
        MaBL: newMaBL,
        MaNV1: bl.MaNV1,
        Thang: 4,
        Nam: 2024,
        LuongCB: bl.LuongCB,
        PhuCap: bl.PhuCap,
        ThueTNCN: bl.ThueTNCN,
        ThucLinh: bl.ThucLinh,
      });
      console.log(`✅ ${bl.MaBL} → ${newMaBL}`);
    }

    console.log('\n🎉 Hoàn tất!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
};

run();
