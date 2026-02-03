const express = require("express");
const router = express.Router();
const userDetailsController = require("../../controllers/user/profileDetail-controllers");

router.get("/profileDetails/:id", userDetailsController.getUserDetails);

module.exports = router;
