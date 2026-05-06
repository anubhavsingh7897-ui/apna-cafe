const { sequelize } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const {
  adjustInventoryForItem,
  recalculateAllAvailability
} = require('../services/inventoryService');
const { refreshItemAvailability } = require('../services/itemAvailabilityService');

const updateItemAvailability = asyncHandler(async (req, res) => {
  const is_available = await refreshItemAvailability(req.params.itemId);
  res.json({ item_id: Number(req.params.itemId), is_available });
});

const recalculateAvailability = asyncHandler(async (req, res) => {
  const results = await recalculateAllAvailability();
  res.json(results);
});

const deductInventory = asyncHandler(async (req, res) => {
  const { item_id, quantity } = req.body;

  await sequelize.transaction(async (transaction) => {
    await adjustInventoryForItem(item_id, Number(quantity), { transaction });
  });

  res.json({ message: 'Inventory deducted successfully.' });
});

module.exports = {
  deductInventory,
  recalculateAvailability,
  updateItemAvailability
};
