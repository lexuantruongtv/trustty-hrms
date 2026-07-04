const router = require('express').Router();
const ctrl = require('../controllers/luongController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.post('/calculate', authorize('Admin', 'Ketoan'), ctrl.tinhLuong);
router.post('/auto-calculate', authorize('Admin', 'Ketoan'), ctrl.autoTinhLuong);
router.delete('/:id', authorize('Admin', 'Ketoan'), ctrl.remove);

module.exports = router;
