const Order = require("../model/order");
const User = require("../model/user");
const Product = require("../model/products");

const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalOrders = await Order.countDocuments({});
        const totalProducts = await Product.countDocuments({});

        const orders = await Order.find({});

        const totalRevenueData = orders.reduce(
            (acc, order) => acc + (order.totalAmount || 0),
            0
        );

        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalOrders,
                totalProducts,
                totalRevenue: totalRevenueData
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch admin stats"
        });
    }
};

module.exports = { getAdminStats };