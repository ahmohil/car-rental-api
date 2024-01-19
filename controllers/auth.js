const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Otp = require("../models/otp");
const otpMiddleware = require("../middlewares/otp");

exports.signup = async (req, res, next) => {
	const { email, password } = req.body;
	const usr = await User.findOne({ email: email });
	if (usr) {
		return res.status(401).json({ message: "User already exists" });
	}
	const hashedPassword = await bcrypt.hash(password, 10);
	const user = new User({
		email: email,
		password: hashedPassword,
	});
	try {
		const result = await user.save();

		const token = jwt.sign(
			{
				userId: user._id.toString(),
				email: user.email,
			},
			process.env.JWT_SECRET_KEY
		);

		return res.status(200).json({
			message: "Login successful",
			token: token,
			user: {
				email: user.email,
				name: user.name,
				number: user.phoneNumber,
				address: user.address,
			},
		});
	} catch (error) {
		return res.status(500).json(error);
	}
};

exports.login = async (req, res, next) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email: email });
	console.log(user);
	if (!user) {
		return res.status(401).json({ message: "Invalid email or password" });
	}

	const isPasswordValid = await bcrypt.compare(password, user.password);
	if (!isPasswordValid) {
		const error = new Error("Invalid password");
		error.statusCode = 401;
		return res.status(500).json({ message: "Invalid email or password" });
	}

	const token = jwt.sign(
		{
			userId: user._id.toString(),
			email: user.email,
		},
		process.env.JWT_SECRET_KEY
	);

	return res.status(200).json({
		message: "Login successful",
		token: token,
		user: {
			email: user.email,
			name: user.name,
			number: user.phoneNumber,
			address: user.address,
		},
	});
};

exports.forgotPassword = async (req, res, next) => {
	const email = req.body.email;

	const user = await User.findOne({ email: email });
	if (!user) {
		return res.status(401).json({ message: "No such user exists" });
	}

	await otpMiddleware.sendOTP(req, res, next);
	return res.status(200).json({ isValid: true, message: "Enter the otp received on your email" });
};

exports.resendOtp = async (req, res, next) => {
	const email = req.body.email;
	const user = User.findOne({ email: email });
	req.mailText = `Hi ${user.name},\n\nYour new otp is\n\n`;
	const otp = await Otp.findOne({ email: email });

	if (!otp) {
		await otpMiddleware.sendOTP(req, res, next);
	} else {
		await otp.deleteOne();
		await otpMiddleware.sendOTP(req, res, next);
	}

	return res.status(200).json({
		message: "OTP resent successfully!",
	});
};

exports.changePassword = async (req, res, next) => {
	if (!req.body.token) {
		return res.status(401).json({ message: "Invalid token" });
	}
	const user = jwt.verify(req.body.token, process.env.JWT_SECRET_KEY);
	const newPassword = req.body.password;
	const usr = await User.findOne({ email: user.email });
	usr.password = await bcrypt.hash(newPassword, 10);
	await usr.save();
	return res.status(200).json({ message: "Password Changed. You can now login with the new password" });
};

exports.verifyOtp = async (req, res, next) => {
	const type = req.query.type;
	console.log(req.params);

	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return res.status(401).json({ message: "User does not exist" });
	}

	const token = jwt.sign(
		{
			userId: user._id.toString(),
			email: user.email,
		},
		process.env.JWT_SECRET_KEY
	);
	res.status(200).json({
		message: "Otp has been verified enter new Password",
		token: token,
	});
};

exports.updateDetails = async (req, res, next) => {
	if (!req.body.token) {
		return res.status(401).json({ message: "Invalid token" });
	}
	const usr = jwt.verify(req.body.token, process.env.JWT_SECRET_KEY);
	const user = await User.findOne({ email: usr.email });
	user.name = req.body.name || "";
	user.phoneNumber = req.body.number || "";
	user.address = req.body.address || "";
	await user.save();
	return res.status(200).json({ message: "Details updated successfully", user: user });
};
