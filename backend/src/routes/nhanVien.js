const router = require('express').Router();
const ctrl = require('../controllers/nhanVienController');
const { authenticate, authorize } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('Admin', 'HR'), upload.single('avatar'), ctrl.create);
router.put('/:id', authorize('Admin', 'HR'), upload.single('avatar'), ctrl.update);
router.delete('/:id', authorize('Admin'), ctrl.remove);

module.exports = router;
