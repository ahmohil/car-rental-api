const Otp = require("../models/otp");
const nodemailer = require("nodemailer");

exports.sendOTP = async (req, res, next) => {
	const email = req.body.email;

	const otp = Math.floor(1000 + Math.random() * 9000);

	await Otp.findOneAndDelete({ email: email });

	const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: process.env.EMAIL,
			pass: process.env.PASSWORD,
		},
	});

	const mailText = `${req.mailText} Your OTP is ${otp}\n\n`;

	const mailOptions = {
		from: process.env.EMAIL,
		to: email,
		subject: "Email verification",
		text: mailText,
	};

	transporter.sendMail(mailOptions, async (error, info) => {
		if (error) {
			return res.status(500).json({ message: "Error sending email" });
		}

		const otpObj = new Otp({
			email: email,
			otp: otp,
		});

		try {
			const result = await otpObj.save();
		} catch (error) {
			return res.status(500).json(error);
		}
	});

	next();
};

exports.verifyOtp = async (req, res, next) => {
	const { otp, email } = req.body;

	const otpObj = await Otp.findOne({ email: email, otp: otp });

	if (!otpObj) {
		return res.status(401).json({ message: "Invalid OTP" });
	}

	next();
};
