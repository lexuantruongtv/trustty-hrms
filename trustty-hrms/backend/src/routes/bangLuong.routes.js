const express = require('express');
const router = express.Router();
const bangLuongController = require('../controllers/bangLuong.controller');
const { xacThucToken, yeuCauQuyen } = require('../middleware/auth.middleware');

router.get('/', xacThucToken, yeuCauQuyen('Admin', 'HR'), bangLuongController.layDanhSach);
router.get('/ca-nhan', xacThucToken, bangLuongController.layCaNhan);
router.get('/:maBL', xacThucToken, bangLuongController.layChiTiet);
router.post('/tinh-luong', xacThucToken, yeuCauQuyen('Admin', 'HR'), bangLuongController.tinhLuong);
router.post('/', xacThucToken, yeuCauQuyen('Admin', 'HR'), bangLuongController.taoThuCong);
router.put('/:maBL', xacThucToken, yeuCauQuyen('Admin', 'HR'), bangLuongController.capNhat);
router.delete('/:maBL', xacThucToken, yeuCauQuyen('Admin'), bangLuongController.xoa);

module.exports = router;
