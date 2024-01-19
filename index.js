const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const cors = require("cors");

const MONGODB_URI = "mongodb://localhost:27017/CarRental";

const app = express();

app.use(cors());
app.use(express.json());

app.use(authRoutes);

mongoose
	.connect(MONGODB_URI)
	.then(() => {
		app.listen(3000);
	})
	.catch((err) => {
		console.log(err);
	});
