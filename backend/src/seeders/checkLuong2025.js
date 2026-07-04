require('dotenv').config();
const { DuAn, PhanCong, NhanVien, BangLuong } = require('../models');

(async () => {
  const NAM = 2025;
  const allLuong = await BangLuong.findAll({ where: { Nam: NAM }, attributes: ['MaNV1', 'Thang'] });
  const allPC    = await PhanCong.findAll({ attributes: ['MaNV1', 'MaDOAN'] });
  const allDA    = await DuAn.findAll({ attributes: ['MaDOAN', 'NgayBD', 'NgayKT'] });
  const giamDocs = await NhanVien.findAll({ where: { MaCV: 'CV001' }, attributes: ['MaNV1'] });
  const gdIds    = new Set(giamDocs.map((g) => g.MaNV1));

  let okCount = 0; const saiSot = [];

  for (let t = 1; t <= 12; t++) {
    const dauStr  = `${NAM}-${String(t).padStart(2,'0')}-01`;
    const cuoiStr = `${NAM}-${String(t).padStart(2,'0')}-${String(new Date(NAM, t, 0).getDate()).padStart(2,'0')}`;
    const maDoan  = allDA.filter((d) => d.NgayBD <= cuoiStr && d.NgayKT >= dauStr).map((d) => d.MaDOAN);
    const nvCanLuong = new Set(allPC.filter((p) => maDoan.includes(p.MaDOAN)).map((p) => p.MaNV1));
    gdIds.forEach((id) => nvCanLuong.add(id));
    const luongThang = allLuong.filter((l) => l.Thang === t).map((l) => l.MaNV1);
    const missing = [...nvCanLuong].filter((id) => !new Set(luongThang).has(id));
    const extra   = luongThang.filter((id) => !nvCanLuong.has(id));

    if (maDoan.length === 0 && luongThang.length === 0) {
      console.log(`T${t}/${NAM}: [bỏ qua]`); continue;
    }
    if (missing.length === 0 && extra.length === 0) {
      console.log(`T${t}/${NAM}: ✅ OK (${luongThang.length} NV | ${maDoan.length} DA: ${maDoan.join(', ')})`);
      okCount++;
    } else {
      console.log(`T${t}/${NAM}: ❌ SAI`);
      if (missing.length) console.log(`   Thiếu lương: ${missing.join(', ')}`);
      if (extra.length)   console.log(`   Thừa lương:  ${extra.join(', ')}`);
      saiSot.push(t);
    }
  }
  console.log(`\n📊 Tổng kết: ${okCount} tháng OK | ${saiSot.length} tháng sai sót${saiSot.length ? ': T' + saiSot.join(', T') : ''}`);
  process.exit(0);
})().catch((e) => { console.error('Lỗi:', e.message); process.exit(1); });
