const router = require('express').Router();

const internalController = require('../controllers/internalController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.use(authenticate, authorize('admin'));

router.post('/update-item-availability/:itemId', internalController.updateItemAvailability);
router.post('/recalculate-availability', internalController.recalculateAvailability);
router.post('/deduct-inventory', internalController.deductInventory);

module.exports = router;
