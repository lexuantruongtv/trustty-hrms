const express = require('express');
const router = express.Router();
const baoHiemController = require('../controllers/baoHiem.controller');
const { xacThucToken, yeuCauQuyen } = require('../middleware/auth.middleware');

router.get('/nhan-vien/:maNV', xacThucToken, baoHiemController.layTheoNV);
router.post('/', xacThucToken, yeuCauQuyen('Admin', 'HR'), baoHiemController.taoMoi);
router.put('/:maBH', xacThucToken, yeuCauQuyen('Admin', 'HR'), baoHiemController.capNhat);
router.delete('/:maBH', xacThucToken, yeuCauQuyen('Admin'), baoHiemController.xoa);

module.exports = router;
