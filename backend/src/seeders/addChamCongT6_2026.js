require('dotenv').config();
const { sequelize, NhanVien, ChamCong } = require('../models');

/**
 * Chấm công tháng 6/2026 — toàn bộ nhân viên
 * Quy định:
 *   Buổi sáng : 08:00 – 12:00  (4h)
 *   Buổi chiều: 13:00 – 17:00  (4h)
 *   Tổng       : 8h/ngày  → đúng Luật LĐ 2019 (tối đa 8h/ngày, 48h/tuần)
 *
 * Đi trễ (3 NV): NV004, NV007, NV009
 *   Đi trễ = GioVao buổi sáng > 08:00 (08:15 – 08:30)
 *   → SoGioLam giảm tương ứng
 *
 * Ngày làm: Thứ 2 – Thứ 6  (bỏ T7, CN)
 * Tháng 6/2026: 01/6 (Thứ 2) → 30/6 (Thứ 3)
 * Ngày lễ trong tháng: không có ngày lễ quốc gia tháng 6
 * → Tổng 22 ngày làm việc
 */

const THANG = 6;
const NAM   = 2026;

// Nhân viên đi trễ: { MaNV1 → danh sách ngày đi trễ trong tháng (date number) }
const DI_TRE = {
  NV004: { days: [3, 10, 17], vaoTre: '08:22', raSom: '16:58' },  // đi trễ 3 buổi sáng
  NV007: { days: [5, 19],     vaoTre: '08:15', raSom: '17:00' },  // đi trễ 2 buổi
  NV009: { days: [12, 26],    vaoTre: '08:30', raSom: '16:45' },  // đi trễ 2 buổi, về sớm
};

// Tính số giờ làm từ GioVao/GioRa (HH:MM)
const calcHours = (vao, ra) => {
  const [vh, vm] = vao.split(':').map(Number);
  const [rh, rm] = ra.split(':').map(Number);
  const vaoMin = vh * 60 + vm;
  const raMin  = rh * 60 + rm;
  // Trừ 1h nghỉ trưa (12:00–13:00)
  const lunchBreak = 60;
  const raw = raMin - vaoMin - lunchBreak;
  return parseFloat((raw / 60).toFixed(2));
};

// Lấy tất cả ngày làm việc trong tháng (Thứ 2–6)
const getWorkdays = (year, month) => {
  const days = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month - 1, d).getDay(); // 0=CN, 6=T7
    if (dow >= 1 && dow <= 5) days.push(d);
  }
  return days;
};

const pad2 = (n) => String(n).padStart(2, '0');
const toDateStr = (y, m, d) => `${y}-${pad2(m)}-${pad2(d)}`;

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // 1. Xóa toàn bộ chấm công cũ
    const deleted = await ChamCong.destroy({ where: {}, truncate: false });
    console.log(`🗑️  Đã xóa ${deleted} bản ghi chấm công cũ`);

    // 2. Lấy danh sách nhân viên đang làm việc
    const nhanViens = await NhanVien.findAll({
      where: { TrangThai: 'Đang làm việc' },
      attributes: ['MaNV1', 'TenNV'],
      raw: true,
    });
    console.log(`👥 Nhân viên: ${nhanViens.length}`);

    const workdays = getWorkdays(NAM, THANG);
    console.log(`📅 Ngày làm T${THANG}/${NAM}: ${workdays.length} ngày (${workdays[0]}/6 – ${workdays[workdays.length - 1]}/6)\n`);

    const records = [];

    for (const nv of nhanViens) {
      const treCfg = DI_TRE[nv.MaNV1];

      for (const day of workdays) {
        let gioVao, gioRa;

        if (treCfg && treCfg.days.includes(day)) {
          // Ngày đi trễ
          gioVao = treCfg.vaoTre;
          gioRa  = treCfg.raSom;
        } else {
          // Ngày bình thường
          gioVao = '08:00';
          gioRa  = '17:00';
        }

        const soGioLam = calcHours(gioVao, gioRa);
        const ngay     = toDateStr(NAM, THANG, day);

        records.push({
          MaNV1: nv.MaNV1,
          Ngay: ngay,
          GioVao: gioVao + ':00',
          GioRa:  gioRa  + ':00',
          SoGioLam: soGioLam,
        });
      }
    }

    // Bulk insert theo batch 200
    const BATCH = 200;
    for (let i = 0; i < records.length; i += BATCH) {
      await ChamCong.bulkCreate(records.slice(i, i + BATCH));
    }

    console.log(`✅ Đã tạo ${records.length} bản ghi chấm công`);
    console.log(`   (${nhanViens.length} NV × ${workdays.length} ngày)\n`);

    // Tóm tắt nhân viên đi trễ
    console.log('⚠️  Nhân viên đi trễ:');
    for (const [maNV, cfg] of Object.entries(DI_TRE)) {
      const nv = nhanViens.find((n) => n.MaNV1 === maNV);
      const tenNV = nv?.TenNV || maNV;
      const ngayStr = cfg.days.map((d) => `${d}/6`).join(', ');
      const soH = calcHours(cfg.vaoTre, cfg.raSom);
      console.log(`   ${tenNV.padEnd(25)} | Ngày: ${ngayStr} | ${cfg.vaoTre}–${cfg.raSom} → ${soH}h`);
    }

    console.log('\n📋 Giờ làm quy định:');
    console.log('   Sáng : 08:00 – 12:00');
    console.log('   Chiều: 13:00 – 17:00');
    console.log('   Nghỉ trưa: 12:00 – 13:00');
    console.log('   Tổng : 8h/ngày (đúng Luật LĐ 2019)');

    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    console.error(err);
    process.exit(1);
  }
};

run();
