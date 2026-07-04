/**
 * fixThucLinh.js
 * Tính lại ThucLinh, BHXH, BHYT, BHTN cho toàn bộ bảng lương hiện có trong DB.
 * Công thức đúng:
 *   ThueTNCN = LuongCB × 10%
 *   BHXH     = LuongCB × 8%
 *   BHYT     = LuongCB × 1.5%
 *   BHTN     = LuongCB × 1%
 *   ThucLinh = LuongCB + PhuCap - ThueTNCN - BHXH - BHYT - BHTN
 */
require('dotenv').config();
const { sequelize, BangLuong } = require('../models');

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const rows = await BangLuong.findAll();
    console.log(`📋 Tổng số bản ghi cần cập nhật: ${rows.length}`);

    let updated = 0;
    for (const bl of rows) {
      const luongCB  = parseFloat(bl.LuongCB || 0);
      const phuCap   = parseFloat(bl.PhuCap  || 0);
      const thueTNCN = parseFloat((luongCB * 0.10 ).toFixed(2));
      const bhxh     = parseFloat((luongCB * 0.08 ).toFixed(2));
      const bhyt     = parseFloat((luongCB * 0.015).toFixed(2));
      const bhtn     = parseFloat((luongCB * 0.01 ).toFixed(2));
      const thucLinh = parseFloat((luongCB + phuCap - thueTNCN - bhxh - bhyt - bhtn).toFixed(2));

      await bl.update({ ThueTNCN: thueTNCN, BHXH: bhxh, BHYT: bhyt, BHTN: bhtn, ThucLinh: thucLinh });
      console.log(`✅ ${bl.MaBL.padEnd(20)} | CB: ${(luongCB/1e6).toFixed(0)}M | Net cũ → mới: ${(thucLinh/1e6).toFixed(3)}M`);
      updated++;
    }

    console.log(`\n🎉 Hoàn tất! Đã cập nhật: ${updated} bản ghi`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
};

run();
