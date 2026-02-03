const User = require("../../models/user/user-model");

async function getUserDetailsById(userId) {
    try {
        const user = await User.findById(userId).select("firstname lastname email");
        return user;
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = {
    getUserDetailsById,
};
