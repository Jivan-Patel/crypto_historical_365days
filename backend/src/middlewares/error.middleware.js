// Global error handling middleware
module.exports = (err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  const payload = {
    success: false,
    message: err.message || 'Internal Server Error'
  };

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
};
