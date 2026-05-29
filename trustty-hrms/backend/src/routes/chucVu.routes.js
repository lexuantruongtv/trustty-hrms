const express = require('express');
const router = express.Router();
const chucVuController = require('../controllers/chucVu.controller');
const { xacThucToken, yeuCauQuyen } = require('../middleware/auth.middleware');

router.get('/', xacThucToken, chucVuController.layDanhSach);
router.get('/:maCV', xacThucToken, chucVuController.layChiTiet);
router.post('/', xacThucToken, yeuCauQuyen('Admin', 'HR'), chucVuController.taoMoi);
router.put('/:maCV', xacThucToken, yeuCauQuyen('Admin', 'HR'), chucVuController.capNhat);
router.delete('/:maCV', xacThucToken, yeuCauQuyen('Admin'), chucVuController.xoa);

module.exports = router;
