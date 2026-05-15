const mongoose = require('mongoose');

const coinSchema = new mongoose.Schema({
	coin_id: { type: String, required: true, index: true },
	coin_name: { type: String, required: true, index: true },
	symbol: { type: String, required: true, index: true },
	market_cap_rank: { type: Number, index: true },
	timestamp: { type: Date, required: true, index: true },
	date: { type: String, required: true, index: true }, // YYYY-MM-DD
	price: { type: Number, default: null },
	market_cap: { type: Number, default: null },
	volume: { type: Number, default: null },
	daily_return: { type: Number, default: null },
	price_ma7: { type: Number, default: null },
	price_ma30: { type: Number, default: null },
	volatility_7d: { type: Number, default: null },
	cumulative_return: { type: Number, default: null },
	month: { type: String, index: true }, // YYYY-MM
	deleted: { type: Boolean, default: false }
}, {
	timestamps: true,
	toJSON: {
		transform(doc, ret) {
			delete ret.__v;
			return ret;
		}
	}
});

// Prevent duplicate records for same coin/date (allows multiple coins over time)
coinSchema.index({ coin_id: 1, date: 1 }, { unique: true, partialFilterExpression: { deleted: { $eq: false } } });

// Additional indexes to improve query performance
coinSchema.index({ symbol: 1, date: -1 });
coinSchema.index({ date: -1 });
coinSchema.index({ market_cap_rank: 1 });

module.exports = mongoose.model('Coin', coinSchema);
