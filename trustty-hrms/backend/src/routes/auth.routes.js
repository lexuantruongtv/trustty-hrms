const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { xacThucToken } = require('../middleware/auth.middleware');

router.post('/dang-nhap', authController.dangNhap);
router.get('/thong-tin-ca-nhan', xacThucToken, authController.layThongTinCaNhan);
router.put('/doi-mat-khau', xacThucToken, authController.doiMatKhau);

module.exports = router;
