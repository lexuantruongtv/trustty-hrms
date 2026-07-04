require('dotenv').config();
const { PhanCong, NhanVien, sequelize } = require('../models');

/*
  Các thay đổi cần thực hiện:
  1. DA003 - ThoiGianTG: NV004,NV009,NV016,NV017 đang là 2023-06-01 (trước NgayBD 2024-01-01)
             → sửa thành 2024-01-01
  2. DA008 - Thiếu Quản lý dự án → gán NV012 (Trần Quốc Bảo) làm Quản lý dự án
  3. DA001 - Thiếu Quản lý dự án → gán NV002 (Trưởng Phòng NS đang có trong dự án)
             DA001 không có NV nào → thêm NV003 (Trưởng Phòng Kỹ Thuật) làm Quản lý dự án
  4. DA004 - Thiếu Quản lý dự án → gán NV010 làm Quản lý dự án
  5. DA006 - Thiếu QL + ThoiGianTG ngoài phạm vi (NgayBD 2025-01-01):
             NV016,NV017 TG=2024-06-05 → sửa 2025-01-01; thêm vai trò QL cho NV016
  6. DA007 - ThoiGianTG ngoài phạm vi (NgayBD 2026-01-01):
             NV011,NV018,NV019 TG=2025-04-05 → sửa 2026-01-01
  7. DA005 - Thiếu QL + ThoiGianTG ngoài phạm vi (NgayBD 2026-03-01):
             NV013,NV014 TG=2025-03-05; NV015 TG=2025-03-10 → sửa 2026-03-01
             Gán NV014 làm Quản lý dự án
  8. DA012 - ThoiGianTG ngoài phạm vi (NgayBD 2026-06-15):
             NV005,NV012,NV017 TG=2026-01-20 → sửa 2026-06-15
*/

const fixes = [
  // [MaNV1, MaDOAN, newThoiGianTG, newVaiTro (null = giữ nguyên)]
  // DA003
  { MaNV1: 'NV004', MaDOAN: 'DA003', ThoiGianTG: '2024-01-01', VaiTro: null },
  { MaNV1: 'NV009', MaDOAN: 'DA003', ThoiGianTG: '2024-01-01', VaiTro: null },
  { MaNV1: 'NV016', MaDOAN: 'DA003', ThoiGianTG: '2024-01-01', VaiTro: null },
  { MaNV1: 'NV017', MaDOAN: 'DA003', ThoiGianTG: '2024-01-01', VaiTro: null },
  // DA008 — đổi NV012 thành Quản lý dự án
  { MaNV1: 'NV012', MaDOAN: 'DA008', ThoiGianTG: null, VaiTro: 'Quản lý dự án' },
  // DA004 — đổi NV010 thành Quản lý dự án
  { MaNV1: 'NV010', MaDOAN: 'DA004', ThoiGianTG: null, VaiTro: 'Quản lý dự án' },
  // DA006 — fix ThoiGianTG + thêm QL cho NV016
  { MaNV1: 'NV016', MaDOAN: 'DA006', ThoiGianTG: '2025-01-01', VaiTro: 'Quản lý dự án' },
  { MaNV1: 'NV017', MaDOAN: 'DA006', ThoiGianTG: '2025-01-01', VaiTro: null },
  // DA007 — fix ThoiGianTG
  { MaNV1: 'NV011', MaDOAN: 'DA007', ThoiGianTG: '2026-01-01', VaiTro: null },
  { MaNV1: 'NV018', MaDOAN: 'DA007', ThoiGianTG: '2026-01-01', VaiTro: null },
  { MaNV1: 'NV019', MaDOAN: 'DA007', ThoiGianTG: '2026-01-01', VaiTro: null },
  // DA005 — fix ThoiGianTG + đổi NV014 thành Quản lý dự án
  { MaNV1: 'NV013', MaDOAN: 'DA005', ThoiGianTG: '2026-03-01', VaiTro: null },
  { MaNV1: 'NV014', MaDOAN: 'DA005', ThoiGianTG: '2026-03-01', VaiTro: 'Quản lý dự án' },
  { MaNV1: 'NV015', MaDOAN: 'DA005', ThoiGianTG: '2026-03-01', VaiTro: null },
  // DA012 — fix ThoiGianTG
  { MaNV1: 'NV005', MaDOAN: 'DA012', ThoiGianTG: '2026-06-15', VaiTro: null },
  { MaNV1: 'NV012', MaDOAN: 'DA012', ThoiGianTG: '2026-06-15', VaiTro: null },
  { MaNV1: 'NV017', MaDOAN: 'DA012', ThoiGianTG: '2026-06-15', VaiTro: null },
];

// DA001 — không có NV nào, thêm NV003 làm Quản lý dự án
const newRecords = [
  { MaNV1: 'NV003', MaDOAN: 'DA001', VaiTro: 'Quản lý dự án', ThoiGianTG: '2024-01-01' },
];

(async () => {
  await sequelize.authenticate();
  console.log('✅ Database connected\n');

  let updated = 0;
  for (const f of fixes) {
    const pc = await PhanCong.findOne({ where: { MaNV1: f.MaNV1, MaDOAN: f.MaDOAN } });
    if (!pc) { console.log('⚠️  Không tìm thấy:', f.MaNV1, f.MaDOAN); continue; }
    const updateData = {};
    if (f.ThoiGianTG) updateData.ThoiGianTG = f.ThoiGianTG;
    if (f.VaiTro)     updateData.VaiTro      = f.VaiTro;
    await pc.update(updateData);
    console.log('✅ ' + f.MaNV1 + ' / ' + f.MaDOAN + (f.ThoiGianTG ? ' TG→' + f.ThoiGianTG : '') + (f.VaiTro ? ' VaiTro→' + f.VaiTro : ''));
    updated++;
  }

  for (const r of newRecords) {
    const [, created] = await PhanCong.findOrCreate({ where: { MaNV1: r.MaNV1, MaDOAN: r.MaDOAN }, defaults: r });
    console.log((created ? '✅ Tao moi' : 'ℹ️  Da co') + ': ' + r.MaNV1 + ' / ' + r.MaDOAN + ' | ' + r.VaiTro);
  }

  console.log('\n🎉 Hoàn tất! Đã cập nhật ' + updated + ' bản ghi, thêm ' + newRecords.length + ' mới');
  process.exit(0);
})().catch((e) => { console.error('❌', e.message); process.exit(1); });
