const { v4: uuidv4 } = require('uuid');

// Simple request logger + basic request validation
module.exports = (options = {}) => {
  const maxJsonSize = options.maxJsonSize || 1 * 1024 * 1024; // 1MB

  return (req, res, next) => {
    const id = uuidv4();
    req.id = id;
    const start = process.hrtime();

    // Basic JSON size safeguard
    if (req.is('application/json') && req.headers['content-length']) {
      const size = parseInt(req.headers['content-length'], 10);
      if (!Number.isNaN(size) && size > maxJsonSize) {
        return res.status(413).json({ success: false, message: 'Payload too large' });
      }
    }

    res.on('finish', () => {
      const diff = process.hrtime(start);
      const ms = diff[0] * 1e3 + diff[1] / 1e6;
      // eslint-disable-next-line no-console
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${ms.toFixed(2)} ms - reqId=${id}`);
    });

    next();
  };
};
