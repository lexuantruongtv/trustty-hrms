const router = require('express').Router();
const ctrl = require('../controllers/trinhDoController');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
