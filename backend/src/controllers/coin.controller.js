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

exports.getAllCoins = async (req, res) => {
	try {
		const page = Math.max(1, parseInt(req.query.page, 10) || 1);
		const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
		const skip = (page - 1) * limit;

		const filter = { deleted: false };
		const { search, symbol, month } = req.query;
		if (symbol) filter.symbol = symbol;
		if (month) filter.month = month;
		if (search) {
			const re = new RegExp(search, 'i');
			filter.$or = [ { coin_name: re }, { coin_id: re }, { symbol: re } ];
		}

		const total = await Coin.countDocuments(filter);
		const data = await Coin.find(filter).sort({ date: -1 }).skip(skip).limit(limit).lean();

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
