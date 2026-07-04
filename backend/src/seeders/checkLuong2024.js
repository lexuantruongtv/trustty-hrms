require('dotenv').config();
const { DuAn, PhanCong, NhanVien, BangLuong } = require('../models');
const { Op } = require('sequelize');

(async () => {
  const allLuong = await BangLuong.findAll({ where: { Nam: 2024 }, attributes: ['MaNV1', 'Thang'] });
  const allPC    = await PhanCong.findAll({ attributes: ['MaNV1', 'MaDOAN'] });
  const allDA    = await DuAn.findAll({ attributes: ['MaDOAN', 'NgayBD', 'NgayKT'] });
  const giamDocs = await NhanVien.findAll({ where: { MaCV: 'CV001' }, attributes: ['MaNV1'] });
  const gdIds    = new Set(giamDocs.map((g) => g.MaNV1));

  let okCount = 0;
  const saiSot = [];

  for (let t = 1; t <= 12; t++) {
    const dauStr  = `2024-${String(t).padStart(2,'0')}-01`;
    const cuoiDate = new Date(2024, t, 0);
    const cuoiStr = `2024-${String(t).padStart(2,'0')}-${String(cuoiDate.getDate()).padStart(2,'0')}`;

    // Dự án trong tháng
    const duAnThang = allDA.filter((d) => d.NgayBD <= cuoiStr && d.NgayKT >= dauStr);
    const maDoan    = duAnThang.map((d) => d.MaDOAN);

    // NV lẽ ra phải có lương
    const nvCanLuong = new Set(allPC.filter((p) => maDoan.includes(p.MaDOAN)).map((p) => p.MaNV1));
    gdIds.forEach((id) => nvCanLuong.add(id));

    // NV thực tế có lương trong DB
    const luongThang = allLuong.filter((l) => l.Thang === t).map((l) => l.MaNV1);
    const luongSet   = new Set(luongThang);

    const missing = [...nvCanLuong].filter((id) => !luongSet.has(id));
    const extra   = luongThang.filter((id) => !nvCanLuong.has(id));

    if (maDoan.length === 0 && luongThang.length === 0) {
      console.log(`T${t}/2024: [bỏ qua - không có dự án và không có lương]`);
      continue;
    }

    if (missing.length === 0 && extra.length === 0) {
      console.log(`T${t}/2024: ✅ OK (${luongThang.length} NV | ${maDoan.length} dự án: ${duAnThang.map(d=>d.MaDOAN).join(', ')})`);
      okCount++;
    } else {
      console.log(`T${t}/2024: ❌ SAI`);
      if (missing.length) console.log(`   Thiếu lương: ${missing.join(', ')}`);
      if (extra.length)   console.log(`   Thừa lương:  ${extra.join(', ')}`);
      saiSot.push(t);
    }
  }

  console.log(`\n📊 Tổng kết: ${okCount} tháng OK | ${saiSot.length} tháng sai sót${saiSot.length ? ': T' + saiSot.join(', T') : ''}`);
  process.exit(0);
})().catch((e) => { console.error('Lỗi:', e.message); process.exit(1); });
