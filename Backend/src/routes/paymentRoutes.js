const router = require('express').Router();

const paymentController = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.use(authenticate, authorize('admin', 'cashier'));

router.post('/', paymentController.createPayment);
router.get('/stats', paymentController.getCollectionStats);
router.get('/:order_id', paymentController.getPaymentByOrder);

module.exports = router;
