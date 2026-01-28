const authService = require("../../services/user/auth-services");
const sendEmail = require("../../utils/sendEmail"); // your email util

async function signup(req, res) {
    try {
        const otp = await authService.signupService(req.body);

        await sendEmail({
            to: req.body.email,
            subject: "Your OTP Verification Code",
            text: `Your OTP is ${otp}`,
        });

        res.status(200).json({
            success: true,
            message: "OTP sent to your email",
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}


async function verifyOtp(req, res) {
    try {
        const user = await authService.verifyOtpService(req.body);

        res.status(201).json({
            success: true,
            message: "Signup successful",
            data: user,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}

async function login(req, res) {
    try {
        const result = await authService.loginService(req.body);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token: result.token,
            data: result.user,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
}


module.exports = {
    signup,
    verifyOtp,
    login,
};
