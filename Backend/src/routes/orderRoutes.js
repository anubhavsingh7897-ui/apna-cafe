const router = require('express').Router();

const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/', authorize('waiter', 'cashier'), orderController.createOrder);
router.get('/', authorize('cashier'), orderController.listOrders);
router.get('/table/:id', authorize('waiter', 'cashier'), orderController.getActiveOrderForTable);
router.get('/:id', authorize('waiter', 'cashier', 'kitchen'), orderController.getOrder);
router.post('/:id/items', authorize('waiter'), orderController.addOrderItem);
router.put('/:id/items/:itemId', authorize('waiter'), orderController.updateOrderItem);
router.delete('/:id/items/:itemId', authorize('waiter'), orderController.deleteOrderItem);
router.patch('/:id/status', authorize('waiter', 'cashier', 'kitchen'), orderController.updateOrderStatus);

module.exports = router;
