const { Order, OrderItem, Item, Payment, Table, User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const {
  addItemToOrder,
  createOrder: createOrderService,
  removeOrderItem,
  updateOrderItemQuantity
} = require('../services/orderService');

const orderStatuses = ['new', 'preparing', 'ready', 'served', 'paid'];

const orderInclude = [
  { model: Table, as: 'table' },
  { model: User, as: 'waiter', attributes: ['id', 'name', 'phone', 'role'] },
  {
    model: OrderItem,
    as: 'items',
    include: [{ model: Item, as: 'item' }]
  },
  { model: Payment, as: 'payment' }
];

const createOrder = asyncHandler(async (req, res) => {
  const order = await createOrderService({
    table_id: req.body.table_id,
    waiter_id: req.user.id,
    items: req.body.items,
    manual: req.user.role === 'cashier' || Boolean(req.body.manual)
  });

  res.status(201).json({
    ...order.toJSON(),
    message: 'Order created successfully.'
  });
});

const listOrders = asyncHandler(async (req, res) => {
  const orders = await Order.findAll({
    include: orderInclude,
    order: [['created_at', 'DESC']]
  });

  res.json(orders);
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id, { include: orderInclude });

  if (!order) {
    throw httpError(404, 'Order was not found.');
  }

  res.json(order);
});

const getActiveOrderForTable = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    where: {
      table_id: req.params.id,
      status: ['new', 'preparing', 'ready', 'served']
    },
    include: orderInclude,
    order: [['created_at', 'DESC']]
  });

  if (!order) {
    throw httpError(404, 'No active order found for this table.');
  }

  res.json(order);
});

const addOrderItem = asyncHandler(async (req, res) => {
  const orderItem = await addItemToOrder(req.params.id, req.body.item_id, req.body.quantity);
  res.status(201).json({
    ...orderItem.toJSON(),
    message: 'Item added to order successfully.'
  });
});

const updateOrderItem = asyncHandler(async (req, res) => {
  const orderItem = await updateOrderItemQuantity(
    req.params.id,
    req.params.itemId,
    req.body.quantity
  );

  res.json({
    ...orderItem.toJSON(),
    message: 'Order item updated successfully.'
  });
});

const deleteOrderItem = asyncHandler(async (req, res) => {
  await removeOrderItem(req.params.id, req.params.itemId);
  res.json({ message: 'Order item removed successfully.' });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id);

  if (!order) {
    throw httpError(404, 'Order was not found.');
  }

  if (!orderStatuses.includes(req.body.status)) {
    throw httpError(400, 'Invalid order status.');
  }

  await order.update({ status: req.body.status });

  if (req.body.status === 'paid') {
    await Table.update({ status: 'free' }, { where: { id: order.table_id } });
  }

  res.json({
    ...order.toJSON(),
    message: `Order status updated to ${req.body.status}.`
  });
});

module.exports = {
  addOrderItem,
  createOrder,
  deleteOrderItem,
  getActiveOrderForTable,
  getOrder,
  listOrders,
  updateOrderItem,
  updateOrderStatus
};
