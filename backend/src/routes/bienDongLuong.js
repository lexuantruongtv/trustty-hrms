const router = require('express').Router();
const ctrl = require('../controllers/bienDongLuongController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.post('/', authorize('Admin'), ctrl.create);
router.delete('/:id', authorize('Admin'), ctrl.remove);

module.exports = router;
