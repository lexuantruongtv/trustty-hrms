const express = require('express');
const router = express.Router();
const phanCongController = require('../controllers/phanCong.controller');
const { xacThucToken, yeuCauQuyen } = require('../middleware/auth.middleware');

router.get('/du-an/:maDA', xacThucToken, phanCongController.layTheoDA);
router.get('/nhan-vien/:maNV', xacThucToken, phanCongController.layTheoNV);
router.post('/', xacThucToken, yeuCauQuyen('Admin', 'HR', 'Manager'), phanCongController.phanCong);
router.put('/:maNV/:maDA', xacThucToken, yeuCauQuyen('Admin', 'HR', 'Manager'), phanCongController.capNhat);
router.delete('/:maNV/:maDA', xacThucToken, yeuCauQuyen('Admin', 'HR', 'Manager'), phanCongController.huyPhanCong);

module.exports = router;
