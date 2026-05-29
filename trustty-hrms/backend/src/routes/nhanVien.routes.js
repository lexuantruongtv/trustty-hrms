const express = require('express');
const router = express.Router();
const nhanVienController = require('../controllers/nhanVien.controller');
const { xacThucToken, yeuCauQuyen } = require('../middleware/auth.middleware');

router.get('/', xacThucToken, nhanVienController.layDanhSach);
router.get('/:maNV', xacThucToken, nhanVienController.layChiTiet);
router.post('/', xacThucToken, yeuCauQuyen('Admin', 'HR'), nhanVienController.taoMoi);
router.put('/:maNV', xacThucToken, yeuCauQuyen('Admin', 'HR'), nhanVienController.capNhat);
router.delete('/:maNV', xacThucToken, yeuCauQuyen('Admin'), nhanVienController.xoa);

module.exports = router;
