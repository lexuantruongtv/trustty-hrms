require('dotenv').config();
const { PhanCong, DuAn, NhanVien, ChucVu } = require('../models');

(async () => {
  const allNV = await NhanVien.findAll({
    where: { TrangThai: 'Đang làm việc' },
    include: [{ model: ChucVu, as: 'chucVu', attributes: ['TenCV'] }],
    attributes: ['MaNV1', 'TenNV', 'MaCV'],
  });
  const allPC = await PhanCong.findAll({
    include: [{ model: DuAn, as: 'duAn', attributes: ['TenDA', 'NgayBD', 'NgayKT'] }],
  });

  // Kiểm tra tất cả NV có overlap không
  console.log('=== KIỂM TRA TRÙNG LỊCH ===\n');
  for (const nv of allNV) {
    const pcs = allPC.filter(p => p.MaNV1 === nv.MaNV1);
    for (let i = 0; i < pcs.length; i++) {
      for (let j = i + 1; j < pcs.length; j++) {
        const a = pcs[i].duAn, b = pcs[j].duAn;
        if (!a || !b) continue;
        if (a.NgayBD <= b.NgayKT && a.NgayKT >= b.NgayBD) {
          console.log(nv.MaNV1 + ' ' + nv.TenNV + ':');
          console.log('  TRÙNG: ' + pcs[i].MaDOAN + ' ' + a.TenDA + ' (' + a.NgayBD + '->' + a.NgayKT + ')');
          console.log('     <-> ' + pcs[j].MaDOAN + ' ' + b.TenDA + ' (' + b.NgayBD + '->' + b.NgayKT + ')');
        }
      }
    }
  }

  // Tìm NV rảnh trong khoảng thời gian DA013 và DA009
  const targets = [
    { MaDOAN: 'DA013', TenDA: 'Internal Knowledge Base', NgayBD: '2026-01-05', NgayKT: '2026-04-05', VaiTro: 'Lập trình viên', thayNV: 'NV011' },
    { MaDOAN: 'DA009', TenDA: 'CRM System v3',           NgayBD: '2026-01-10', NgayKT: '2026-02-10', VaiTro: 'Lập trình viên', thayNV: 'NV011' },
  ];

  console.log('\n=== TÌM NV RẢNH ĐỂ THAY NV011 ===\n');
  for (const target of targets) {
    console.log('Dự án: ' + target.MaDOAN + ' ' + target.TenDA + ' (' + target.NgayBD + ' -> ' + target.NgayKT + ')');
    const nvDaCoTrongDA = new Set(allPC.filter(p => p.MaDOAN === target.MaDOAN).map(p => p.MaNV1));
    const ranh = [];
    for (const nv of allNV) {
      if (nv.MaCV === 'CV001') continue;       // bỏ Giám đốc
      if (nvDaCoTrongDA.has(nv.MaNV1)) continue; // đã trong dự án
      // Kiểm tra có bận trong khoảng thời gian này không
      const busy = allPC.filter(p => p.MaNV1 === nv.MaNV1 && p.duAn).some(p =>
        p.duAn.NgayBD <= target.NgayKT && p.duAn.NgayKT >= target.NgayBD
      );
      if (!busy) ranh.push(nv.MaNV1 + ' ' + nv.TenNV + ' (' + nv.chucVu?.TenCV + ')');
    }
    console.log('  NV rảnh: ' + (ranh.length ? ranh.join(', ') : 'Không có'));
    console.log();
  }

  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
