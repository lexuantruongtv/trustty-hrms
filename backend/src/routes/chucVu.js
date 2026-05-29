const router = require('express').Router();
const ctrl = require('../controllers/chucVuController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.post('/', authorize('Admin', 'HR'), ctrl.create);
router.put('/:id', authorize('Admin', 'HR'), ctrl.update);
router.delete('/:id', authorize('Admin'), ctrl.remove);

module.exports = router;
