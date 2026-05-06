const { Op } = require('sequelize');

const { Order, Payment } = require('../models');

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date, days) {
  return new Date(date.getTime() + days * DAY_MS);
}

function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function dateKey(date) {
  const value = new Date(date);
  return value.toISOString().slice(0, 10);
}

function monthKey(date) {
  const value = new Date(date);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`;
}

function shortDateLabel(key) {
  return new Date(`${key}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short'
  });
}

function shortMonthLabel(key) {
  return new Date(`${key}-01T00:00:00`).toLocaleDateString('en-IN', {
    month: 'short',
    year: '2-digit'
  });
}

function percentChange(current, previous) {
  const currentValue = Number(current || 0);
  const previousValue = Number(previous || 0);

  if (!previousValue) {
    return currentValue ? 100 : 0;
  }

  return Number((((currentValue - previousValue) / previousValue) * 100).toFixed(1));
}

function emptyMetric(key, label) {
  return {
    key,
    label,
    billCount: 0,
    customerCount: 0,
    collection: 0,
    cumulativeCollection: 0
  };
}

function paymentAmount(payment) {
  return Number(payment.amount || 0);
}

async function getBillingAnalytics() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const tomorrowStart = addDays(todayStart, 1);
  const yesterdayStart = addDays(todayStart, -1);
  const currentMonthStart = startOfMonth(now);
  const nextMonthStart = addMonths(currentMonthStart, 1);
  const previousMonthStart = addMonths(currentMonthStart, -1);
  const firstChartDay = addDays(todayStart, -13);
  const firstChartMonth = addMonths(currentMonthStart, -5);

  const [payments, openOrders] = await Promise.all([
    Payment.findAll({
      where: {
        payment_status: 'completed',
        paid_at: { [Op.ne]: null }
      },
      include: [{ model: Order, as: 'order', attributes: ['id', 'total_amount', 'status'] }],
      order: [['paid_at', 'ASC']]
    }),
    Order.findAll({
      where: { status: { [Op.ne]: 'paid' } },
      attributes: ['id', 'total_amount', 'status']
    })
  ]);

  const dailyMap = new Map();
  const monthlyMap = new Map();
  let totalCollection = 0;

  for (let index = 0; index < 14; index += 1) {
    const key = dateKey(addDays(firstChartDay, index));
    dailyMap.set(key, emptyMetric(key, shortDateLabel(key)));
  }

  for (let index = 0; index < 6; index += 1) {
    const key = monthKey(addMonths(firstChartMonth, index));
    monthlyMap.set(key, emptyMetric(key, shortMonthLabel(key)));
  }

  payments.forEach((payment) => {
    const paidAt = new Date(payment.paid_at);
    const amount = paymentAmount(payment);
    const day = dateKey(paidAt);
    const month = monthKey(paidAt);

    totalCollection += amount;

    if (!dailyMap.has(day) && paidAt >= firstChartDay) {
      dailyMap.set(day, emptyMetric(day, shortDateLabel(day)));
    }

    if (!monthlyMap.has(month) && paidAt >= firstChartMonth) {
      monthlyMap.set(month, emptyMetric(month, shortMonthLabel(month)));
    }

    const dayRow = dailyMap.get(day);
    if (dayRow) {
      dayRow.billCount += 1;
      dayRow.customerCount += 1;
      dayRow.collection += amount;
    }

    const monthRow = monthlyMap.get(month);
    if (monthRow) {
      monthRow.billCount += 1;
      monthRow.customerCount += 1;
      monthRow.collection += amount;
    }
  });

  let runningCollection = 0;
  const dailySeries = [...dailyMap.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .slice(-14)
    .map((row) => {
      runningCollection += row.collection;
      return { ...row, cumulativeCollection: Number(runningCollection.toFixed(2)) };
    });

  runningCollection = 0;
  const monthlySeries = [...monthlyMap.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .slice(-6)
    .map((row) => {
      runningCollection += row.collection;
      return { ...row, cumulativeCollection: Number(runningCollection.toFixed(2)) };
    });

  const todayPayments = payments.filter((payment) => {
    const paidAt = new Date(payment.paid_at);
    return paidAt >= todayStart && paidAt < tomorrowStart;
  });

  const yesterdayPayments = payments.filter((payment) => {
    const paidAt = new Date(payment.paid_at);
    return paidAt >= yesterdayStart && paidAt < todayStart;
  });

  const monthPayments = payments.filter((payment) => {
    const paidAt = new Date(payment.paid_at);
    return paidAt >= currentMonthStart && paidAt < nextMonthStart;
  });

  const previousMonthPayments = payments.filter((payment) => {
    const paidAt = new Date(payment.paid_at);
    return paidAt >= previousMonthStart && paidAt < currentMonthStart;
  });

  const todayCollection = todayPayments.reduce((sum, payment) => sum + paymentAmount(payment), 0);
  const yesterdayCollection = yesterdayPayments.reduce((sum, payment) => sum + paymentAmount(payment), 0);
  const monthCollection = monthPayments.reduce((sum, payment) => sum + paymentAmount(payment), 0);
  const previousMonthCollection = previousMonthPayments.reduce((sum, payment) => sum + paymentAmount(payment), 0);
  const openBillAmount = openOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0);

  return {
    daily: Number(todayCollection.toFixed(2)),
    weekly: Number(dailySeries.slice(-7).reduce((sum, row) => sum + row.collection, 0).toFixed(2)),
    monthly: Number(monthCollection.toFixed(2)),
    totals: {
      bills: payments.length,
      customers: payments.length,
      collection: Number(totalCollection.toFixed(2)),
      openBills: openOrders.length,
      openBillAmount: Number(openBillAmount.toFixed(2))
    },
    today: {
      bills: todayPayments.length,
      customers: todayPayments.length,
      collection: Number(todayCollection.toFixed(2))
    },
    comparisons: {
      day: {
        bills: percentChange(todayPayments.length, yesterdayPayments.length),
        customers: percentChange(todayPayments.length, yesterdayPayments.length),
        collection: percentChange(todayCollection, yesterdayCollection)
      },
      month: {
        bills: percentChange(monthPayments.length, previousMonthPayments.length),
        customers: percentChange(monthPayments.length, previousMonthPayments.length),
        collection: percentChange(monthCollection, previousMonthCollection)
      }
    },
    charts: {
      daily: dailySeries,
      monthly: monthlySeries
    }
  };
}

module.exports = {
  getBillingAnalytics
};
