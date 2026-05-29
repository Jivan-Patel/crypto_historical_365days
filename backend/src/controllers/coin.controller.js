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
