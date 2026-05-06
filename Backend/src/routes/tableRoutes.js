const router = require('express').Router();

const tableController = require('../controllers/tableController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.use(authenticate);

router.get('/', authorize('admin', 'waiter', 'cashier'), tableController.listTables);
router.post('/', authorize('admin'), tableController.createTable);
router.put('/:id', authorize('admin', 'waiter', 'cashier'), tableController.updateTable);

module.exports = router;
