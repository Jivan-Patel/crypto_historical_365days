const Coin = require('../models/coin.model');

const getPagination = (query, defaultLimit = 20, maxLimit = 100) => {
	const page = Math.max(1, parseInt(query.page, 10) || 1);
	const limit = Math.min(maxLimit, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
	const skip = (page - 1) * limit;
	return { page, limit, skip };
};

exports.searchCoins = async (req, res) => {
	try {
		const { q = '' } = req.query;
		const queryStr = String(q).trim().toLowerCase();
		const { page, limit, skip } = getPagination(req.query);

		const filter = { deleted: false };

		if (queryStr) {
			// Check for special keyword lookups
			if (queryStr === 'bullish') {
				filter.$expr = {
					$and: [
						{ $gt: ['$price', '$price_ma7'] },
						{ $gt: ['$daily_return', 0] }
					]
				};
			} else if (queryStr === 'bearish') {
				filter.$expr = {
					$and: [
						{ $lt: ['$price', '$price_ma7'] },
						{ $lt: ['$daily_return', 0] }
					]
				};
			} else if (queryStr === 'profitable') {
				filter.daily_return = { $gt: 0 };
			} else if (queryStr === 'loss-making' || queryStr === 'bear') {
				filter.daily_return = { $lt: 0 };
			} else if (queryStr === 'high-price') {
				filter.price = { $gte: 1000 };
			} else if (queryStr === 'low-price') {
				filter.price = { $lt: 10 };
			} else if (/^\d{4}-\d{2}-\d{2}$/.test(queryStr)) {
				// Date lookup YYYY-MM-DD
				filter.date = queryStr;
			} else if (/^\d{4}-\d{2}$/.test(queryStr)) {
				// Month lookup YYYY-MM
				filter.month = queryStr;
			} else {
				// Search by name, symbol, or coin_id
				filter.$or = [
					{ coin_name: new RegExp(escapeRegExp(queryStr), 'i') },
					{ coin_id: new RegExp(escapeRegExp(queryStr), 'i') },
					{ symbol: queryStr.toUpperCase() }
				];
			}
		}

		const total = await Coin.countDocuments(filter);
		const data = await Coin.find(filter).sort({ date: -1, coin_id: 1 }).skip(skip).limit(limit).lean();

		return res.json({ success: true, data, meta: { total, page, limit } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

const escapeRegExp = (string) => {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
