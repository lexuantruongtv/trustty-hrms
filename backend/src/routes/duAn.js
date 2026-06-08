const router = require('express').Router();
const ctrl = require('../controllers/duAnController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.get('/my', ctrl.getMyProjects);
router.get('/nv-chua-tham-gia', authorize('Admin', 'Manager'), ctrl.getNvChuaThamGia);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authorize('Admin', 'HR', 'Manager'), ctrl.create);
router.put('/:id', authorize('Admin', 'HR', 'Manager'), ctrl.update);
router.delete('/:id', authorize('Admin'), ctrl.remove);
router.post('/:id/assign', authorize('Admin', 'HR', 'Manager'), ctrl.phanCong);
router.delete('/:id/assign/:maNV1', authorize('Admin', 'HR', 'Manager'), ctrl.huyPhanCong);
router.get('/:id/notes', ctrl.getNotes);
router.post('/:id/notes', ctrl.addNote);

module.exports = router;
