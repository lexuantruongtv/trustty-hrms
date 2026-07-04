require('dotenv').config();
const { sequelize, PhanCong } = require('../models');

const run = async () => {
  try {
    await sequelize.authenticate();
    const [count] = await PhanCong.update(
      { VaiTro: 'Lập trình viên' },
      { where: { VaiTro: 'Senior Developer' } },
    );
    console.log(`✅ Đã cập nhật ${count} bản ghi 'Senior Developer' → 'Lập trình viên'`);
    process.exit(0);
  } catch (err) {
    console.error('❌', err.message);
    process.exit(1);
  }
};
run();
