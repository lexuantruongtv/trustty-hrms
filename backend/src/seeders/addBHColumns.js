/**
 * Migration: Thêm cột BHXH, BHYT, BHTN vào bảng BangLuong
 * Chạy: node src/seeders/addBHColumns.js
 */
const sequelize = require('../config/database');

(async () => {
  try {
    await sequelize.authenticate();
    const qi = sequelize.getQueryInterface();

    const tableDesc = await qi.describeTable('BangLuong');

    if (!tableDesc.BHXH) {
      await qi.addColumn('BangLuong', 'BHXH', {
        type: require('sequelize').DataTypes.DECIMAL(18, 2),
        defaultValue: 0,
        allowNull: false,
        after: 'ThueTNCN',
      });
      console.log('✔ Đã thêm cột BHXH');
    } else {
      console.log('– Cột BHXH đã tồn tại');
    }

    if (!tableDesc.BHYT) {
      await qi.addColumn('BangLuong', 'BHYT', {
        type: require('sequelize').DataTypes.DECIMAL(18, 2),
        defaultValue: 0,
        allowNull: false,
        after: 'BHXH',
      });
      console.log('✔ Đã thêm cột BHYT');
    } else {
      console.log('– Cột BHYT đã tồn tại');
    }

    if (!tableDesc.BHTN) {
      await qi.addColumn('BangLuong', 'BHTN', {
        type: require('sequelize').DataTypes.DECIMAL(18, 2),
        defaultValue: 0,
        allowNull: false,
        after: 'BHYT',
      });
      console.log('✔ Đã thêm cột BHTN');
    } else {
      console.log('– Cột BHTN đã tồn tại');
    }

    console.log('\n✅ Migration hoàn tất');
    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi migration:', err.message);
    process.exit(1);
  }
})();
