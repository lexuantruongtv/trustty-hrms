const router = require('express').Router();
const ctrl = require('../controllers/thongBaoController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', ctrl.getMyNotifications);
router.get('/admin', authorize('Admin'), ctrl.getAdminNotifications);
router.get('/admin/detail', authorize('Admin'), ctrl.getDetailByGroup);
router.put('/read-all', ctrl.markRead);
router.put('/admin', authorize('Admin'), ctrl.updateByGroup);
router.post('/', authorize('Admin', 'HR'), ctrl.create);
router.delete('/admin', authorize('Admin'), ctrl.deleteByGroup);

module.exports = router;
