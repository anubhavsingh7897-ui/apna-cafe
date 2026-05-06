const { Order, OrderItem, Item, Table } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const kitchenItemStatuses = ['preparing', 'ready'];

const listKitchenOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findAll({
    where: {
      status: ['new', 'preparing', 'ready']
    },
    include: [
      { model: Table, as: 'table' },
      {
        model: OrderItem,
        as: 'items',
        where: {
          status: ['ordered', 'preparing', 'ready']
        },
        required: false,
        include: [{ model: Item, as: 'item' }]
      }
    ],
    order: [['created_at', 'ASC']]
  });

  res.json(orders);
});

const updateOrderItemStatus = asyncHandler(async (req, res) => {
  const orderItem = await OrderItem.findByPk(req.params.id);

  if (!orderItem) {
    throw httpError(404, 'Order item was not found.');
  }

  if (!kitchenItemStatuses.includes(req.body.status)) {
    throw httpError(400, 'Kitchen can only set item status to preparing or ready.');
  }

  await orderItem.update({ status: req.body.status });
  res.json({
    ...orderItem.toJSON(),
    message: `Item status updated to ${req.body.status}.`
  });
});

module.exports = {
  listKitchenOrders,
  updateOrderItemStatus
};
