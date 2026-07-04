require('dotenv').config();
const { DuAn, PhanCong, NhanVien, ChucVu } = require('../models');

(async () => {
  const duAns = await DuAn.findAll({ order: [['NgayBD', 'ASC']] });
  const allPC = await PhanCong.findAll({
    include: [{
      model: NhanVien, as: 'nhanVien', attributes: ['TenNV', 'MaCV'],
      include: [{ model: ChucVu, as: 'chucVu', attributes: ['TenCV'] }],
    }],
  });

  let issueCount = 0;

  for (const da of duAns) {
    const pcs    = allPC.filter((p) => p.MaDOAN === da.MaDOAN);
    const hasQL  = pcs.some((p) => p.VaiTro === 'Quản lý dự án');
    const issues = [];

    if (!hasQL) issues.push('THIEU Quan ly du an');

    const outOfRange = pcs.filter((p) => {
      if (!p.ThoiGianTG) return false;
      return p.ThoiGianTG < da.NgayBD || p.ThoiGianTG > da.NgayKT;
    });
    if (outOfRange.length) issues.push('ThoiGianTG ngoai pham vi: ' + outOfRange.map((p) => p.MaNV1).join(', '));

    const noDate = pcs.filter((p) => !p.ThoiGianTG);
    if (noDate.length) issues.push('ThoiGianTG NULL: ' + noDate.map((p) => p.MaNV1).join(', '));

    const status = issues.length ? 'SAI' : 'OK';
    console.log(status + ' | ' + da.MaDOAN + ' | ' + da.TenDA + ' | ' + da.NgayBD + ' -> ' + da.NgayKT + ' | ' + da.TrangThai);
    if (issues.length) {
      issues.forEach((i) => console.log('     ! ' + i));
      issueCount++;
    }
    pcs.forEach((p) => {
      console.log('     - ' + p.MaNV1 + ' ' + (p.nhanVien?.TenNV || '').padEnd(22) + ' | ' + (p.VaiTro || '').padEnd(20) + ' | TG: ' + (p.ThoiGianTG || 'NULL'));
    });
  }

  console.log('\nTong: ' + duAns.length + ' du an | ' + issueCount + ' co van de');
  process.exit(0);
})().catch((e) => { console.error(e.message); process.exit(1); });
