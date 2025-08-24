const express = require("express");
const {isValidUser } = require('../../middlewares/auth');
const router = express.Router();
const {propertyController, addPropertyController, allPropertyController} = require("./property.controller");
const activityTracker = require("../../helpers/activityTracker");


router.get("/all", isValidUser, allPropertyController);
router.post("/add-property", isValidUser, addPropertyController);
router.get("/search/:zpId", isValidUser,activityTracker, propertyController);



module.exports = router;
