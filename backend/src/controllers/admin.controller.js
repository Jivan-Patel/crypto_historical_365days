const Coin = require('../models/coin.model');
const User = require('../models/user.model');

exports.getAdminCoins = async (req, res) => {
	try {
		if (!req.user || req.user.role !== 'admin') {
			return res.status(403).json({ success: false, message: 'Admin role is required' });
		}
		const data = await Coin.find({}).lean();
		return res.json({ success: true, count: data.length, data });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getAdminStats = async (req, res) => {
	try {
		if (!req.user || req.user.role !== 'admin') {
			return res.status(403).json({ success: false, message: 'Admin role is required' });
		}
		const userCount = await User.countDocuments({});
		const coinCount = await Coin.countDocuments({ deleted: false });
		const deletedCoinCount = await Coin.countDocuments({ deleted: true });

		return res.json({
			success: true,
			data: {
				users: userCount,
				activeCoins: coinCount,
				deletedCoins: deletedCoinCount,
				systemStatus: 'healthy',
				memoryUsage: process.memoryUsage()
			}
		});
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.getAdminUsers = async (req, res) => {
	try {
		if (!req.user || req.user.role !== 'admin') {
			return res.status(403).json({ success: false, message: 'Admin role is required' });
		}
		const users = await User.find({}).lean();
		return res.json({ success: true, data: users });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};
