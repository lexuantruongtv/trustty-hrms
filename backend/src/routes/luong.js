const router = require('express').Router();
const ctrl = require('../controllers/luongController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.post('/calculate', authorize('Admin', 'HR'), ctrl.tinhLuong);
router.delete('/:id', authorize('Admin'), ctrl.remove);

module.exports = router;
