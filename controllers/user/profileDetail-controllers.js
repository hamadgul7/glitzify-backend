const userDetailsService = require("../../services/user/profileDetail-services");

async function getUserDetails(req, res) {
    try {
        const userId = req.params.id;

        const user = await userDetailsService.getUserDetailsById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUserDetails,
};
