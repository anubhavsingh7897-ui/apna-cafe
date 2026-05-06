const router = require('express').Router();

const itemController = require('../controllers/itemController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.use(authenticate);

router.post('/', authorize('admin'), itemController.createItem);
router.get('/', authorize('admin', 'waiter', 'cashier', 'kitchen'), itemController.listItems);
router.get('/:id', authorize('admin', 'waiter', 'cashier', 'kitchen'), itemController.getItem);
router.put('/:id', authorize('admin'), itemController.updateItem);
router.delete('/:id', authorize('admin'), itemController.deleteItem);
router.patch('/:id/availability', authorize('admin'), itemController.updateAvailabilityOverride);

router.post('/:id/ingredients', authorize('admin'), itemController.addRecipe);
router.get('/:id/ingredients', authorize('admin', 'kitchen'), itemController.getRecipe);
router.put('/:id/ingredients', authorize('admin'), itemController.updateRecipe);
router.delete(
  '/:id/ingredients/:ingredientId',
  authorize('admin'),
  itemController.deleteRecipeIngredient
);

module.exports = router;
