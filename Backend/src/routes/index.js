const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/items', require('./itemRoutes'));
router.use('/ingredients', require('./ingredientRoutes'));
router.use('/tables', require('./tableRoutes'));
router.use('/orders', require('./orderRoutes'));
router.use('/kitchen', require('./kitchenRoutes'));
router.use('/order-items', require('./orderItemRoutes'));
router.use('/payments', require('./paymentRoutes'));
router.use('/reports', require('./reportRoutes'));
router.use('/internal', require('./internalRoutes'));
router.use('/config', require('./configRoutes'));

module.exports = router;
