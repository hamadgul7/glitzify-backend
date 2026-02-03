const User = require("../../models/user/user-model");
const Otp = require("../../models/user/otp-model");
const bcrypt = require("bcryptjs");
const { createToken } = require("../../utils/jwt");


function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}


async function signupService(data) {
    const { firstname, lastname, email, password } = data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOtp();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.findOneAndUpdate(
        { email },
        {
            firstname,
            lastname,
            email,
            password: hashedPassword,
            otp,
            expiresAt,
        },
        { upsert: true, new: true }
    );

    return otp;
}


async function verifyOtpService({ email, otp }) {
    const otpDoc = await Otp.findOne({ email });

    if (!otpDoc) {
        throw new Error("OTP expired or invalid");
    }

    if (otpDoc.otp !== otp) {
        throw new Error("Invalid OTP");
    }

    if (otpDoc.expiresAt < new Date()) {
        throw new Error("OTP expired");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error("User already verified");
    }

    const user = await User.create({
        firstname: otpDoc.firstname,
        lastname: otpDoc.lastname,
        email: otpDoc.email,
        password: otpDoc.password,
    });

    await Otp.deleteOne({ email });


    return {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        wishlist: user.wishlist,
        createdAt: user.createdAt,
    };
}

async function loginService({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Invalid email or password");
    }

    const token = createToken(user._id);

    return {
        token,
        user: {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        },
    };
}

module.exports = {
    signupService,
    verifyOtpService,
    loginService,
};
