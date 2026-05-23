const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const signToken = (user) => {
	if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET not configured');
	return jwt.sign(
		{ id: user._id.toString(), email: user.email, role: user.role },
		process.env.JWT_SECRET,
		{ expiresIn: '7d' }
	);
};

const sanitizeUser = (user) => {
	if (!user) return null;
	const u = user.toJSON ? user.toJSON() : user;
	delete u.password;
	return u;
};

exports.register = async (req, res) => {
	const { username, email, password } = req.body || {};
	if (!username || !email || !password) {
		return res.status(400).json({ success: false, message: 'username, email and password are required' });
	}

	try {
		const existing = await User.findOne({ $or: [{ email }, { username }] });
		if (existing) return res.status(409).json({ success: false, message: 'User already exists' });

		const user = new User({ username, email, password });
		await user.save();

		const token = signToken(user);
		return res.status(201).json({ success: true, data: { user: sanitizeUser(user), token } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.login = async (req, res) => {
	const { email, password } = req.body || {};
	if (!email || !password) {
		return res.status(400).json({ success: false, message: 'email and password are required' });
	}

	try {
		const user = await User.findOne({ email });
		if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

		const match = await user.comparePassword(password);
		if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

		const token = signToken(user);
		return res.json({ success: true, data: { user: sanitizeUser(user), token } });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.profile = async (req, res) => {
	// `auth.middleware` attaches `req.user` from the token
	if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
	return res.json({ success: true, data: req.user });
};
