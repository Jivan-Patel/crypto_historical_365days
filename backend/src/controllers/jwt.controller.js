const jwt = require('jsonwebtoken');

exports.jwtProfile = async (req, res) => {
	if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
	return res.json({ success: true, data: req.user });
};

exports.jwtDashboard = async (req, res) => {
	if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
	return res.json({
		success: true,
		data: {
			message: 'Welcome to the secure user dashboard',
			userId: req.user.id,
			email: req.user.email,
			role: req.user.role
		}
	});
};

exports.jwtGenerateToken = async (req, res) => {
	const { payload, expiresIn } = req.body || {};
	if (!payload) return res.status(400).json({ success: false, message: 'Payload is required' });

	try {
		if (!process.env.JWT_SECRET) {
			return res.status(500).json({ success: false, message: 'JWT_SECRET is not configured' });
		}
		const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expiresIn || '7d' });
		return res.json({ success: true, token });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.jwtVerifyToken = async (req, res) => {
	const { token } = req.body || {};
	if (!token) return res.status(400).json({ success: false, message: 'Token is required' });

	try {
		if (!process.env.JWT_SECRET) {
			return res.status(500).json({ success: false, message: 'JWT_SECRET is not configured' });
		}
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		return res.json({ success: true, decoded });
	} catch (err) {
		return res.status(400).json({ success: false, message: err.message });
	}
};

exports.jwtAdmin = async (req, res) => {
	if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
	if (req.user.role !== 'admin') {
		return res.status(403).json({ success: false, message: 'Admin role is required' });
	}
	return res.json({ success: true, message: 'Welcome to the secure Admin page' });
};

exports.jwtPrivateStats = async (req, res) => {
	if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
	return res.json({
		success: true,
		privateStats: {
			activeUsers: 42,
			apiCallsToday: 1337,
			cacheStatus: 'healthy',
			systemLoad: '0.15'
		}
	});
};

exports.jwtRefreshToken = async (req, res) => {
	const { token } = req.body || {};
	const authHeader = req.headers.authorization;
	const tokenToRefresh = token || (authHeader && authHeader.split(' ')[1]);

	if (!tokenToRefresh) {
		return res.status(400).json({ success: false, message: 'Token is required' });
	}

	try {
		if (!process.env.JWT_SECRET) {
			return res.status(500).json({ success: false, message: 'JWT_SECRET is not configured' });
		}
		const decoded = jwt.verify(tokenToRefresh, process.env.JWT_SECRET, { ignoreExpiration: true });
		const newPayload = { id: decoded.id, email: decoded.email, role: decoded.role };

		// Clean undefined values
		Object.keys(newPayload).forEach(key => newPayload[key] === undefined && delete newPayload[key]);

		const newToken = jwt.sign(newPayload, process.env.JWT_SECRET, { expiresIn: '7d' });
		return res.json({ success: true, token: newToken });
	} catch (err) {
		return res.status(400).json({ success: false, message: err.message });
	}
};

exports.jwtRevokeToken = async (req, res) => {
	const { token } = req.body || {};
	const authHeader = req.headers.authorization;
	const tokenToRevoke = token || (authHeader && authHeader.split(' ')[1]);

	if (!tokenToRevoke) {
		return res.status(400).json({ success: false, message: 'Token is required' });
	}

	const blacklist = require('../config/blacklist');
	blacklist.add(tokenToRevoke);

	return res.json({ success: true, message: 'Token revoked successfully' });
};
