const express = require("express");
const router = express.Router();

const { sendOtp, verifyOtp } = require("../controllers/otpControllers");

// Send OTP
router.post("/send", sendOtp);

// Verify OTP
router.post("/verify", verifyOtp);

module.exports = router;
