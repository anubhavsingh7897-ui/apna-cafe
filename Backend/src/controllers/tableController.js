const { Table } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const tableStatuses = ['free', 'occupied', 'billing'];

const listTables = asyncHandler(async (req, res) => {
  const tables = await Table.findAll({ order: [['table_number', 'ASC']] });
  res.json(tables);
});

const createTable = asyncHandler(async (req, res) => {
  const table = await Table.create(req.body);
  res.status(201).json({
    ...table.toJSON(),
    message: 'Table created successfully.'
  });
});

const updateTable = asyncHandler(async (req, res) => {
  const table = await Table.findByPk(req.params.id);

  if (!table) {
    throw httpError(404, 'Table was not found.');
  }

  if (req.body.status && !tableStatuses.includes(req.body.status)) {
    throw httpError(400, 'Invalid table status.');
  }

  await table.update(req.body);
  res.json({
    ...table.toJSON(),
    message: 'Table updated successfully.'
  });
});

module.exports = {
  createTable,
  listTables,
  updateTable
};
