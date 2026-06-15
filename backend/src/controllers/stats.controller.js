const Coin = require('../models/coin.model');

const getPagination = (query, defaultLimit = 20, maxLimit = 100) => {
	const page = Math.max(1, parseInt(query.page, 10) || 1);
	const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
	const skip = (page - 1) * limit;
	return { page, limit, skip };
};

const getLatestSnapshots = async (sortSpec = { coin_id: 1 }) => {
	return Coin.aggregate([
		{ $match: { deleted: false } },
		{ $sort: { coin_id: 1, timestamp: -1 } },
		{ $group: { _id: '$coin_id', doc: { $first: '$$ROOT' } } },
		{ $replaceRoot: { newRoot: '$doc' } },
		{ $sort: sortSpec }
	]);
};

exports.getTotalMarketCap = async (req, res) => {
	try {
		const latest = await getLatestSnapshots();
		const total = latest.reduce((sum, c) => sum + (c.market_cap || 0), 0);
		return res.json({ success: true, data: { totalMarketCap: total } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getStatsAveragePrice = async (req, res) => {
	try {
		const latest = await getLatestSnapshots();
		const validPrices = latest.filter(c => c.price !== null && c.price > 0);
		const avg = validPrices.length ? validPrices.reduce((sum, c) => sum + c.price, 0) / validPrices.length : 0;
		return res.json({ success: true, data: { averagePrice: avg } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getStatsAverageVolume = async (req, res) => {
	try {
		const latest = await getLatestSnapshots();
		const validVols = latest.filter(c => c.volume !== null && c.volume > 0);
		const avg = validVols.length ? validVols.reduce((sum, c) => sum + c.volume, 0) / validVols.length : 0;
		return res.json({ success: true, data: { averageVolume: avg } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getHighestMarketCapCoin = async (req, res) => {
	try {
		const latest = await getLatestSnapshots({ market_cap: -1 });
		const coin = latest.length ? latest[0] : null;
		if (!coin) return res.status(404).json({ success: false, message: 'No records found' });
		return res.json({ success: true, data: coin });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getHighestVolumeCoin = async (req, res) => {
	try {
		const latest = await getLatestSnapshots({ volume: -1 });
		const coin = latest.length ? latest[0] : null;
		if (!coin) return res.status(404).json({ success: false, message: 'No records found' });
		return res.json({ success: true, data: coin });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getStatsTopGainers = async (req, res) => {
	try {
		const { page, limit, skip } = getPagination(req.query, 10);
		const latest = await getLatestSnapshots({ daily_return: -1 });
		const paginated = latest.slice(skip, skip + limit);
		return res.json({ success: true, data: paginated, meta: { total: latest.length, page, limit } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getStatsTopLosers = async (req, res) => {
	try {
		const { page, limit, skip } = getPagination(req.query, 10);
		const latest = await getLatestSnapshots({ daily_return: 1 });
		const paginated = latest.slice(skip, skip + limit);
		return res.json({ success: true, data: paginated, meta: { total: latest.length, page, limit } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getMonthlyAnalysis = async (req, res) => {
	try {
		const stats = await Coin.aggregate([
			{ $match: { deleted: false } },
			{
				$group: {
					_id: '$month',
					avgPrice: { $avg: '$price' },
					avgVolume: { $avg: '$volume' },
					avgMarketCap: { $avg: '$market_cap' },
					avgDailyReturn: { $avg: '$daily_return' },
					count: { $sum: 1 }
				}
			},
			{ $sort: { _id: -1 } }
		]);
		return res.json({ success: true, data: stats });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getCoinCount = async (req, res) => {
	try {
		const uniqueIds = await Coin.distinct('coin_id', { deleted: false });
		return res.json({ success: true, data: { count: uniqueIds.length } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getRankDistribution = async (req, res) => {
	try {
		const latest = await getLatestSnapshots();
		const distribution = { '1-10': 0, '11-50': 0, '51-100': 0, '100+': 0 };
		latest.forEach(c => {
			const r = c.market_cap_rank;
			if (r >= 1 && r <= 10) distribution['1-10']++;
			else if (r >= 11 && r <= 50) distribution['11-50']++;
			else if (r >= 51 && r <= 100) distribution['51-100']++;
			else if (r > 100) distribution['100+']++;
		});
		return res.json({ success: true, data: distribution });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getPriceDistribution = async (req, res) => {
	try {
		const latest = await getLatestSnapshots();
		const distribution = { under_1: 0, '1_10': 0, '10_100': 0, '100_1000': 0, over_1000: 0 };
		latest.forEach(c => {
			const p = c.price;
			if (p === null || p === undefined) return;
			if (p < 1) distribution.under_1++;
			else if (p >= 1 && p < 10) distribution['1_10']++;
			else if (p >= 10 && p < 100) distribution['10_100']++;
			else if (p >= 100 && p < 1000) distribution['100_1000']++;
			else if (p >= 1000) distribution.over_1000++;
		});
		return res.json({ success: true, data: distribution });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getVolatilityDistribution = async (req, res) => {
	try {
		const latest = await getLatestSnapshots();
		const distribution = { low: 0, medium: 0, high: 0, extreme: 0 };
		latest.forEach(c => {
			const v = c.volatility_7d;
			if (v === null || v === undefined) return;
			if (v < 2) distribution.low++;
			else if (v >= 2 && v < 5) distribution.medium++;
			else if (v >= 5 && v < 10) distribution.high++;
			else if (v >= 10) distribution.extreme++;
		});
		return res.json({ success: true, data: distribution });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getMarketSummary = async (req, res) => {
	try {
		const latest = await getLatestSnapshots();
		const totalMarketCap = latest.reduce((sum, c) => sum + (c.market_cap || 0), 0);
		const validPrices = latest.filter(c => c.price !== null && c.price > 0);
		const averagePrice = validPrices.length ? validPrices.reduce((sum, c) => sum + c.price, 0) / validPrices.length : 0;
		const validVols = latest.filter(c => c.volume !== null && c.volume > 0);
		const averageVolume = validVols.length ? validVols.reduce((sum, c) => sum + c.volume, 0) / validVols.length : 0;

		const sortedByReturn = latest.filter(c => c.daily_return !== null).sort((a, b) => b.daily_return - a.daily_return);
		const topGainer = sortedByReturn.length ? sortedByReturn[0] : null;
		const topLoser = sortedByReturn.length ? sortedByReturn[sortedByReturn.length - 1] : null;

		return res.json({
			success: true,
			data: {
				totalMarketCap,
				averagePrice,
				averageVolume,
				coinCount: latest.length,
				topGainer,
				topLoser
			}
		});
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getDailyAnalysis = async (req, res) => {
	try {
		const stats = await Coin.aggregate([
			{ $match: { deleted: false } },
			{
				$group: {
					_id: '$date',
					avgPrice: { $avg: '$price' },
					avgVolume: { $avg: '$volume' },
					avgMarketCap: { $avg: '$market_cap' },
					avgDailyReturn: { $avg: '$daily_return' },
					count: { $sum: 1 }
				}
			},
			{ $sort: { _id: -1 } }
		]);
		return res.json({ success: true, data: stats });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getYearlyAnalysis = async (req, res) => {
	try {
		const stats = await Coin.aggregate([
			{ $match: { deleted: false } },
			{
				$group: {
					_id: { $substr: ['$date', 0, 4] },
					avgPrice: { $avg: '$price' },
					avgVolume: { $avg: '$volume' },
					avgMarketCap: { $avg: '$market_cap' },
					avgDailyReturn: { $avg: '$daily_return' },
					count: { $sum: 1 }
				}
			},
			{ $sort: { _id: -1 } }
		]);
		return res.json({ success: true, data: stats });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};
