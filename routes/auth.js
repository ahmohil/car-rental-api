require("dotenv").config();
const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth");
const otpMiddleware = require("../middlewares/otp");

router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
router.post("/verify-otp", otpMiddleware.verifyOtp, AuthController.verifyOtp);
router.post("/resend-otp", AuthController.resendOtp);
router.post("/change-password", AuthController.changePassword);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/update-details", AuthController.updateDetails);

module.exports = router;
