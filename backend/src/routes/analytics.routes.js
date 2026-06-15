const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');

router.get('/price/highest', analyticsController.getHighestPrice);
router.get('/price/lowest', analyticsController.getLowestPrice);
router.get('/price/average', analyticsController.getAveragePrice);
router.get('/price/history/:coinId', analyticsController.getPriceHistory);
router.get('/price/trend', analyticsController.getPriceTrend);
router.get('/price/growth', analyticsController.getPriceGrowth);
router.get('/price/drop', analyticsController.getPriceDrop);

router.get('/volume/highest', analyticsController.getHighestVolume);
router.get('/volume/lowest', analyticsController.getLowestVolume);
router.get('/volume/average', analyticsController.getAverageVolume);
router.get('/volume/spike', analyticsController.getVolumeSpikes);

router.get('/returns/top', analyticsController.getTopReturns);
router.get('/returns/negative', analyticsController.getNegativeReturns);
router.get('/returns/cumulative', analyticsController.getCumulativeReturns);

router.get('/volatility/high', analyticsController.getHighVolatilityList);

module.exports = router;
