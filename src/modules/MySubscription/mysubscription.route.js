const express = require("express");
const { purchaseSubscription, mySubscription, subsCount, cancelSubscription, deductSubscription, mySearchLimit, checkSubscriptionController } = require("./mysubscription.controller");
const { isValidUser } = require("../../middlewares/auth");
const activityTracker = require("../../helpers/activityTracker");
const router = express.Router();

router.post("/",isValidUser,activityTracker, purchaseSubscription);
router.get("/",isValidUser,activityTracker, mySubscription);
router.get('/count-sub', subsCount);
router.get('/searchlimit',isValidUser, mySearchLimit);
router.get('/deduct', isValidUser, deductSubscription );
router.get('/check-subs', isValidUser, checkSubscriptionController );
router.get("/cancel-subscription/:stripeSubscriptionId", isValidUser,activityTracker, cancelSubscription);

module.exports = router;