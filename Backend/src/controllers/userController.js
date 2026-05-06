const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

const { User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

const safeAttributes = ['id', 'name', 'phone', 'email', 'role', 'is_active', 'created_at'];

const createUser = asyncHandler(async (req, res) => {
  const { name, phone, email, role, password, is_active } = req.body;

  if (!name || !phone || !email || !role || !password) {
    throw httpError(400, 'Name, phone, email, role, and password are required.');
  }

  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ phone }, { email }]
    }
  });

  if (existingUser) {
    if (existingUser.phone === phone) {
      throw httpError(409, 'Phone number is already used by another staff user.');
    }

    throw httpError(409, 'Email is already used by another staff user.');
  }

  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, phone, email, role, password_hash, is_active });

  const savedUser = await User.findByPk(user.id, { attributes: safeAttributes });

  res.status(201).json(savedUser);
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await User.findAll({
    attributes: safeAttributes,
    order: [['created_at', 'DESC']]
  });

  res.json(users);
});

const getUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, { attributes: safeAttributes });

  if (!user) {
    throw httpError(404, 'User was not found.');
  }

  res.json(user);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);

  if (!user) {
    throw httpError(404, 'User was not found.');
  }

  const updates = { ...req.body };

  if (updates.password) {
    updates.password_hash = await bcrypt.hash(updates.password, 10);
    delete updates.password;
  }

  await user.update(updates);

  const updatedUser = await User.findByPk(user.id, { attributes: safeAttributes });
  res.json(updatedUser);
});

const deleteUser = asyncHandler(async (req, res) => {
  const deleted = await User.destroy({ where: { id: req.params.id } });

  if (!deleted) {
    throw httpError(404, 'User was not found.');
  }

  res.status(204).send();
});

module.exports = {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateUser
};
