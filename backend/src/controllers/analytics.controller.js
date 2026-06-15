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

exports.getHighestPrice = async (req, res) => {
	try {
		const doc = await Coin.findOne({ deleted: false, price: { $ne: null } }).sort({ price: -1 }).lean();
		if (!doc) return res.status(404).json({ success: false, message: 'No records found' });
		return res.json({ success: true, data: doc });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getLowestPrice = async (req, res) => {
	try {
		const doc = await Coin.findOne({ deleted: false, price: { $gt: 0 } }).sort({ price: 1 }).lean();
		if (!doc) return res.status(404).json({ success: false, message: 'No records found' });
		return res.json({ success: true, data: doc });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getAveragePrice = async (req, res) => {
	try {
		const result = await Coin.aggregate([
			{ $match: { deleted: false, price: { $ne: null } } },
			{ $group: { _id: null, averagePrice: { $avg: '$price' } } }
		]);
		const avg = result.length ? result[0].averagePrice : 0;
		return res.json({ success: true, data: { averagePrice: avg } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getPriceHistory = async (req, res) => {
	try {
		const { coinId } = req.params;
		const { page, limit, skip } = getPagination(req.query);
		const filter = { coin_id: coinId, deleted: false };

		const total = await Coin.countDocuments(filter);
		const data = await Coin.find(filter)
			.sort({ timestamp: 1 })
			.skip(skip)
			.limit(limit)
			.select('price date timestamp')
			.lean();

		return res.json({ success: true, data, meta: { total, page, limit } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getPriceTrend = async (req, res) => {
	try {
		const latest = await Coin.aggregate([
			{ $match: { deleted: false, daily_return: { $ne: null } } },
			{ $sort: { coin_id: 1, timestamp: -1 } },
			{ $group: { _id: '$coin_id', daily_return: { $first: '$daily_return' } } }
		]);

		if (!latest.length) {
			return res.json({ success: true, data: { trend: 'Neutral', percentBullish: 50, totalCoins: 0 } });
		}

		const upCoins = latest.filter(c => c.daily_return > 0).length;
		const ratio = upCoins / latest.length;
		const trend = ratio > 0.55 ? 'Bullish' : ratio < 0.45 ? 'Bearish' : 'Neutral';

		return res.json({
			success: true,
			data: {
				trend,
				percentBullish: Number((ratio * 100).toFixed(2)),
				totalCoins: latest.length
			}
		});
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getPriceGrowth = async (req, res) => {
	try {
		const { page, limit, skip } = getPagination(req.query, 10);
		const pipeline = [
			{ $match: { deleted: false, daily_return: { $ne: null } } },
			{ $sort: { coin_id: 1, timestamp: -1 } },
			{ $group: { _id: '$coin_id', doc: { $first: '$$ROOT' } } },
			{ $replaceRoot: { newRoot: '$doc' } },
			{ $sort: { daily_return: -1 } },
			{
				$facet: {
					data: [{ $skip: skip }, { $limit: limit }],
					meta: [{ $count: 'total' }]
				}
			}
		];

		const [result = { data: [], meta: [] }] = await Coin.aggregate(pipeline);
		const total = result.meta[0] ? result.meta[0].total : 0;

		return res.json({ success: true, data: result.data, meta: { total, page, limit } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getPriceDrop = async (req, res) => {
	try {
		const { page, limit, skip } = getPagination(req.query, 10);
		const pipeline = [
			{ $match: { deleted: false, daily_return: { $ne: null } } },
			{ $sort: { coin_id: 1, timestamp: -1 } },
			{ $group: { _id: '$coin_id', doc: { $first: '$$ROOT' } } },
			{ $replaceRoot: { newRoot: '$doc' } },
			{ $sort: { daily_return: 1 } },
			{
				$facet: {
					data: [{ $skip: skip }, { $limit: limit }],
					meta: [{ $count: 'total' }]
				}
			}
		];

		const [result = { data: [], meta: [] }] = await Coin.aggregate(pipeline);
		const total = result.meta[0] ? result.meta[0].total : 0;

		return res.json({ success: true, data: result.data, meta: { total, page, limit } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getHighestVolume = async (req, res) => {
	try {
		const doc = await Coin.findOne({ deleted: false, volume: { $ne: null } }).sort({ volume: -1 }).lean();
		if (!doc) return res.status(404).json({ success: false, message: 'No records found' });
		return res.json({ success: true, data: doc });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getLowestVolume = async (req, res) => {
	try {
		const doc = await Coin.findOne({ deleted: false, volume: { $gt: 0 } }).sort({ volume: 1 }).lean();
		if (!doc) return res.status(404).json({ success: false, message: 'No records found' });
		return res.json({ success: true, data: doc });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getAverageVolume = async (req, res) => {
	try {
		const result = await Coin.aggregate([
			{ $match: { deleted: false, volume: { $ne: null } } },
			{ $group: { _id: null, averageVolume: { $avg: '$volume' } } }
		]);
		const avg = result.length ? result[0].averageVolume : 0;
		return res.json({ success: true, data: { averageVolume: avg } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getVolumeSpikes = async (req, res) => {
	try {
		const { page, limit, skip } = getPagination(req.query);
		
		// 1. Calculate historical average volume per coin
		const averages = await Coin.aggregate([
			{ $match: { deleted: false, volume: { $gt: 0 } } },
			{ $group: { _id: '$coin_id', avgVolume: { $avg: '$volume' } } }
		]);
		
		const avgMap = {};
		averages.forEach(a => {
			avgMap[a._id] = a.avgVolume;
		});

		// 2. Fetch latest snapshot per coin
		const latestRecords = await getLatestSnapshots({ coin_id: 1 });

		// 3. Filter spikes where latest volume > 3 * average volume
		const spikes = latestRecords.filter(r => {
			const avg = avgMap[r.coin_id];
			return avg && r.volume > 3 * avg;
		});

		const total = spikes.length;
		const paginatedData = spikes.slice(skip, skip + limit);

		return res.json({ success: true, data: paginatedData, meta: { total, page, limit } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getTopReturns = async (req, res) => {
	try {
		const { page, limit, skip } = getPagination(req.query, 10);
		const pipeline = [
			{ $match: { deleted: false, daily_return: { $ne: null } } },
			{ $sort: { coin_id: 1, timestamp: -1 } },
			{ $group: { _id: '$coin_id', doc: { $first: '$$ROOT' } } },
			{ $replaceRoot: { newRoot: '$doc' } },
			{ $sort: { daily_return: -1 } },
			{
				$facet: {
					data: [{ $skip: skip }, { $limit: limit }],
					meta: [{ $count: 'total' }]
				}
			}
		];

		const [result = { data: [], meta: [] }] = await Coin.aggregate(pipeline);
		const total = result.meta[0] ? result.meta[0].total : 0;

		return res.json({ success: true, data: result.data, meta: { total, page, limit } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getNegativeReturns = async (req, res) => {
	try {
		const { page, limit, skip } = getPagination(req.query, 10);
		const pipeline = [
			{ $match: { deleted: false, daily_return: { $lt: 0 } } },
			{ $sort: { coin_id: 1, timestamp: -1 } },
			{ $group: { _id: '$coin_id', doc: { $first: '$$ROOT' } } },
			{ $replaceRoot: { newRoot: '$doc' } },
			{ $sort: { daily_return: 1 } },
			{
				$facet: {
					data: [{ $skip: skip }, { $limit: limit }],
					meta: [{ $count: 'total' }]
				}
			}
		];

		const [result = { data: [], meta: [] }] = await Coin.aggregate(pipeline);
		const total = result.meta[0] ? result.meta[0].total : 0;

		return res.json({ success: true, data: result.data, meta: { total, page, limit } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getCumulativeReturns = async (req, res) => {
	try {
		const { page, limit, skip } = getPagination(req.query, 10);
		const pipeline = [
			{ $match: { deleted: false, cumulative_return: { $ne: null } } },
			{ $sort: { coin_id: 1, timestamp: -1 } },
			{ $group: { _id: '$coin_id', doc: { $first: '$$ROOT' } } },
			{ $replaceRoot: { newRoot: '$doc' } },
			{ $sort: { cumulative_return: -1 } },
			{
				$facet: {
					data: [{ $skip: skip }, { $limit: limit }],
					meta: [{ $count: 'total' }]
				}
			}
		];

		const [result = { data: [], meta: [] }] = await Coin.aggregate(pipeline);
		const total = result.meta[0] ? result.meta[0].total : 0;

		return res.json({ success: true, data: result.data, meta: { total, page, limit } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getHighVolatilityList = async (req, res) => {
	try {
		const { page, limit, skip } = getPagination(req.query, 10);
		const pipeline = [
			{ $match: { deleted: false, volatility_7d: { $ne: null } } },
			{ $sort: { coin_id: 1, timestamp: -1 } },
			{ $group: { _id: '$coin_id', doc: { $first: '$$ROOT' } } },
			{ $replaceRoot: { newRoot: '$doc' } },
			{ $sort: { volatility_7d: -1 } },
			{
				$facet: {
					data: [{ $skip: skip }, { $limit: limit }],
					meta: [{ $count: 'total' }]
				}
			}
		];

		const [result = { data: [], meta: [] }] = await Coin.aggregate(pipeline);
		const total = result.meta[0] ? result.meta[0].total : 0;

		return res.json({ success: true, data: result.data, meta: { total, page, limit } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};
