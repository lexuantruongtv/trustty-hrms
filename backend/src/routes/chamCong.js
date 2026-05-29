const router = require('express').Router();
const ctrl = require('../controllers/chamCongController');
const { authenticate, authorize } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.get('/today', ctrl.getTodayStatus);
router.post('/checkin', ctrl.checkIn);
router.post('/checkout', ctrl.checkOut);

module.exports = router;
