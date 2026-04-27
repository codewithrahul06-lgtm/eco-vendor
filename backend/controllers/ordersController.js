const Order = require('../model/order.js');
const sendEmail = require("../utils/sendEmail");

const createOrder = async (req, res) => {
    try {
        const { items, totalAmount, address, paymentId } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "No order items" });
        }

        const newOrder = new Order({
            user: req.user._id,
            items,
            totalAmount,
            address,
            paymentId
        });

        const createdOrder = await newOrder.save();

        const htmlTemplate = `
        <div style="font-family: Arial; padding:20px;">
            <h2>Order Confirmation</h2>
            <p>Thank you for your order!</p>

            <h3>Order Details:</h3>
            <ul>
                ${items.map(item => `
                    <li>
                        Product ID: ${item.productId} <br/>
                        Quantity: ${item.qty} <br/>
                        Price: Rs. ${item.price}
                    </li>
                `).join("")}
            </ul>

            <h3>Total: Rs. ${totalAmount}</h3>

            <p>
                ${address.fullname}, ${address.street}, 
                ${address.city}, ${address.postalCode}, ${address.country}
            </p>
        </div>
        `;

        await sendEmail(
    req.body.email || req.user.email,
    "Order Confirmation - ShopNest",
    htmlTemplate
);

        res.status(201).json({
            message: "Order created & email sent",
            order: createdOrder
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to create order",
            error: error.message
        });
    }
};
const myOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.productId', 'name price');

        res.status(200).json(orders);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching orders",
            error: error.message
        });
    }
};
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email')
            .populate('items.productId', 'name price');

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(order);

    } catch (error) {
        res.status(500).json({
            message: "Error fetching order",
            error: error.message
        });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order Not Found" });
        }

        order.status = status;
        await order.save();

        res.json({
            message: "Order status updated",
            order
        });

    } catch (error) {
        res.status(500).json({
            message: "Error updating order status",
            error: error.message
        });
    }
};
module.exports = {
    createOrder,
    myOrders,
    getOrderById,
    updateOrderStatus
};