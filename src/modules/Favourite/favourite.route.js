const express = require("express");
const { isValidUser } = require("../../middlewares/auth");
const { addFavourite, myFavourite, unFavourite, updateDataController } = require("./favourite.controller");
const activityTracker = require("../../helpers/activityTracker");
const router = express.Router();

router.post("/favourite", isValidUser, addFavourite);
router.post("/update-data", isValidUser, updateDataController)
router.get("/", isValidUser,activityTracker, myFavourite);
router.get("/unfavourite/:zpId/:bedrooms/:bathrooms", isValidUser, unFavourite);
router.delete("/unfavourite/:zpId/:bedrooms/:bathrooms", isValidUser, unFavourite);

module.exports = router;