/**
 * rebuildLuong.js
 * Xóa toàn bộ bảng lương và tính lại từ đầu cho tất cả các tháng/năm có dự án.
 * Chỉ tính đến tháng hiện tại (T7/2026 chưa tính).
 */
require('dotenv').config();
const { BangLuong } = require('../models');
const svc = require('../services/luongService');

const PERIODS = [
  // 2024
  ...Array.from({ length: 12 }, (_, i) => ({ thang: i + 1, nam: 2024 })),
  // 2025
  ...Array.from({ length: 12 }, (_, i) => ({ thang: i + 1, nam: 2025 })),
  // 2026 — chỉ T1-T6 (đang là tháng 7)
  ...Array.from({ length: 6  }, (_, i) => ({ thang: i + 1, nam: 2026 })),
];

(async () => {
  // Xóa toàn bộ
  await BangLuong.destroy({ where: {} });
  const remaining = await BangLuong.count();
  console.log('🗑️  Đã xóa toàn bộ. Còn lại:', remaining, 'bản ghi\n');

  let totalCreated = 0, totalSkipped = 0;

  for (const { thang, nam } of PERIODS) {
    const r = await svc.autoTinhLuongThang({ thang, nam });
    if (r.created > 0) {
      console.log(`✅ T${thang}/${nam}: +${r.created} mới | DA: ${r.duAns?.join(', ')}`);
      totalCreated += r.created;
    } else if (r.duAns?.length) {
      console.log(`ℹ️  T${thang}/${nam}: ${r.message}`);
    } else {
      console.log(`⏭️  T${thang}/${nam}: không có dự án`);
    }
    totalSkipped += r.skipped || 0;
  }

  console.log(`\n🎉 Hoàn tất! Tổng đã tạo: ${totalCreated} | Bỏ qua: ${totalSkipped}`);
  process.exit(0);
})().catch(e => { console.error('❌', e.message); process.exit(1); });
