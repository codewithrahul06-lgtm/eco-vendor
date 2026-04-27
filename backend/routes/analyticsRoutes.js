const express = require("express");
const { protect } = require("../middleware/authMiddleware.js");
const { admin } = require("../middleware/adminMiddleware.js");
const {
    getAdminStats,
} = require("../controllers/analyticsController.js");

const router = express.Router();

router.get("/", protect, getAdminStats);

module.exports = router;
