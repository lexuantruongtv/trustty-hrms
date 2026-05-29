const express = require('express');
const router = express.Router();
const trinhDoController = require('../controllers/trinhDo.controller');
const { xacThucToken, yeuCauQuyen } = require('../middleware/auth.middleware');

router.get('/nhan-vien/:maNV', xacThucToken, trinhDoController.layTheoNV);
router.post('/', xacThucToken, yeuCauQuyen('Admin', 'HR'), trinhDoController.taoMoi);
router.put('/:maTD', xacThucToken, yeuCauQuyen('Admin', 'HR'), trinhDoController.capNhat);
router.delete('/:maTD', xacThucToken, yeuCauQuyen('Admin', 'HR'), trinhDoController.xoa);

module.exports = router;
