const express = require('express');
const router = express.Router();
const coinController = require('../controllers/coin.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Order matters: more specific routes first
router.get('/recent', coinController.getRecent);
router.get('/oldest', coinController.getOldest);
router.get('/newest', coinController.getNewest);
router.get('/top-losers', coinController.getTopLosers);
router.get('/trending', coinController.getTrending);
router.get('/latest', coinController.getLatest);
router.get('/top-market-cap', coinController.getTopMarketCap);
router.get('/top-volume', coinController.getTopVolume);
router.get('/top-gainers', coinController.getTopGainers);
router.get('/exists/:id', coinController.exists);
router.get('/month/:month', coinController.getByMonth);
router.get('/date/:date', coinController.getByDate);
router.get('/history/:coinId/:month', coinController.getHistoryByMonth);
router.get('/history/:coinId', coinController.getHistory);
router.get('/compare/:coin1/:coin2', coinController.compareTwoCoins);
router.get('/compare/:coin1/:coin2/:coin3', coinController.compareThreeCoins);
router.get('/performance/:coinId', coinController.getCoinPerformance);
router.get('/volatility/:coinId', coinController.getCoinVolatility);
router.get('/returns/:coinId', coinController.getCoinReturns);
router.get('/market-cap/:coinId', coinController.getMarketCapMetrics);
router.get('/volume/:coinId', coinController.getVolumeMetrics);
router.get('/price/:coinId', coinController.getPriceMetrics);
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
