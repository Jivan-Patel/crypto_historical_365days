const express = require('express');
const router = express.Router();
const coinController = require('../controllers/coin.controller');

// Order matters: more specific routes first
router.get('/exists/:id', coinController.exists);
router.get('/:id', coinController.getCoinById);
router.get('/', coinController.getAllCoins);

module.exports = router;
