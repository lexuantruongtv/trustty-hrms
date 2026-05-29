const express = require('express');
const router = express.Router();
const nghiPhepController = require('../controllers/nghiPhep.controller');
const { xacThucToken, yeuCauQuyen } = require('../middleware/auth.middleware');

router.get('/', xacThucToken, yeuCauQuyen('Admin', 'HR', 'Manager'), nghiPhepController.layDanhSach);
router.get('/ca-nhan', xacThucToken, nghiPhepController.layCaNhan);
router.post('/', xacThucToken, nghiPhepController.taoMoi);
router.put('/:maDon/duyet', xacThucToken, yeuCauQuyen('Admin', 'HR', 'Manager'), nghiPhepController.duyetDon);
router.delete('/:maDon', xacThucToken, nghiPhepController.huyDon);

module.exports = router;
