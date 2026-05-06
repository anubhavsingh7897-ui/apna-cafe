const jwt = require('jsonwebtoken');

const { User } = require('../models');
const httpError = require('../utils/httpError');

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw httpError(401, 'Authentication token is required.');
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'change_this_secret');
    const user = await User.findByPk(payload.id, {
      attributes: ['id', 'name', 'phone', 'role', 'is_active', 'created_at']
    });

    if (!user || !user.is_active) {
      throw httpError(401, 'User is not active or does not exist.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(httpError(401, 'Invalid or expired token.'));
      return;
    }

    next(error);
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      next(httpError(401, 'Authentication is required.'));
      return;
    }

    if (req.user.role === 'admin' || roles.includes(req.user.role)) {
      next();
      return;
    }

    next(httpError(403, 'You do not have permission to access this resource.'));
  };
}

module.exports = {
  authenticate,
  authorize
};
