const router = require('express').Router();
const ctrl = require('../controllers/thongKeController');
const { authenticate } = require('../middlewares/auth');

router.get('/du-an', authenticate, ctrl.thongKeDuAn);
router.get('/bang-luong', authenticate, ctrl.bangLuongCongTy);
router.get('/chi-phi-phong-ban', authenticate, ctrl.chiPhiTheoPhongBan);
router.get('/chi-phi-du-an', authenticate, ctrl.chiPhiTheoDuAn);

module.exports = router;
