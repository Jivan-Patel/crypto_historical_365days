const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

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

		const verificationToken = crypto.randomBytes(32).toString('hex');
		const user = new User({
			username,
			email,
			password,
			emailVerificationToken: verificationToken
		});
		await user.save();

		const token = signToken(user);
		return res.status(201).json({
			success: true,
			data: {
				user: sanitizeUser(user),
				token,
				emailVerificationToken: verificationToken
			}
		});
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
		const user = await User.findOne({ email, deleted: false });
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
	if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
	try {
		const user = await User.findById(req.user.id);
		if (!user || user.deleted) return res.status(404).json({ success: false, message: 'User not found' });
		return res.json({ success: true, data: sanitizeUser(user) });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.logout = async (req, res) => {
	return res.json({ success: true, message: 'Logged out successfully' });
};

exports.updateProfile = async (req, res) => {
	if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
	const { username, email } = req.body || {};
	try {
		const user = await User.findById(req.user.id);
		if (!user || user.deleted) return res.status(404).json({ success: false, message: 'User not found' });

		if (username) user.username = username;
		if (email) user.email = email;

		await user.save();
		return res.json({ success: true, data: sanitizeUser(user) });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.deleteProfile = async (req, res) => {
	if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
	try {
		const user = await User.findById(req.user.id);
		if (!user || user.deleted) return res.status(404).json({ success: false, message: 'User not found' });

		user.deleted = true;
		await user.save();
		return res.json({ success: true, message: 'User profile deleted successfully' });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.forgotPassword = async (req, res) => {
	const { email } = req.body || {};
	if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

	try {
		const user = await User.findOne({ email, deleted: false });
		if (!user) return res.status(404).json({ success: false, message: 'User not found' });

		const resetToken = crypto.randomBytes(32).toString('hex');
		user.resetPasswordToken = resetToken;
		user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

		await user.save();
		return res.json({ success: true, message: 'Password reset token generated', resetToken });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.resetPassword = async (req, res) => {
	const { token, newPassword } = req.body || {};
	if (!token || !newPassword) {
		return res.status(400).json({ success: false, message: 'Token and newPassword are required' });
	}

	try {
		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpires: { $gt: Date.now() },
			deleted: false
		});
		if (!user) return res.status(400).json({ success: false, message: 'Password reset token is invalid or has expired' });

		user.password = newPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;
		await user.save();

		return res.json({ success: true, message: 'Password reset successful' });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.changePassword = async (req, res) => {
	if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
	const { oldPassword, newPassword } = req.body || {};
	if (!oldPassword || !newPassword) {
		return res.status(400).json({ success: false, message: 'oldPassword and newPassword are required' });
	}

	try {
		const user = await User.findById(req.user.id);
		if (!user || user.deleted) return res.status(404).json({ success: false, message: 'User not found' });

		const isMatch = await user.comparePassword(oldPassword);
		if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect old password' });

		user.password = newPassword;
		await user.save();

		return res.json({ success: true, message: 'Password changed successfully' });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};

exports.verifyEmail = async (req, res) => {
	const { token } = req.body || req.query || {};
	if (!token) return res.status(400).json({ success: false, message: 'Token is required' });

	try {
		const user = await User.findOne({ emailVerificationToken: token, deleted: false });
		if (!user) return res.status(400).json({ success: false, message: 'Verification token is invalid' });

		user.isEmailVerified = true;
		user.emailVerificationToken = undefined;
		await user.save();

		return res.json({ success: true, message: 'Email verified successfully' });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
};
