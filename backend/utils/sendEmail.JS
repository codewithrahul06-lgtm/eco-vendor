const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, html) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"ShopNest" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            html: html, 
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("Email sent:", info.response);
    } catch (error) {
        console.error("Email error:", error.message);
    }
};

module.exports = sendEmail;