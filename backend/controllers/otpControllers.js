const sendEmail = require("../utils/sendEmail");

// temporary storage (use DB in production)
const otpStore = new Map();

// Generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP
const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const otp = generateOTP();

        otpStore.set(email, {
            otp,
            expires: Date.now() + 5 * 60 * 1000, // 5 min
        });

        const htmlTemplate = `
        <div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
            <div style="max-width:500px; margin:auto; background:white; padding:30px; border-radius:10px; text-align:center;">
                
                <h2 style="color:#333;">OTP Verification</h2>
                
                <p style="color:#555; font-size:16px;">
                    Use the OTP below to complete your verification process:
                </p>

                <div style="font-size:30px; font-weight:bold; letter-spacing:5px; margin:20px 0; color:#2c7be5;">
                    ${otp}
                </div>

                <p style="color:#888; font-size:14px;">
                    This OTP is valid for 5 minutes.
                </p>

                <hr style="margin:20px 0;" />

                <p style="font-size:12px; color:#aaa;">
                    If you didn’t request this, you can ignore this email.
                </p>

            </div>
        </div>
        `;

        await sendEmail(
            email,
            "Your OTP Code",
            htmlTemplate  
        );

        res.status(200).json({ message: "OTP sent successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to send OTP" });
    }
};

// Verify OTP
const verifyOtp = (req, res) => {
    try {
        const { email, otp } = req.body;

        const record = otpStore.get(email);

        if (!record) {
            return res.status(400).json({ message: "OTP not found" });
        }

        if (Date.now() > record.expires) {
            otpStore.delete(email);
            return res.status(400).json({ message: "OTP expired" });
        }

        if (record.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        otpStore.delete(email);

        return res.status(200).json({ message: "OTP verified successfully" });

    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = { sendOtp, verifyOtp };