const express = require('express');
const router = express.Router();
const bienDongLuongController = require('../controllers/bienDongLuong.controller');
const { xacThucToken, yeuCauQuyen } = require('../middleware/auth.middleware');

router.get('/', xacThucToken, yeuCauQuyen('Admin', 'HR'), bienDongLuongController.layDanhSach);
router.get('/nhan-vien/:maNV', xacThucToken, bienDongLuongController.layTheoNV);
router.post('/', xacThucToken, yeuCauQuyen('Admin', 'HR'), bienDongLuongController.taoMoi);
router.delete('/:maBD', xacThucToken, yeuCauQuyen('Admin', 'HR'), bienDongLuongController.xoa);

module.exports = router;
