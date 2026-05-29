const express = require('express');
const router = express.Router();
const phongBanController = require('../controllers/phongBan.controller');
const { xacThucToken, yeuCauQuyen } = require('../middleware/auth.middleware');

router.get('/', xacThucToken, phongBanController.layDanhSach);
router.get('/:maPB', xacThucToken, phongBanController.layChiTiet);
router.post('/', xacThucToken, yeuCauQuyen('Admin', 'HR'), phongBanController.taoMoi);
router.put('/:maPB', xacThucToken, yeuCauQuyen('Admin', 'HR'), phongBanController.capNhat);
router.delete('/:maPB', xacThucToken, yeuCauQuyen('Admin'), phongBanController.xoa);

module.exports = router;
