const router = require('express').Router();

const kitchenController = require('../controllers/kitchenController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.use(authenticate, authorize('kitchen'));

router.get('/orders', kitchenController.listKitchenOrders);

module.exports = router;
