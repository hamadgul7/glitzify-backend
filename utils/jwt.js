const jwt = require("jsonwebtoken");

function createToken(userId) {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: "10m" }
    );
}

module.exports = { createToken };
