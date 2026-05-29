const express = require('express');
const router = express.Router();
const chamCongController = require('../controllers/chamCong.controller');
const { xacThucToken, yeuCauQuyen } = require('../middleware/auth.middleware');

router.get('/', xacThucToken, yeuCauQuyen('Admin', 'HR', 'Manager'), chamCongController.layDanhSach);
router.get('/ca-nhan', xacThucToken, chamCongController.layCaNhan);
router.post('/check-in', xacThucToken, chamCongController.checkIn);
router.put('/check-out/:maCC', xacThucToken, chamCongController.checkOut);
router.post('/', xacThucToken, yeuCauQuyen('Admin', 'HR'), chamCongController.taoThuCong);
router.delete('/:maCC', xacThucToken, yeuCauQuyen('Admin', 'HR'), chamCongController.xoa);

module.exports = router;
