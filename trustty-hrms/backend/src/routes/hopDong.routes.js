const express = require('express');
const router = express.Router();
const hopDongController = require('../controllers/hopDong.controller');
const { xacThucToken, yeuCauQuyen } = require('../middleware/auth.middleware');

router.get('/nhan-vien/:maNV', xacThucToken, hopDongController.layTheoNV);
router.post('/', xacThucToken, yeuCauQuyen('Admin', 'HR'), hopDongController.taoMoi);
router.put('/:soHD', xacThucToken, yeuCauQuyen('Admin', 'HR'), hopDongController.capNhat);
router.delete('/:soHD', xacThucToken, yeuCauQuyen('Admin'), hopDongController.xoa);

module.exports = router;
