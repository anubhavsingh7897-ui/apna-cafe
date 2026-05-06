const { sequelize, Order, Payment, Table } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');
const { getBillingAnalytics } = require('../services/billingAnalyticsService');

const createPayment = asyncHandler(async (req, res) => {
  const { order_id, amount, payment_method } = req.body;

  const payment = await sequelize.transaction(async (transaction) => {
    const order = await Order.findByPk(order_id, { transaction });

    if (!order) {
      throw httpError(404, 'Order was not found.');
    }

    const savedPayment = await Payment.create(
      {
        order_id,
        amount,
        payment_method,
        payment_status: 'completed',
        paid_at: new Date()
      },
      { transaction }
    );

    await order.update({ status: 'paid' }, { transaction });
    await Table.update({ status: 'free' }, { where: { id: order.table_id }, transaction });

    return savedPayment;
  });

  res.status(201).json({
    ...payment.toJSON(),
    message: 'Payment collected successfully. Table cleared.'
  });
});

const getPaymentByOrder = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ where: { order_id: req.params.order_id } });

  if (!payment) {
    throw httpError(404, 'Payment was not found for this order.');
  }

  res.json(payment);
});

const getCollectionStats = asyncHandler(async (req, res) => {
  res.json(await getBillingAnalytics());
});

module.exports = {
  createPayment,
  getPaymentByOrder,
  getCollectionStats
};
