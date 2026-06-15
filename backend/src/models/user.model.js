const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true, index: true },
	email: { type: String, required: true, unique: true, lowercase: true, index: true },
	password: { type: String, required: true },
	role: { type: String, enum: ['user', 'admin'], default: 'user' },
	deleted: { type: Boolean, default: false },
	isEmailVerified: { type: Boolean, default: false },
	emailVerificationToken: { type: String },
	resetPasswordToken: { type: String },
	resetPasswordExpires: { type: Date }
}, {
	timestamps: true,
	toJSON: {
		transform(doc, ret) {
			delete ret.password;
			delete ret.__v;
			return ret;
		}
	}
});

userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	try {
		const hash = await bcrypt.hash(this.password, SALT_ROUNDS);
		this.password = hash;
		return next();
	} catch (err) {
		return next(err);
	}
});

userSchema.methods.comparePassword = async function (candidate) {
	return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
