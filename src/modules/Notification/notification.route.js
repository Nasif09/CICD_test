const express = require("express");
const { addNotification, getNotification, readNotification } = require("./notification.controller");
const { isValidUser } = require("../../middlewares/auth");
const router = express.Router();

router.post("/", isValidUser, addNotification);
router.get("/", isValidUser, getNotification);
router.put("/read/:id", isValidUser, readNotification);

module.exports = router;