const { sequelize, Item, Ingredient, ItemIngredient } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const { refreshItemAvailability } = require('../services/itemAvailabilityService');

const createItem = asyncHandler(async (req, res) => {
  const item = await Item.create(req.body);
  res.status(201).json({
    ...item.toJSON(),
    message: 'Menu item created successfully.'
  });
});

const listItems = asyncHandler(async (req, res) => {
  const items = await Item.findAll({ order: [['name', 'ASC']] });
  res.json(items);
});

const getItem = asyncHandler(async (req, res) => {
  const item = await Item.findByPk(req.params.id);

  if (!item) {
    throw httpError(404, 'Item was not found.');
  }

  res.json(item);
});

const updateItem = asyncHandler(async (req, res) => {
  const item = await Item.findByPk(req.params.id);

  if (!item) {
    throw httpError(404, 'Item was not found.');
  }

  await item.update(req.body);
  await refreshItemAvailability(item.id);

  const updatedItem = await Item.findByPk(item.id);

  res.json({
    ...updatedItem.toJSON(),
    message: 'Menu item updated successfully.'
  });
});

const deleteItem = asyncHandler(async (req, res) => {
  const deleted = await Item.destroy({ where: { id: req.params.id } });

  if (!deleted) {
    throw httpError(404, 'Item was not found.');
  }

  res.json({ message: 'Menu item deleted successfully.' });
});

const updateAvailabilityOverride = asyncHandler(async (req, res) => {
  const item = await Item.findByPk(req.params.id);

  if (!item) {
    throw httpError(404, 'Item was not found.');
  }

  const { manual_override, is_available } = req.body;

  await item.update({
    manual_override: Boolean(manual_override),
    ...(is_available !== undefined ? { is_available: Boolean(is_available) } : {})
  });

  if (!item.manual_override) {
    await refreshItemAvailability(item.id);
  }

  const updatedItem = await Item.findByPk(item.id);

  res.json({
    ...updatedItem.toJSON(),
    message: `Menu item marked ${updatedItem.is_available ? 'available' : 'unavailable'}.`
  });
});

const addRecipe = asyncHandler(async (req, res) => {
  const { ingredient_id, quantity_required } = req.body;

  if (!ingredient_id || !quantity_required) {
    throw httpError(400, 'ingredient_id and quantity_required are required.');
  }

  const recipe = await ItemIngredient.create({
    item_id: req.params.id,
    ingredient_id,
    quantity_required
  });

  await refreshItemAvailability(req.params.id);

  res.status(201).json({
    ...recipe.toJSON(),
    message: 'Recipe ingredient added successfully.'
  });
});

const getRecipe = asyncHandler(async (req, res) => {
  const recipe = await ItemIngredient.findAll({
    where: { item_id: req.params.id },
    include: [{ model: Ingredient, as: 'ingredient' }]
  });

  res.json(recipe);
});

const updateRecipe = asyncHandler(async (req, res) => {
  const rows = Array.isArray(req.body.ingredients) ? req.body.ingredients : req.body;

  if (!Array.isArray(rows)) {
    throw httpError(400, 'Provide an array of ingredients.');
  }

  const item = await Item.findByPk(req.params.id);

  if (!item) {
    throw httpError(404, 'Item was not found.');
  }

  const ingredientIds = rows.map((row) => Number(row.ingredient_id));
  const uniqueIngredientIds = new Set(ingredientIds);

  if (uniqueIngredientIds.size !== ingredientIds.length) {
    throw httpError(400, 'Each ingredient can be added only once in a recipe.');
  }

  for (const row of rows) {
    if (!row.ingredient_id || !row.quantity_required || Number(row.quantity_required) <= 0) {
      throw httpError(400, 'Each recipe row needs an ingredient and a quantity greater than zero.');
    }
  }

  for (const ingredientId of uniqueIngredientIds) {
    const ingredient = await Ingredient.findByPk(ingredientId);

    if (!ingredient) {
      throw httpError(404, `Ingredient ${ingredientId} was not found.`);
    }
  }

  await sequelize.transaction(async (transaction) => {
    await ItemIngredient.destroy({
      where: { item_id: req.params.id },
      transaction
    });

    if (rows.length === 0) {
      return;
    }

    await ItemIngredient.bulkCreate(
      rows.map((row) => ({
        item_id: Number(req.params.id),
        ingredient_id: Number(row.ingredient_id),
        quantity_required: Number(row.quantity_required)
      })),
      { transaction }
    );
  });

  await refreshItemAvailability(req.params.id);

  const savedRecipe = await ItemIngredient.findAll({
    where: { item_id: req.params.id },
    include: [{ model: Ingredient, as: 'ingredient' }]
  });

  res.json({
    ingredients: savedRecipe,
    message: 'Recipe updated successfully.'
  });
});

const deleteRecipeIngredient = asyncHandler(async (req, res) => {
  const deleted = await ItemIngredient.destroy({
    where: {
      item_id: req.params.id,
      ingredient_id: req.params.ingredientId
    }
  });

  if (!deleted) {
    throw httpError(404, 'Recipe ingredient mapping was not found.');
  }

  await refreshItemAvailability(req.params.id);

  res.json({ message: 'Recipe ingredient removed successfully.' });
});

module.exports = {
  addRecipe,
  createItem,
  deleteItem,
  deleteRecipeIngredient,
  getItem,
  getRecipe,
  listItems,
  updateAvailabilityOverride,
  updateItem,
  updateRecipe
};
