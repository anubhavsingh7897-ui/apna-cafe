const router = require('express').Router();

const kitchenController = require('../controllers/kitchenController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.use(authenticate);

router.patch('/:id/status', authorize('kitchen'), kitchenController.updateOrderItemStatus);

module.exports = router;
