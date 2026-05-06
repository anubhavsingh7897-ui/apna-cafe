const router = require('express').Router();

const ingredientController = require('../controllers/ingredientController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

router.use(authenticate, authorize('admin', 'kitchen'));

router.post('/', authorize('admin'), ingredientController.createIngredient);
router.get('/', ingredientController.listIngredients);
router.put('/:id', authorize('admin', 'kitchen'), ingredientController.updateIngredient);

module.exports = router;
