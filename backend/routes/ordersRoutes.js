const express = require("express");
const { protect } = require("../middleware/authMiddleware.js");
const { admin } = require("../middleware/adminMiddleware.js");


const { createOrder, myOrders, getOrderById, updateOrderStatus } = require("../controllers/ordersController.js");

const router = express.Router(); 

// Create order - support both "/" and "/createOrder"
router.post("/", protect, createOrder);
router.post("/create", protect, createOrder); 
router.get("/myOrders", protect, myOrders); 
router.get("/all", protect, admin, myOrders); 
router.get("/:id", protect, admin, getOrderById);
router.put("/:id/status", protect, admin, updateOrderStatus);

module.exports = router;
