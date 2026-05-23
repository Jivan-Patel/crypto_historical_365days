const Coin = require('../models/coin.model');

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
