const express = require('express');
const router = express.Router();
const thongKeController = require('../controllers/thongKe.controller');
const { xacThucToken, yeuCauQuyen } = require('../middleware/auth.middleware');

router.get('/tong-quan', xacThucToken, thongKeController.tongQuan);
router.get('/nhan-su', xacThucToken, yeuCauQuyen('Admin', 'HR', 'Manager'), thongKeController.nhanSu);
router.get('/du-an', xacThucToken, yeuCauQuyen('Admin', 'HR', 'Manager'), thongKeController.duAn);
router.get('/luong', xacThucToken, yeuCauQuyen('Admin', 'HR'), thongKeController.luong);

module.exports = router;
