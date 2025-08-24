const express = require("express");
const { isValidUser } = require("../../middlewares/auth");
const { addFeedbackController, getFeedbackController } = require("./feedback.controller");
const activityTracker = require('../../helpers/activityTracker');
const router = express.Router();

router.post("/", isValidUser,activityTracker, addFeedbackController);
router.get("/", isValidUser, getFeedbackController);

module.exports = router;