const express = require('express');
const router = express.Router();
const coinController = require('../controllers/coin.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/coins', authMiddleware, coinController.createCoin);
router.patch('/coins/:id', authMiddleware, coinController.patchCoin);
router.delete('/coins/:id', authMiddleware, coinController.deleteCoin);

module.exports = router;
