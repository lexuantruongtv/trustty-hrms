const router = require('express').Router();
const ctrl = require('../controllers/thongBaoController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', ctrl.getMyNotifications);
router.put('/read-all', ctrl.markRead);
router.post('/', authorize('Admin', 'HR'), ctrl.create);

module.exports = router;
