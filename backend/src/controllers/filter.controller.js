const Coin = require('../models/coin.model');

const getPagination = (query, defaultLimit = 20, maxLimit = 100) => {
	const page = Math.max(1, parseInt(query.page, 10) || 1);
	const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
	const skip = (page - 1) * limit;
	return { page, limit, skip };
};

const runFilterQuery = async (req, res, querySpec) => {
	try {
		const { page, limit, skip } = getPagination(req.query);
		const filter = { ...querySpec, deleted: false };

		const total = await Coin.countDocuments(filter);
		const data = await Coin.find(filter).sort({ date: -1, coin_id: 1 }).skip(skip).limit(limit).lean();

		return res.json({ success: true, data, meta: { total, page, limit } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.filterHighPrice = (req, res) => {
	return runFilterQuery(req, res, { price: { $gte: 1000 } });
};

exports.filterLowPrice = (req, res) => {
	return runFilterQuery(req, res, { price: { $lt: 10 } });
};

exports.filterHighVolume = (req, res) => {
	return runFilterQuery(req, res, { volume: { $gte: 10000000 } });
};

exports.filterLowVolume = (req, res) => {
	return runFilterQuery(req, res, { volume: { $lt: 1000000 } });
};

exports.filterHighMarketCap = (req, res) => {
	return runFilterQuery(req, res, { market_cap: { $gte: 1000000000 } });
};

exports.filterLowMarketCap = (req, res) => {
	return runFilterQuery(req, res, { market_cap: { $lt: 100000000 } });
};

exports.filterHighVolatility = (req, res) => {
	return runFilterQuery(req, res, { volatility_7d: { $gte: 10 } });
};

exports.filterLowVolatility = (req, res) => {
	return runFilterQuery(req, res, { volatility_7d: { $lt: 2 } });
};

exports.filterHighReturn = (req, res) => {
	return runFilterQuery(req, res, { daily_return: { $gte: 5 } });
};

exports.filterNegativeReturn = (req, res) => {
	return runFilterQuery(req, res, { daily_return: { $lt: 0 } });
};

exports.filterBullish = (req, res) => {
	return runFilterQuery(req, res, {
		$expr: {
			$and: [
				{ $gt: ['$price', '$price_ma7'] },
				{ $gt: ['$daily_return', 0] }
			]
		}
	});
};

exports.filterBearish = (req, res) => {
	return runFilterQuery(req, res, {
		$expr: {
			$and: [
				{ $lt: ['$price', '$price_ma7'] },
				{ $lt: ['$daily_return', 0] }
			]
		}
	});
};

exports.filterProfitable = (req, res) => {
	return runFilterQuery(req, res, { daily_return: { $gt: 0 } });
};

exports.filterLossMaking = (req, res) => {
	return runFilterQuery(req, res, { daily_return: { $lt: 0 } });
};

exports.filterMissingValues = (req, res) => {
	return runFilterQuery(req, res, {
		$or: [
			{ price: null },
			{ market_cap: null },
			{ volume: null },
			{ daily_return: null }
		]
	});
};
