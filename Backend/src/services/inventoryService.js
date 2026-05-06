const { Item, Ingredient, ItemIngredient } = require('../models');
const httpError = require('../utils/httpError');
const { refreshItemAvailability } = require('./itemAvailabilityService');

async function getRecipe(itemId, options = {}) {
  return ItemIngredient.findAll({
    where: { item_id: itemId },
    include: [
      {
        model: Ingredient,
        as: 'ingredient'
      }
    ],
    transaction: options.transaction
  });
}

async function ensureStockForItem(itemId, quantity, options = {}) {
  const item = await Item.findByPk(itemId, { transaction: options.transaction });

  if (!item) {
    throw httpError(404, `Item ${itemId} was not found.`);
  }

  if (!item.is_available && !item.manual_override) {
    throw httpError(400, `${item.name} is not available.`);
  }

  const recipe = await getRecipe(itemId, options);

  for (const recipeRow of recipe) {
    const required = Number(recipeRow.quantity_required) * quantity;
    const stock = Number(recipeRow.ingredient.stock_quantity);

    if (!item.manual_override && stock < required) {
      throw httpError(400, `Not enough ${recipeRow.ingredient.name} for ${item.name}.`);
    }
  }

  return item;
}

async function adjustInventoryForItem(itemId, quantityDelta, options = {}) {
  if (quantityDelta === 0) {
    return;
  }

  const recipe = await getRecipe(itemId, options);

  for (const recipeRow of recipe) {
    const stockDelta = Number(recipeRow.quantity_required) * quantityDelta;
    const nextStock = Number(recipeRow.ingredient.stock_quantity) - stockDelta;

    if (nextStock < 0) {
      throw httpError(400, `Not enough ${recipeRow.ingredient.name} in stock.`);
    }

    await Ingredient.update(
      { stock_quantity: nextStock },
      {
        where: { id: recipeRow.ingredient_id },
        transaction: options.transaction
      }
    );
  }

  await refreshItemAvailability(itemId, options);
}

async function recalculateAllAvailability(options = {}) {
  const items = await Item.findAll({ attributes: ['id'], transaction: options.transaction });
  const results = [];

  for (const item of items) {
    const is_available = await refreshItemAvailability(item.id, options);
    results.push({ item_id: item.id, is_available });
  }

  return results;
}

module.exports = {
  adjustInventoryForItem,
  ensureStockForItem,
  recalculateAllAvailability
};
