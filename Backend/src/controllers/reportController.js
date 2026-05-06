const { Op, fn, col, literal } = require('sequelize');

const { Order, OrderItem, Item } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { getBillingAnalytics } = require('../services/billingAnalyticsService');

function dayRange(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

function monthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);

  return { start, end };
}

async function salesSummary(range) {
  const orders = await Order.findAll({
    where: {
      status: 'paid',
      updated_at: {
        [Op.gte]: range.start,
        [Op.lt]: range.end
      }
    },
    attributes: [
      [fn('COUNT', col('id')), 'orders_count'],
      [fn('COALESCE', fn('SUM', col('total_amount')), 0), 'total_sales']
    ],
    raw: true
  });

  return orders[0];
}

const dailyReport = asyncHandler(async (req, res) => {
  res.json(await salesSummary(dayRange()));
});

const monthlyReport = asyncHandler(async (req, res) => {
  res.json(await salesSummary(monthRange()));
});

const topItems = asyncHandler(async (req, res) => {
  const items = await OrderItem.findAll({
    attributes: [
      'item_id',
      [fn('SUM', col('quantity')), 'quantity_sold'],
      [fn('SUM', col('subtotal')), 'sales_amount']
    ],
    include: [
      { model: Item, as: 'item', attributes: ['id', 'name', 'category'] },
      { model: Order, as: 'order', attributes: [], where: { status: 'paid' } }
    ],
    group: ['item_id', 'item.id', 'item.name', 'item.category'],
    order: [[literal('quantity_sold'), 'DESC']],
    limit: 10
  });

  res.json(items);
});

const billingAnalytics = asyncHandler(async (req, res) => {
  res.json(await getBillingAnalytics());
});

module.exports = {
  dailyReport,
  monthlyReport,
  topItems,
  billingAnalytics
};
