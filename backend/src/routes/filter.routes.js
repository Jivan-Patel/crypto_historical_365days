const express = require('express');
const router = express.Router();
const filterController = require('../controllers/filter.controller');

router.get('/high-price', filterController.filterHighPrice);
router.get('/low-price', filterController.filterLowPrice);
router.get('/high-volume', filterController.filterHighVolume);
router.get('/low-volume', filterController.filterLowVolume);
router.get('/high-market-cap', filterController.filterHighMarketCap);
router.get('/low-market-cap', filterController.filterLowMarketCap);
router.get('/high-volatility', filterController.filterHighVolatility);
router.get('/low-volatility', filterController.filterLowVolatility);
router.get('/high-return', filterController.filterHighReturn);
router.get('/negative-return', filterController.filterNegativeReturn);
router.get('/bullish', filterController.filterBullish);
router.get('/bearish', filterController.filterBearish);
router.get('/profitable', filterController.filterProfitable);
router.get('/loss-making', filterController.filterLossMaking);
router.get('/missing-values', filterController.filterMissingValues);

module.exports = router;
