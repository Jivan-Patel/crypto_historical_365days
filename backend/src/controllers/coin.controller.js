const mongoose = require('mongoose');
const Coin = require('../models/coin.model');

const buildCoinPayload = (body, isPatch = false) => {
	const payload = {};
	const stringFields = ['coin_id', 'coin_name', 'symbol', 'date', 'month'];
	const numberFields = [
		'market_cap_rank',
		'price',
		'market_cap',
		'volume',
		'daily_return',
		'price_ma7',
		'price_ma30',
		'volatility_7d',
		'cumulative_return'
	];

	for (const field of stringFields) {
		if (body[field] !== undefined) payload[field] = String(body[field]).trim();
	}

	for (const field of numberFields) {
		if (body[field] !== undefined && body[field] !== '') {
			const value = Number(body[field]);
			if (Number.isNaN(value)) {
				throw new Error(`${field} must be a number`);
			}
			payload[field] = value;
		}
	}

	if (body.timestamp !== undefined) {
		const timestamp = new Date(body.timestamp);
		if (Number.isNaN(timestamp.getTime())) {
			throw new Error('timestamp must be a valid date');
		}
		payload.timestamp = timestamp;
	}

	if (!payload.month && payload.date && /^\d{4}-\d{2}-\d{2}$/.test(payload.date)) {
		payload.month = payload.date.slice(0, 7);
	}

	if (!isPatch) {
		const requiredFields = ['coin_id', 'coin_name', 'symbol', 'date', 'timestamp'];
		for (const field of requiredFields) {
			if (payload[field] === undefined || payload[field] === '') {
				throw new Error(`${field} is required`);
			}
		}
	}

	return payload;
};

const getPagination = (query, defaultLimit = 20, maxLimit = 100) => {
	const page = Math.max(1, parseInt(query.page, 10) || 1);
	const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
	const skip = (page - 1) * limit;
	return { page, limit, skip };
};

const parseSortParam = (value, defaultField = 'date', defaultDirection = -1, allowedFields = ['date']) => {
	if (!value) {
		return { [defaultField]: defaultDirection, coin_id: 1 };
	}

	const raw = String(value).trim();
	const [fieldPart, directionPart] = raw.split(':');
	const field = fieldPart || defaultField;
	if (!allowedFields.includes(field)) {
		throw new Error(`sort field must be one of: ${allowedFields.join(', ')}`);
	}

	const direction = String(directionPart || '').toLowerCase();
	const order = direction === 'asc' || direction === '1' ? 1 : direction === 'desc' || direction === '-1' || direction === '' ? -1 : null;
	if (order === null) {
		throw new Error('sort direction must be asc or desc');
	}

	return { [field]: order, coin_id: 1 };
};

const parseAdvancedCoinFilters = (query) => {
	const filter = { deleted: false };

	const normalizeSymbol = (value) => String(value).trim().toUpperCase();
	const parseNumber = (value, label) => {
		if (value === undefined || value === null || value === '') return undefined;
		const number = Number(value);
		if (Number.isNaN(number)) {
			throw new Error(`${label} must be a number`);
		}
		return number;
	};

	const applyExactAndRange = (fieldName, exactValue, minValue, maxValue, label) => {
		const exact = parseNumber(exactValue, label);
		const min = parseNumber(minValue, `min${label}`);
		const max = parseNumber(maxValue, `max${label}`);

		if (exact !== undefined && (min !== undefined || max !== undefined)) {
			throw new Error(`${label} cannot be combined with min/max filters`);
		}

		if (exact !== undefined) {
			filter[fieldName] = exact;
			return;
		}

		if (min !== undefined || max !== undefined) {
			filter[fieldName] = {};
			if (min !== undefined) filter[fieldName].$gte = min;
			if (max !== undefined) filter[fieldName].$lte = max;
		}
	};

	if (query.symbol !== undefined && query.symbol !== '') {
		filter.symbol = normalizeSymbol(query.symbol);
	}

	if (query.month !== undefined && query.month !== '') {
		if (!/^\d{4}-\d{2}$/.test(String(query.month))) {
			throw new Error('month must be YYYY-MM');
		}
		filter.month = String(query.month);
	}

	if (query.rank !== undefined && query.rank !== '') {
		const rank = parseNumber(query.rank, 'rank');
		filter.market_cap_rank = rank;
	}

	applyExactAndRange('price', query.price, query.minPrice, query.maxPrice, 'price');
	applyExactAndRange('volume', query.volume, query.minVolume, query.maxVolume, 'volume');
	applyExactAndRange('market_cap', query.marketCap, query.minMarketCap, query.maxMarketCap, 'marketCap');
	applyExactAndRange('daily_return', query.dailyReturn, query.minDailyReturn, query.maxDailyReturn, 'dailyReturn');
	applyExactAndRange('volatility_7d', query.volatility, query.minVolatility, query.maxVolatility, 'volatility');

	return filter;
};

const escapeRegExp = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildSearchClause = (search) => {
	const term = String(search || '').trim();
	if (!term) return null;
	const escaped = escapeRegExp(term);
	return {
		$or: [
			{ coin_name: new RegExp(escaped, 'i') },
			{ coin_id: new RegExp(escaped, 'i') },
			{ symbol: new RegExp(`^${escaped}$`, 'i') }
		]
	};
};

exports.getAllCoins = async (req, res) => {
	try {
		const { page, limit, skip } = getPagination(req.query);

		const filter = parseAdvancedCoinFilters(req.query);
		const searchClause = buildSearchClause(req.query.search);
		if (searchClause) {
			Object.assign(filter, searchClause);
		}

		const sort = parseSortParam(req.query.sort, 'date', -1, ['date', 'price', 'market_cap', 'volume', 'daily_return', 'timestamp', 'market_cap_rank']);

		const total = await Coin.countDocuments(filter);
		const data = await Coin.find(filter).sort(sort).skip(skip).limit(limit).lean();

		return res.json({ success: true, data, meta: { total, page, limit } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getCoinById = async (req, res) => {
	const id = req.params.id;
	try {
		const coin = await Coin.findOne({ coin_id: id, deleted: false }).lean();
		if (!coin) return res.status(404).json({ success: false, message: 'Coin not found' });
		return res.json({ success: true, data: coin });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

// Helper to parse pagination params
const parseLeaderboardPagination = (req) => {
	const { page, limit, skip } = getPagination(req.query, 10, 100);
	return { page, limit, skip };
};

const parseWindowPagination = (req) => {
	const { page, limit, skip } = getPagination(req.query, 20, 100);
	return { page, limit, skip };
};

const buildLatestCoinLeaderboard = async (sortSpec, req) => {
	const { page, limit, skip } = parseLeaderboardPagination(req);
	const pipeline = [
		{ $match: { deleted: false } },
		{ $sort: { coin_id: 1, timestamp: -1 } },
		{ $group: { _id: '$coin_id', doc: { $first: '$$ROOT' } } },
		{ $replaceRoot: { newRoot: '$doc' } },
		{ $sort: sortSpec },
		{
			$facet: {
				data: [{ $skip: skip }, { $limit: limit }],
				meta: [{ $count: 'total' }]
			}
		}
	];

	const [result = { data: [], meta: [] }] = await Coin.aggregate(pipeline);
	const total = result.meta[0] ? result.meta[0].total : 0;
	return { data: result.data, meta: { total, page, limit } };
};

exports.getByName = async (req, res) => {
	try {
		const { coinName } = req.params;
		const { page, limit, skip } = getPagination(req.query, 20, 100);
		const re = new RegExp(coinName, 'i'); // case-insensitive
		const filter = { coin_name: re, deleted: false };

		const total = await Coin.countDocuments(filter);
		const data = await Coin.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean();

		return res.json({ success: true, data, meta: { total, page, limit } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getBySymbol = async (req, res) => {
	try {
		const { symbol } = req.params;
		const { page, limit, skip } = getPagination(req.query, 20, 100);
		const re = new RegExp(`^${symbol}$`, 'i');
		const filter = { symbol: re, deleted: false };

		const total = await Coin.countDocuments(filter);
		const data = await Coin.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean();

		return res.json({ success: true, data, meta: { total, page, limit } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getByRank = async (req, res) => {
	try {
		const rank = Number(req.params.rank);
		if (Number.isNaN(rank)) return res.status(400).json({ success: false, message: 'rank must be a number' });
		const { page, limit, skip } = getPagination(req.query, 20, 100);
		const filter = { market_cap_rank: rank, deleted: false };

		const total = await Coin.countDocuments(filter);
		const data = await Coin.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean();

		return res.json({ success: true, data, meta: { total, page, limit } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

// GET /coins/month/:month  (YYYY-MM)
exports.getByMonth = async (req, res) => {
	try {
		const month = req.params.month;
		if (!/^[0-9]{4}-[0-9]{2}$/.test(month)) return res.status(400).json({ success: false, message: 'month must be YYYY-MM' });
		const { page, limit, skip } = getPagination(req.query, 20, 100);
		const filter = { month, deleted: false };

		const total = await Coin.countDocuments(filter);
		const data = await Coin.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean();

		return res.json({ success: true, data, meta: { total, page, limit } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

// GET /coins/date/:date  (YYYY-MM-DD)
exports.getByDate = async (req, res) => {
	try {
		const date = req.params.date;
		if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return res.status(400).json({ success: false, message: 'date must be YYYY-MM-DD' });
		const { page, limit, skip } = getPagination(req.query, 20, 100);
		const filter = { date, deleted: false };

		const total = await Coin.countDocuments(filter);
		const data = await Coin.find(filter).sort({ symbol: 1, timestamp: 1 }).skip(skip).limit(limit).lean();

		return res.json({ success: true, data, meta: { total, page, limit } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

// GET /coins/history/:coinId?start=YYYY-MM-DD&end=YYYY-MM-DD
exports.getHistory = async (req, res) => {
	try {
		const coinId = req.params.coinId;
		if (!coinId) return res.status(400).json({ success: false, message: 'coinId is required' });

		const { start, end } = req.query;
		const { page, limit, skip } = getPagination(req.query, 20, 100);

		const filter = { coin_id: coinId, deleted: false };

		if (start) {
			const s = new Date(start);
			if (Number.isNaN(s.getTime())) return res.status(400).json({ success: false, message: 'start must be a valid date' });
			filter.timestamp = Object.assign(filter.timestamp || {}, { $gte: s });
		}

		if (end) {
			const e = new Date(end);
			if (Number.isNaN(e.getTime())) return res.status(400).json({ success: false, message: 'end must be a valid date' });
			filter.timestamp = Object.assign(filter.timestamp || {}, { $lte: e });
		}

		const total = await Coin.countDocuments(filter);
		const data = await Coin.find(filter).sort({ timestamp: 1 }).skip(skip).limit(limit).lean();

		return res.json({ success: true, data, meta: { total, page, limit } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

// Shared loader to fetch ordered history for a coin within optional date range
const loadCoinHistory = async (coinId, start, end) => {

	const filter = { coin_id: coinId, deleted: false };
	if (start) {
		const s = new Date(start);
		if (Number.isNaN(s.getTime())) throw new Error('start must be a valid date');
		filter.timestamp = Object.assign(filter.timestamp || {}, { $gte: s });
	}
	if (end) {
		const e = new Date(end);
		if (Number.isNaN(e.getTime())) throw new Error('end must be a valid date');
		filter.timestamp = Object.assign(filter.timestamp || {}, { $lte: e });
	}

	const docs = await Coin.find(filter).sort({ timestamp: 1 }).lean();
	return docs;
};

// GET /coins/performance/:coinId?start=YYYY-MM-DD&end=YYYY-MM-DD
exports.getCoinPerformance = async (req, res) => {
	try {
		const coinId = req.params.coinId;
		if (!coinId) return res.status(400).json({ success: false, message: 'coinId is required' });

		const { start, end } = req.query;
		const history = await loadCoinHistory(coinId, start, end);
		if (!history || history.length === 0) return res.status(404).json({ success: false, message: 'No history found for coin' });

		const first = history[0];
		const last = history[history.length - 1];

		const change = last.price - first.price;
		const pctChange = (change / first.price) * 100;
		const days = Math.max(1, (new Date(last.timestamp) - new Date(first.timestamp)) / (1000 * 60 * 60 * 24));

		return res.json({
			success: true,
			data: {
				coin_id: coinId,
				from: first.timestamp,
				to: last.timestamp,
				startPrice: Number(first.price),
				endPrice: Number(last.price),
				absoluteChange: Number(change),
				percentChange: Number(pctChange),
				days: Number(days)
			}
		});
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

// GET /coins/volatility/:coinId?start=YYYY-MM-DD&end=YYYY-MM-DD
exports.getCoinVolatility = async (req, res) => {
	try {
		const coinId = req.params.coinId;
		if (!coinId) return res.status(400).json({ success: false, message: 'coinId is required' });

		const { start, end } = req.query;
		const history = await loadCoinHistory(coinId, start, end);
		if (!history || history.length < 2) return res.status(404).json({ success: false, message: 'Not enough history for volatility calculation' });

		// compute daily returns (if daily_return exists prefer it, otherwise compute from price)
		const returns = [];
		for (let i = 1; i < history.length; i++) {
			const prev = history[i - 1];
			const cur = history[i];
			let r;
			if (cur.daily_return !== undefined && cur.daily_return !== null) {
				r = Number(cur.daily_return);
			} else if (prev.price !== undefined && cur.price !== undefined && prev.price !== 0) {
				r = (Number(cur.price) - Number(prev.price)) / Number(prev.price);
			} else {
				continue;
			}
			if (!Number.isFinite(r)) continue;
			returns.push(r);
		}

		if (returns.length === 0) return res.status(404).json({ success: false, message: 'No valid returns to compute volatility' });

		const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
		const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
		const stddev = Math.sqrt(variance);

		// annualize assuming daily returns (approx)
		const annualizedVol = stddev * Math.sqrt(365);

		return res.json({
			success: true,
			data: {
				coin_id: coinId,
				points: returns.length,
				stddev: Number(stddev),
				annualizedVolatility: Number(annualizedVol)
			}
		});
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

// GET /coins/returns/:coinId?start=YYYY-MM-DD&end=YYYY-MM-DD&format=percent|decimal
exports.getCoinReturns = async (req, res) => {
	try {
		const coinId = req.params.coinId;
		if (!coinId) return res.status(400).json({ success: false, message: 'coinId is required' });

		const { start, end, format = 'percent' } = req.query;
		const history = await loadCoinHistory(coinId, start, end);
		if (!history || history.length < 2) return res.status(404).json({ success: false, message: 'Not enough history for returns calculation' });

		const results = [];
		for (let i = 1; i < history.length; i++) {
			const prev = history[i - 1];
			const cur = history[i];
			if (prev.price === undefined || cur.price === undefined || prev.price === 0) continue;
			const dec = (Number(cur.price) - Number(prev.price)) / Number(prev.price);
			results.push({ timestamp: cur.timestamp, return_decimal: Number(dec), return_percent: Number(dec * 100) });
		}

		return res.json({ success: true, data: { coin_id: coinId, points: results.length, returns: results.map(r => (format === 'decimal' ? r.return_decimal : r.return_percent)) } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

// Helper: compute rolling and summary metrics for a numeric field over history
const computeMetricsForField = (history, field, windows = [7, 30]) => {
	const values = history.map(d => (d[field] !== undefined && d[field] !== null) ? Number(d[field]) : null).filter(v => Number.isFinite(v));
	if (values.length === 0) return null;

	const sum = values.reduce((a, b) => a + b, 0);
	const avg = sum / values.length;
	const min = Math.min(...values);
	const max = Math.max(...values);

	const latest = values[values.length - 1];
	const prev = values[values.length - 2] !== undefined ? values[values.length - 2] : null;

	const windowStats = {};
	for (const w of windows) {
		const slice = values.slice(Math.max(0, values.length - w));
		if (slice.length === 0) {
			windowStats[`ma${w}`] = null;
			windowStats[`min${w}`] = null;
			windowStats[`max${w}`] = null;
		} else {
			const s = slice.reduce((a, b) => a + b, 0);
			windowStats[`ma${w}`] = s / slice.length;
			windowStats[`min${w}`] = Math.min(...slice);
			windowStats[`max${w}`] = Math.max(...slice);
		}
	}

	// trend: compare latest value to window MA(7) if available
	const ma7 = windowStats.ma7;
	let trend = 'flat';
	if (ma7 !== null && latest > ma7 * 1.001) trend = 'up';
	else if (ma7 !== null && latest < ma7 * 0.999) trend = 'down';

	return {
		points: values.length,
		latest,
		previous: prev,
		average: avg,
		min,
		max,
		trend,
		windows: windowStats
	};
};

// GET /coins/market-cap/:coinId?start=&end=
exports.getMarketCapMetrics = async (req, res) => {
	try {
		const coinId = req.params.coinId;
		if (!coinId) return res.status(400).json({ success: false, message: 'coinId is required' });

		const { start, end } = req.query;
		const history = await loadCoinHistory(coinId, start, end);
		if (!history || history.length === 0) return res.status(404).json({ success: false, message: 'No history found for coin' });

		const metrics = computeMetricsForField(history, 'market_cap');
		if (!metrics) return res.status(404).json({ success: false, message: 'No market_cap data available' });

		return res.json({ success: true, data: { coin_id: coinId, field: 'market_cap', metrics } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

// GET /coins/volume/:coinId?start=&end=
exports.getVolumeMetrics = async (req, res) => {
	try {
		const coinId = req.params.coinId;
		if (!coinId) return res.status(400).json({ success: false, message: 'coinId is required' });

		const { start, end } = req.query;
		const history = await loadCoinHistory(coinId, start, end);
		if (!history || history.length === 0) return res.status(404).json({ success: false, message: 'No history found for coin' });

		const metrics = computeMetricsForField(history, 'volume');
		if (!metrics) return res.status(404).json({ success: false, message: 'No volume data available' });

		return res.json({ success: true, data: { coin_id: coinId, field: 'volume', metrics } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

// GET /coins/price/:coinId?start=&end=
exports.getPriceMetrics = async (req, res) => {
	try {
		const coinId = req.params.coinId;
		if (!coinId) return res.status(400).json({ success: false, message: 'coinId is required' });

		const { start, end } = req.query;
		const history = await loadCoinHistory(coinId, start, end);
		if (!history || history.length === 0) return res.status(404).json({ success: false, message: 'No history found for coin' });

		const metrics = computeMetricsForField(history, 'price');
		if (!metrics) return res.status(404).json({ success: false, message: 'No price data available' });

		return res.json({ success: true, data: { coin_id: coinId, field: 'price', metrics } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getTopMarketCap = async (req, res) => {
	try {
		const { data, meta } = await buildLatestCoinLeaderboard({ market_cap: -1, coin_name: 1, coin_id: 1 }, req);
		return res.json({ success: true, data, meta });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getTopVolume = async (req, res) => {
	try {
		const { data, meta } = await buildLatestCoinLeaderboard({ volume: -1, coin_name: 1, coin_id: 1 }, req);
		return res.json({ success: true, data, meta });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getTopGainers = async (req, res) => {
	try {
		const { data, meta } = await buildLatestCoinLeaderboard({ daily_return: -1, coin_name: 1, coin_id: 1 }, req);
		return res.json({ success: true, data, meta });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getTopLosers = async (req, res) => {
	try {
		const { data, meta } = await buildLatestCoinLeaderboard({ daily_return: 1, coin_name: 1, coin_id: 1 }, req);
		return res.json({ success: true, data, meta });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getTrending = async (req, res) => {
	try {
		const { data, meta } = await buildLatestCoinLeaderboard({ volume: -1, daily_return: -1, market_cap: -1, coin_name: 1, coin_id: 1 }, req);
		return res.json({ success: true, data, meta });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getLatest = async (req, res) => {
	try {
		const { data, meta } = await buildLatestCoinLeaderboard({ timestamp: -1, coin_name: 1, coin_id: 1 }, req);
		return res.json({ success: true, data, meta });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

const buildDatasetWindow = async (req, sortSpec, options = {}) => {
	const { page, limit, skip } = parseWindowPagination(req);
	const pipeline = [{ $match: { deleted: false } }];

	if (options.dedupeByCoin) {
		pipeline.push(
			{ $sort: { coin_id: 1, timestamp: options.oldest ? 1 : -1 } },
			{ $group: { _id: '$coin_id', doc: { $first: '$$ROOT' } } },
			{ $replaceRoot: { newRoot: '$doc' } }
		);
	}

	pipeline.push(
		{ $sort: sortSpec },
		{
			$facet: {
				data: [{ $skip: skip }, { $limit: limit }],
				meta: [{ $count: 'total' }]
			}
		}
	);

	const [result = { data: [], meta: [] }] = await Coin.aggregate(pipeline);
	const total = result.meta[0] ? result.meta[0].total : 0;
	return { data: result.data, meta: { total, page, limit } };
};

exports.getRecent = async (req, res) => {
	try {
		const { data, meta } = await buildDatasetWindow(req, { timestamp: -1, coin_name: 1, coin_id: 1 });
		return res.json({ success: true, data, meta });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getOldest = async (req, res) => {
	try {
		const { data, meta } = await buildDatasetWindow(req, { timestamp: 1, coin_name: 1, coin_id: 1 });
		return res.json({ success: true, data, meta });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getNewest = async (req, res) => {
	try {
		const { data, meta } = await buildDatasetWindow(req, { timestamp: -1, coin_name: 1, coin_id: 1 }, { dedupeByCoin: true });
		return res.json({ success: true, data, meta });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.exists = async (req, res) => {
	const id = req.params.id;
	try {
		const exists = await Coin.exists({ coin_id: id, deleted: false });
		return res.json({ success: true, data: { exists: Boolean(exists) } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.createCoin = async (req, res) => {
	try {
		const payload = buildCoinPayload(req.body, false);
		const coin = await Coin.create(payload);
		return res.status(201).json({ success: true, data: coin });
	} catch (err) {
		const status = err.code === 11000 ? 409 : err.message.endsWith('is required') || err.message.includes('must be') ? 400 : 500;
		return res.status(status).json({ success: false, message: err.message });
	}
};

exports.updateCoin = async (req, res) => {
	const id = req.params.id;
	try {
		const payload = buildCoinPayload(req.body, false);
		const coin = await Coin.findOneAndUpdate({ coin_id: id, deleted: false }, payload, { new: true, runValidators: true }).lean();
		if (!coin) return res.status(404).json({ success: false, message: 'Coin not found' });
		return res.json({ success: true, data: coin });
	} catch (err) {
		const status = err.code === 11000 ? 409 : err.message.endsWith('is required') || err.message.includes('must be') ? 400 : 500;
		return res.status(status).json({ success: false, message: err.message });
	}
};

exports.patchCoin = async (req, res) => {
	const id = req.params.id;
	try {
		const payload = buildCoinPayload(req.body, true);
		if (Object.keys(payload).length === 0) {
			return res.status(400).json({ success: false, message: 'No valid fields provided' });
		}

		const coin = await Coin.findOneAndUpdate(
			{ coin_id: id, deleted: false },
			{ $set: payload },
			{ new: true, runValidators: true }
		).lean();

		if (!coin) return res.status(404).json({ success: false, message: 'Coin not found' });
		return res.json({ success: true, data: coin });
	} catch (err) {
		const status = err.code === 11000 ? 409 : err.message.includes('must be') ? 400 : 500;
		return res.status(status).json({ success: false, message: err.message });
	}
};

// Soft-delete a coin (admin only)
exports.deleteCoin = async (req, res) => {
	const id = req.params.id;
	try {
		if (!req.user || req.user.role !== 'admin') {
			return res.status(403).json({ success: false, message: 'Admin role required' });
		}
		const coin = await Coin.findOneAndUpdate({ coin_id: id, deleted: false }, { $set: { deleted: true } }, { new: true }).lean();
		if (!coin) return res.status(404).json({ success: false, message: 'Coin not found' });
		return res.json({ success: true, data: coin });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

// Bulk create coins. Accepts array in body or { items: [...] }
exports.bulkCreate = async (req, res) => {
	try {
		if (!req.user || req.user.role !== 'admin') {
			return res.status(403).json({ success: false, message: 'Admin role required' });
		}

		const items = Array.isArray(req.body) ? req.body : (Array.isArray(req.body.items) ? req.body.items : null);
		if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'No items provided' });

		if (items.length > 5000) return res.status(400).json({ success: false, message: 'Too many items in one request (limit 5000)' });

		const validDocs = [];
		const errors = [];

		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			try {
				const payload = buildCoinPayload(item, false);
				validDocs.push(payload);
			} catch (err) {
				errors.push({ index: i, message: err.message });
			}
		}

		let inserted = [];
		let writeErrors = [];

		if (validDocs.length > 0) {
			try {
				inserted = await Coin.insertMany(validDocs, { ordered: false });
			} catch (err) {
				// collect write errors (duplicates etc.)
				if (err && err.writeErrors && err.writeErrors.length) {
					writeErrors = err.writeErrors.map(e => ({ index: e.index, errmsg: e.errmsg }));
				} else if (err && err.code === 11000) {
					writeErrors.push({ errmsg: 'Duplicate key error' });
				} else {
					return res.status(500).json({ success: false, message: err.message });
				}
			}
		}

		return res.status(201).json({
			success: true,
			meta: { requested: items.length, validated: validDocs.length, inserted: inserted.length || 0 },
			errors: errors.concat(writeErrors)
		});
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

// Bulk update coins. Accepts array of { coin_id, fields... }
exports.bulkUpdate = async (req, res) => {
	try {
		if (!req.user || req.user.role !== 'admin') {
			return res.status(403).json({ success: false, message: 'Admin role required' });
		}

		const items = Array.isArray(req.body) ? req.body : (Array.isArray(req.body.items) ? req.body.items : null);
		if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'No items provided' });

		if (items.length > 5000) return res.status(400).json({ success: false, message: 'Too many items in one request (limit 5000)' });

		const ops = [];
		const errors = [];

		for (let i = 0; i < items.length; i++) {
			const it = items[i];
			if (!it || !it.coin_id) {
				errors.push({ index: i, message: 'coin_id is required' });
				continue;
			}

			try {
				const payload = buildCoinPayload(it, true);
				if (Object.keys(payload).length === 0) {
					errors.push({ index: i, message: 'No valid fields to update' });
					continue;
				}

				ops.push({
					updateOne: {
						filter: { coin_id: it.coin_id, deleted: false },
						update: { $set: payload },
						upsert: false
					}
				});
			} catch (err) {
				errors.push({ index: i, message: err.message });
			}
		}

		if (ops.length === 0) return res.status(400).json({ success: false, message: 'No valid update operations', errors });

		let result;
		const session = await mongoose.startSession();
		try {
			await session.withTransaction(async () => {
				result = await Coin.bulkWrite(ops, { ordered: false, session });
			});
		} catch (err) {
			// If transactions are not supported or other errors, try without session
			try {
				result = await Coin.bulkWrite(ops, { ordered: false });
			} catch (err2) {
				return res.status(500).json({ success: false, message: err2.message });
			}
		} finally {
			session.endSession();
		}

		return res.json({ success: true, data: { result }, errors });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

// Bulk delete (soft-delete) coins. Accepts array of coin_ids or { ids: [...] }
exports.bulkDelete = async (req, res) => {
	try {
		if (!req.user || req.user.role !== 'admin') {
			return res.status(403).json({ success: false, message: 'Admin role required' });
		}

		const ids = Array.isArray(req.body) ? req.body : (Array.isArray(req.body.ids) ? req.body.ids : null);
		if (!ids || ids.length === 0) return res.status(400).json({ success: false, message: 'No ids provided' });

		if (ids.length > 5000) return res.status(400).json({ success: false, message: 'Too many ids in one request (limit 5000)' });

		const result = await Coin.updateMany({ coin_id: { $in: ids }, deleted: false }, { $set: { deleted: true } });

		// Normalize result fields across mongoose versions
		const matched = result.matchedCount || result.n || 0;
		const modified = result.modifiedCount || result.nModified || 0;

 		return res.json({ success: true, data: { requested: ids.length, matched, modified, notFound: ids.length - matched } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};
