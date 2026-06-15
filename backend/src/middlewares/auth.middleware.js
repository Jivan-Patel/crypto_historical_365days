const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({
			success: false,
			message: 'Authorization token is required'
		});
	}

	const token = authHeader.split(' ')[1];

	const blacklist = require('../config/blacklist');
	if (blacklist.has(token)) {
		return res.status(401).json({
			success: false,
			message: 'Token has been revoked'
		});
	}

	if (!process.env.JWT_SECRET) {
		return res.status(500).json({
			success: false,
			message: 'JWT secret is not configured'
		});
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		req.user = {
			id: decoded.id,
			email: decoded.email,
			role: decoded.role
		};

		return next();
	} catch (error) {
		if (error.name === 'TokenExpiredError') {
			return res.status(401).json({
				success: false,
				message: 'Token has expired'
			});
		}

		return res.status(401).json({
			success: false,
			message: 'Invalid authentication token'
		});
	}
};

module.exports = authMiddleware;
