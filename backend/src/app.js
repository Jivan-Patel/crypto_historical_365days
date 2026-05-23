const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use('/auth', authRoutes);

// Health check
app.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Not Found' }));

module.exports = app;
