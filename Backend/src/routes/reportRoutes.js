const router = require('express').Router();

const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.use(authenticate, authorize('admin'));

router.get('/daily', reportController.dailyReport);
router.get('/monthly', reportController.monthlyReport);
router.get('/top-items', reportController.topItems);
router.get('/billing-analytics', reportController.billingAnalytics);

module.exports = router;
