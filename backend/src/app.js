const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const coinRoutes = require('./routes/coin.routes');
const filterRoutes = require('./routes/filter.routes');
const searchRoutes = require('./routes/search.routes');
const loggerFactory = require('./middlewares/logger.middleware');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// Logger (request id + timing + basic validation)
app.use(loggerFactory());
app.use(cors());
app.use(express.json());

// API routes
app.use('/auth', authRoutes);
app.use('/coins/filter', filterRoutes);
app.use('/coins', coinRoutes);
app.use('/search', searchRoutes);

// Health check
app.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Not Found' }));

// Global error handler (should be last)
app.use(errorHandler);

module.exports = app;
