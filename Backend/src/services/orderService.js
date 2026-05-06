const { sequelize, Item, Order, OrderItem, Table } = require('../models');
const httpError = require('../utils/httpError');
const { adjustInventoryForItem, ensureStockForItem } = require('./inventoryService');

function calculateSubtotal(price, quantity) {
  return Number(price) * Number(quantity);
}

async function refreshOrderTotal(orderId, options = {}) {
  const orderItems = await OrderItem.findAll({
    where: { order_id: orderId },
    transaction: options.transaction
  });

  const total = orderItems.reduce((sum, orderItem) => sum + Number(orderItem.subtotal), 0);

  await Order.update(
    { total_amount: total },
    {
      where: { id: orderId },
      transaction: options.transaction
    }
  );

  return total;
}

async function getCounterTable(options = {}) {
  const [table] = await Table.findOrCreate({
    where: { table_number: 'COUNTER' },
    defaults: {
      table_number: 'COUNTER',
      capacity: 1,
      status: 'free'
    },
    transaction: options.transaction
  });

  return table;
}

async function createOrder({ table_id, waiter_id, items, manual = false }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw httpError(400, 'Order must contain at least one item.');
  }

  return sequelize.transaction(async (transaction) => {
    const table = manual
      ? await getCounterTable({ transaction })
      : await Table.findByPk(table_id, { transaction });

    if (!table) {
      throw httpError(404, 'Table was not found.');
    }

    const order = await Order.create(
      {
        table_id: table.id,
        waiter_id,
        status: 'new',
        total_amount: 0
      },
      { transaction }
    );

    for (const requestedItem of items) {
      const quantity = Number(requestedItem.quantity);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw httpError(400, 'Item quantity must be a positive integer.');
      }

      const item = await ensureStockForItem(requestedItem.item_id, quantity, { transaction });

      await OrderItem.create(
        {
          order_id: order.id,
          item_id: item.id,
          quantity,
          price: item.price,
          subtotal: calculateSubtotal(item.price, quantity),
          status: 'ordered'
        },
        { transaction }
      );

      await adjustInventoryForItem(item.id, quantity, { transaction });
    }

    const total_amount = await refreshOrderTotal(order.id, { transaction });

    if (!manual) {
      await Table.update(
        { status: 'occupied' },
        {
          where: { id: table.id },
          transaction
        }
      );
    }

    return Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items' }],
      transaction
    }).then((savedOrder) => {
      savedOrder.setDataValue('total_amount', total_amount);
      return savedOrder;
    });
  });
}

async function addItemToOrder(orderId, itemId, quantity) {
  if (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0) {
    throw httpError(400, 'Item quantity must be a positive integer.');
  }

  return sequelize.transaction(async (transaction) => {
    const order = await Order.findByPk(orderId, { transaction });

    if (!order) {
      throw httpError(404, 'Order was not found.');
    }

    const item = await ensureStockForItem(itemId, Number(quantity), { transaction });

    const orderItem = await OrderItem.create(
      {
        order_id: order.id,
        item_id: item.id,
        quantity,
        price: item.price,
        subtotal: calculateSubtotal(item.price, quantity),
        status: 'ordered'
      },
      { transaction }
    );

    await adjustInventoryForItem(item.id, Number(quantity), { transaction });
    await refreshOrderTotal(order.id, { transaction });

    return orderItem;
  });
}

async function updateOrderItemQuantity(orderId, itemId, quantity) {
  const nextQuantity = Number(quantity);

  if (!Number.isInteger(nextQuantity) || nextQuantity <= 0) {
    throw httpError(400, 'Item quantity must be a positive integer.');
  }

  return sequelize.transaction(async (transaction) => {
    const orderItem = await OrderItem.findOne({
      where: { order_id: orderId, item_id: itemId },
      transaction
    });

    if (!orderItem) {
      throw httpError(404, 'Order item was not found.');
    }

    const delta = nextQuantity - Number(orderItem.quantity);

    if (delta > 0) {
      await ensureStockForItem(itemId, delta, { transaction });
    }

    await adjustInventoryForItem(itemId, delta, { transaction });

    await orderItem.update(
      {
        quantity: nextQuantity,
        subtotal: calculateSubtotal(orderItem.price, nextQuantity)
      },
      { transaction }
    );

    await refreshOrderTotal(orderId, { transaction });

    return orderItem;
  });
}

async function removeOrderItem(orderId, itemId) {
  return sequelize.transaction(async (transaction) => {
    const orderItem = await OrderItem.findOne({
      where: { order_id: orderId, item_id: itemId },
      transaction
    });

    if (!orderItem) {
      throw httpError(404, 'Order item was not found.');
    }

    await adjustInventoryForItem(itemId, -Number(orderItem.quantity), { transaction });
    await orderItem.destroy({ transaction });
    await refreshOrderTotal(orderId, { transaction });
  });
}

module.exports = {
  addItemToOrder,
  createOrder,
  refreshOrderTotal,
  removeOrderItem,
  updateOrderItemQuantity
};
