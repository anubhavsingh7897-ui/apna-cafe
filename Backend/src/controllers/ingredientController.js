const { Ingredient } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const { recalculateAllAvailability } = require('../services/inventoryService');

const createIngredient = asyncHandler(async (req, res) => {
  const ingredient = await Ingredient.create(req.body);
  await recalculateAllAvailability();
  res.status(201).json(ingredient);
});

const listIngredients = asyncHandler(async (req, res) => {
  const ingredients = await Ingredient.findAll({ order: [['name', 'ASC']] });
  res.json(ingredients);
});

const updateIngredient = asyncHandler(async (req, res) => {
  const ingredient = await Ingredient.findByPk(req.params.id);

  if (!ingredient) {
    throw httpError(404, 'Ingredient was not found.');
  }

  await ingredient.update(req.body);
  await recalculateAllAvailability();

  res.json(ingredient);
});

module.exports = {
  createIngredient,
  listIngredients,
  updateIngredient
};
