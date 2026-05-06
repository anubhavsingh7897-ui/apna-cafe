const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const { User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    process.env.JWT_SECRET || 'change_this_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

const login = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    throw httpError(400, 'Phone/email and password are required.');
  }

  const user = await User.findOne({
    where: {
      [Op.or]: [{ phone }, { email: phone }]
    }
  });

  if (!user || !user.is_active) {
    throw httpError(401, 'Invalid credentials.');
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    throw httpError(401, 'Invalid credentials.');
  }

  res.json({
    token: signToken(user),
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      is_active: user.is_active
    }
  });
});

const signup = asyncHandler(async (req, res) => {
  const { name, phone, email, password, role = 'waiter' } = req.body;

  if (!name || !phone || !password) {
    throw httpError(400, 'Name, phone, and password are required.');
  }

  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ phone }, ...(email ? [{ email }] : [])]
    }
  });

  if (existingUser) {
    throw httpError(409, 'A user with this phone number already exists.');
  }

  const password_hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    phone,
    email,
    role,
    password_hash,
    is_active: true
  });

  res.status(201).json({
    token: signToken(user),
    user: {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role,
      is_active: user.is_active
    }
  });
});

const logout = asyncHandler(async (req, res) => {
  res.json({ message: 'Logged out successfully.' });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

module.exports = {
  login,
  logout,
  me,
  signup
};
