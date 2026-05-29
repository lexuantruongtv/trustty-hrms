const express = require('express');
const router = express.Router();
const duAnController = require('../controllers/duAn.controller');
const { xacThucToken, yeuCauQuyen } = require('../middleware/auth.middleware');

router.get('/', xacThucToken, duAnController.layDanhSach);
router.get('/:maDA', xacThucToken, duAnController.layChiTiet);
router.post('/', xacThucToken, yeuCauQuyen('Admin', 'HR', 'Manager'), duAnController.taoMoi);
router.put('/:maDA', xacThucToken, yeuCauQuyen('Admin', 'HR', 'Manager'), duAnController.capNhat);
router.delete('/:maDA', xacThucToken, yeuCauQuyen('Admin'), duAnController.xoa);

module.exports = router;
