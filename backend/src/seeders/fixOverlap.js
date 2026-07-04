require('dotenv').config();
const { PhanCong, DuAn, NhanVien } = require('../models');

/*
  Xử lý tất cả overlap:

  1. NV011 trong DA013 → thay bằng NV012 (Junior Dev, rảnh T1-T4/2026)
  2. NV011 trong DA009 → thay bằng NV017 (Junior Dev, rảnh T1-T2/2026)
  3. NV005 trong DA012 → thay bằng NV004 (Nhân Viên, rảnh T6-T9/2026) — NV005 ở lại DA002
  4. NV013 trong DA013 → thay bằng NV007 (Nhân Viên, rảnh) — NV013 ở lại DA010 + DA005
  5. NV016 trong DA011 → thay bằng NV005 (Senior Dev, rảnh T3-T6/2026 vì DA002 từ T6) — NV016 ở lại DA010
  6. NV018 trong DA011 → NV018 ở lại DA011, xóa NV018 khỏi DA007 → thay bằng NV006 (Nhân Viên, rảnh 2026)
  7. NV019 trong DA010 → thay bằng NV008 (Trưởng Phòng, rảnh 2026) — NV019 ở lại DA007
  8. NV016 DA003 trùng DA008 (2024) — DA003 ngắn (kết thúc 03/2024), DA008 dài hơn
     → thay NV016 trong DA003 bằng NV004 (Nhân Viên, rảnh T1-T3/2024 vì DA003 là 2024)
*/

(async () => {
  await require('../config/database').authenticate();
  console.log('✅ Connected\n');

  // Helper: thay thế NV trong PhanCong
  const thay = async (oldNV, maDOAN, newNV, newVaiTro, newTG) => {
    const old = await PhanCong.findOne({ where: { MaNV1: oldNV, MaDOAN: maDOAN } });
    if (!old) { console.log('⚠️  Không tìm thấy:', oldNV, maDOAN); return; }
    const vaiTro = newVaiTro || old.VaiTro;
    const tg     = newTG     || old.ThoiGianTG;
    await old.destroy();
    const [, created] = await PhanCong.findOrCreate({
      where: { MaNV1: newNV, MaDOAN: maDOAN },
      defaults: { MaNV1: newNV, MaDOAN: maDOAN, VaiTro: vaiTro, ThoiGianTG: tg },
    });
    console.log('✅ ' + maDOAN + ': thay ' + oldNV + ' → ' + newNV + ' (' + vaiTro + ')' + (created ? '' : ' [đã tồn tại, giữ nguyên]'));
  };

  // 1. NV011 → NV012 trong DA013
  await thay('NV011', 'DA013', 'NV012', 'Lập trình viên', '2026-01-05');
  // 2. NV011 → NV017 trong DA009
  await thay('NV011', 'DA009', 'NV017', 'Lập trình viên', '2026-01-10');
  // 3. NV005 → NV004 trong DA012
  await thay('NV005', 'DA012', 'NV004', 'Lập trình viên', '2026-06-15');
  // 4. NV013 → NV007 trong DA013
  await thay('NV013', 'DA013', 'NV007', 'Kiểm thử', '2026-01-08');
  // 5. NV016 → NV005 trong DA011
  await thay('NV016', 'DA011', 'NV005', 'Kiểm thử', '2026-03-15');
  // 6. NV018 → NV006 trong DA007 (NV018 ở lại DA011)
  await thay('NV018', 'DA007', 'NV006', 'Lập trình viên', '2026-01-01');
  // 7. NV019 → NV008 trong DA010 (NV019 ở lại DA007)
  await thay('NV019', 'DA010', 'NV008', 'Phân tích', '2026-02-05');
  // 8. NV016 → NV004 trong DA003 (NV016 ở lại DA008)
  await thay('NV016', 'DA003', 'NV004', 'Kiểm thử', '2024-01-01');

  console.log('\n🎉 Hoàn tất!');
  process.exit(0);
})().catch(e => { console.error('❌', e.message); process.exit(1); });
