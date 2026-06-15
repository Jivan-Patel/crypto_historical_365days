exports.getLoggerTest = (req, res) => {
	return res.json({ success: true, message: 'Request logger middleware verification successful' });
};

exports.getAuthTest = (req, res) => {
	return res.json({ success: true, message: 'Authentication verification successful', user: req.user });
};

exports.getRateLimitTest = (req, res) => {
	return res.json({
		success: true,
		message: 'Rate limit verification successful',
		rateLimit: {
			limit: 100,
			remaining: 99,
			resetTimeSeconds: 60
		}
	});
};

exports.getErrorHandlerTest = (req, res, next) => {
	const err = new Error('Intentional test error for global error handler middleware verification');
	err.status = 400; // Or whatever status
	return next(err);
};
