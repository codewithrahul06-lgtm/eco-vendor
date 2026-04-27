const crypto = require("crypto");
const Razorpay = require("razorpay");

const getRazorpayCredentials = () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        return null;
    }

    return { keyId, keySecret };
};

const getRazorpayInstance = () => {
    const credentials = getRazorpayCredentials();

    if (!credentials) {
        return null;
    }

    return new Razorpay({
        key_id: credentials.keyId,
        key_secret: credentials.keySecret,
    });
};

const createOrder = async (req, res) => {
    try {
        const credentials = getRazorpayCredentials();

        if (!credentials) {
            return res.status(500).json({
                message: "Razorpay credentials are not configured",
            });
        }

        const rawAmount = req.body.amount ?? req.body.totalAmount;
        const amount = Number(rawAmount);
        const currency = req.body.currency || "INR";

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                message: "A valid payment amount is required",
            });
        }

        const razorpay = getRazorpayInstance();
        const receipt = req.body.receipt || `receipt_${Date.now()}`;
        const amountInSmallestUnit = Math.round(amount * 100);
        const notes = {
            ...(req.body.notes || {}),
        };

        if (req.user?._id) {
            notes.userId = req.user._id.toString();
        }

        const order = await razorpay.orders.create({
            amount: amountInSmallestUnit,
            currency,
            receipt,
            notes,
        });

        return res.status(201).json({
            message: "Payment order created successfully",
            key: credentials.keyId,
            order,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to create payment order",
            error: error.message,
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const credentials = getRazorpayCredentials();

        if (!credentials) {
            return res.status(500).json({
                message: "Razorpay credentials are not configured",
            });
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                message: "Payment verification fields are required",
            });
        }

        const generatedSignature = crypto
            .createHmac("sha256", credentials.keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        const isValidSignature =
            generatedSignature.length === razorpay_signature.length &&
            crypto.timingSafeEqual(
                Buffer.from(generatedSignature),
                Buffer.from(razorpay_signature)
            );

        if (!isValidSignature) {
            return res.status(400).json({
                message: "Invalid payment signature",
                verified: false,
            });
        }

        return res.status(200).json({
            message: "Payment verified successfully",
            verified: true,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to verify payment",
            error: error.message,
        });
    }
};

module.exports = {
    createOrder,
    verifyPayment,
};
