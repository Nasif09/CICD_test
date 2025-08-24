const express = require("express");
const { paymentController, paymentCompleteController, allTransactions, transactionDetails, totalEarning, earningRatio, upgradeOrDowngradeSubscription } = require("./transaction.controller");
const { isValidUser } = require("../../middlewares/auth");
const activityTracker = require("../../helpers/activityTracker");
const router = express.Router();

router.post('/payment',isValidUser,activityTracker, paymentController)
router.post('/update', isValidUser, upgradeOrDowngradeSubscription)
router.get('/complete', paymentCompleteController)
router.get('/cancel', async (req, res) => {
    res.send('Payment Error')
});
router.get('/alltransactions',allTransactions );
router.get('/totalearning', totalEarning);
router.get('/earning-ratio',isValidUser, earningRatio);
router.get('/transactionDetails/:id', transactionDetails );


module.exports = router