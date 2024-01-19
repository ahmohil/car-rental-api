const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const cors = require("cors");

// const MONGODB_URI = "mongodb+srv://ahmohil:<password>@first.ju1xh4b.mongodb.net/?retryWrites=true&w=majority";

const app = express();

app.use(cors());
app.use(express.json());

app.use(authRoutes);

mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => {
		app.listen(3000);
	})
	.catch((err) => {
		console.log(err);
	});
