const express = require('express');
const router = express.Router();
const coinController = require('../controllers/coin.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Order matters: more specific routes first
router.get('/exists/:id', coinController.exists);
router.get('/month/:month', coinController.getByMonth);
router.get('/date/:date', coinController.getByDate);
router.get('/history/:coinId', coinController.getHistory);
router.get('/name/:coinName', coinController.getByName);
router.get('/symbol/:symbol', coinController.getBySymbol);
router.get('/rank/:rank', coinController.getByRank);
router.get('/:id', coinController.getCoinById);
router.get('/', coinController.getAllCoins);

router.post('/', authMiddleware, coinController.createCoin);
router.put('/:id', authMiddleware, coinController.updateCoin);
router.patch('/:id', authMiddleware, coinController.patchCoin);
// Bulk operations and delete
router.post('/bulk-create', authMiddleware, coinController.bulkCreate);
router.patch('/bulk-update', authMiddleware, coinController.bulkUpdate);
router.delete('/bulk-delete', authMiddleware, coinController.bulkDelete);
router.delete('/:id', authMiddleware, coinController.deleteCoin);

module.exports = router;
