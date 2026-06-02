const router = require('express').Router();
const ctrl = require('../controllers/nghiPhepController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.put('/:id/approve', authorize('Admin', 'TruongPhong'), ctrl.approve);
router.put('/:id/reject', authorize('Admin', 'TruongPhong'), ctrl.reject);
router.delete('/:id', ctrl.remove);

module.exports = router;
