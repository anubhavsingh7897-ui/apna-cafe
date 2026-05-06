const router = require('express').Router();
const configController = require('../controllers/configController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.get('/', authenticate, configController.getConfig);
router.post('/', authenticate, authorize('admin'), configController.updateConfig);

module.exports = router;
