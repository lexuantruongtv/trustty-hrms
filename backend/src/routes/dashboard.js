const router = require('express').Router();
const ctrl = require('../controllers/dashboardController');
const { authenticate } = require('../middlewares/auth');

router.get('/stats', authenticate, ctrl.getStats);

module.exports = router;
