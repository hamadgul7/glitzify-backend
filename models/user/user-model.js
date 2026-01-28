const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        firstname: {
            type: String,
            required: true,
        },

        lastname: {
            type: String,
            required: true,
        },

        email: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ["Admin", "Customer"],
            default: "Customer"
        },

        password: {
            type: String,
            required: true,
        },
    },
    {timestamps: true}
);

module.exports = mongoose.model("User", userSchema);
