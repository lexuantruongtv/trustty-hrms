require('dotenv').config();
const { sequelize, NghiPhep, NhanVien } = require('../models');

/**
 * Thêm 9 đơn nghỉ phép từ T1–T6/2026
 * - Phân bổ đều, có 1 nhân viên nghỉ 2 lần trong cùng 1 tháng (NV004 tháng 3)
 * - Trạng thái mix: Đã duyệt / Từ chối / Chờ duyệt
 */
const NGHI_PHEP = [
  // Tháng 1
  {
    MaNV1: 'NV005',
    NgayBD: '2026-01-08',
    NgayKT: '2026-01-09',
    LyDo: 'Đám cưới người thân, cần về quê dự lễ',
    TrangThai: 'Đã duyệt',
  },

  // Tháng 2
  {
    MaNV1: 'NV007',
    NgayBD: '2026-02-03',
    NgayKT: '2026-02-04',
    LyDo: 'Sức khoẻ không ổn định, có giấy khám bác sĩ',
    TrangThai: 'Đã duyệt',
  },

  // Tháng 3 — NV004 nghỉ 2 lần trong tháng này
  {
    MaNV1: 'NV004',
    NgayBD: '2026-03-05',
    NgayKT: '2026-03-06',
    LyDo: 'Bị cảm cúm, cần nghỉ ngơi theo chỉ định bác sĩ',
    TrangThai: 'Đã duyệt',
  },
  {
    MaNV1: 'NV004',
    NgayBD: '2026-03-24',
    NgayKT: '2026-03-25',
    LyDo: 'Việc gia đình đột xuất, cần xử lý thủ tục hành chính',
    TrangThai: 'Đã duyệt',
  },

  // Tháng 4
  {
    MaNV1: 'NV006',
    NgayBD: '2026-04-14',
    NgayKT: '2026-04-16',
    LyDo: 'Nghỉ lễ kết hợp về thăm gia đình ở tỉnh',
    TrangThai: 'Đã duyệt',
  },

  // Tháng 5
  {
    MaNV1: 'NV005',
    NgayBD: '2026-05-07',
    NgayKT: '2026-05-07',
    LyDo: 'Đau răng cấp, cần đi nhổ răng theo lịch hẹn bác sĩ',
    TrangThai: 'Từ chối',
  },
  {
    MaNV1: 'NV008',
    NgayBD: '2026-05-19',
    NgayKT: '2026-05-21',
    LyDo: 'Tham dự khoá đào tạo kế toán tại Hà Nội (ngoài giờ công ty)',
    TrangThai: 'Đã duyệt',
  },

  // Tháng 6
  {
    MaNV1: 'NV003',
    NgayBD: '2026-06-10',
    NgayKT: '2026-06-12',
    LyDo: 'Dự lễ tốt nghiệp của con, cần đưa gia đình đi tỉnh',
    TrangThai: 'Đã duyệt',
  },
  {
    MaNV1: 'NV007',
    NgayBD: '2026-06-23',
    NgayKT: '2026-06-24',
    LyDo: 'Sốt xuất huyết nhẹ, bác sĩ yêu cầu nghỉ tại nhà theo dõi',
    TrangThai: 'Chờ duyệt',
  },
];

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    let created = 0, skipped = 0;

    for (const don of NGHI_PHEP) {
      // Kiểm tra NV có tồn tại không
      const nv = await NhanVien.findByPk(don.MaNV1);
      if (!nv) {
        console.log(`⚠️  Bỏ qua — không tìm thấy nhân viên ${don.MaNV1}`);
        skipped++;
        continue;
      }

      // Tránh tạo trùng (cùng NV, cùng NgayBD)
      const existing = await NghiPhep.findOne({
        where: { MaNV1: don.MaNV1, NgayBD: don.NgayBD },
      });
      if (existing) {
        console.log(`ℹ️  Đã tồn tại — ${nv.TenNV} ngày ${don.NgayBD}`);
        skipped++;
        continue;
      }

      await NghiPhep.create(don);
      console.log(`✅ ${nv.TenNV.padEnd(25)} | ${don.NgayBD} → ${don.NgayKT} | ${don.TrangThai}`);
      created++;
    }

    console.log(`\n🎉 Hoàn tất! Đã tạo: ${created} | Bỏ qua: ${skipped}`);
    console.log('\n📋 Tổng kết:');
    console.log('   T1: NV005 — Đám cưới người thân');
    console.log('   T2: NV007 — Sức khoẻ');
    console.log('   T3: NV004 — Cảm cúm  (lần 1)');
    console.log('   T3: NV004 — Việc gia đình  (lần 2 — cùng tháng)');
    console.log('   T4: NV006 — Nghỉ lễ về quê');
    console.log('   T5: NV005 — Đau răng (Từ chối)');
    console.log('   T5: NV008 — Đào tạo kế toán');
    console.log('   T6: NV003 — Lễ tốt nghiệp con');
    console.log('   T6: NV007 — Sốt xuất huyết (Chờ duyệt)');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    console.error(err);
    process.exit(1);
  }
};

run();
