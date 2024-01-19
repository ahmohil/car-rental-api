const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
	name: {
		type: String,
		required: false,
	},
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	phoneNumber: {
		type: Number,
		required: false,
	},
	address: {
		type: String,
		required: false,
	},
});

module.exports = mongoose.model("User", userSchema);
