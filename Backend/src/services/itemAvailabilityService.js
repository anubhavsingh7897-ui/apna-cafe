const { Item, Ingredient, ItemIngredient } = require('../models');

async function calculateItemAvailability(itemId, options = {}) {
  const item = await Item.findByPk(itemId, {
    include: [
      {
        model: ItemIngredient,
        as: 'item_ingredients',
        include: [
          {
            model: Ingredient,
            as: 'ingredient'
          }
        ]
      }
    ],
    transaction: options.transaction
  });

  if (!item) {
    return null;
  }

  if (item.manual_override) {
    return true;
  }

  return item.item_ingredients.every((itemIngredient) => {
    const required = Number(itemIngredient.quantity_required);
    const stock = Number(itemIngredient.ingredient.stock_quantity);

    return stock >= required;
  });
}

async function refreshItemAvailability(itemId, options = {}) {
  const isAvailable = await calculateItemAvailability(itemId, options);

  if (isAvailable === null) {
    return null;
  }

  await Item.update(
    { is_available: isAvailable },
    {
      where: { id: itemId },
      transaction: options.transaction
    }
  );

  return isAvailable;
}

module.exports = {
  calculateItemAvailability,
  refreshItemAvailability
};
