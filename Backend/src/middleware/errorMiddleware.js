function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  if (error.name === 'SequelizeValidationError') {
    res.status(400).json({
      message: error.errors.map((item) => item.message).join(', ')
    });
    return;
  }

  if (error.name === 'SequelizeUniqueConstraintError') {
    res.status(409).json({
      message: error.errors.map((item) => `${item.path} already exists`).join(', ')
    });
    return;
  }

  const statusCode = error.statusCode || 500;
  const message = statusCode >= 500
    ? 'Something went wrong. Please try again later.'
    : error.message || 'Request could not be completed.';

  res.status(statusCode).json({
    message
  });
}

module.exports = {
  notFound,
  errorHandler
};
