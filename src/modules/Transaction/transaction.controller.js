const catchAsync = require("../../helpers/catchAsync");
const response = require("../../helpers/response");
const { status } = require("http-status");
const { addTransactionService, getTransactionByTransactionId, getAllTransactions, getTransactionByIdWithPopulate, getMonthlyEarningRatio, getTotalEarning } = require("./transaction.service");
const { addMySubscription, getMySubscriptionById, getMySubscriptionByFilter } = require("../MySubscription/mysubscription.service");
const { getUserById, getUserByfilter } = require("../User/user.service");
const { default: mongoose } = require("mongoose");
const ApiError = require("../../helpers/ApiError");
const transactionModel = require("./transaction.model");
const { addReferalManagement } = require("../ReferalManagement/referalManagement.service");
const { subscriptionByID } = require("../Subscription/subscription.service");
const refStatusModel = require("../ReferalStatusManagement/refStatus.model");
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);



const paymentController = catchAsync(async (req, res) => {
    let { subscription, amount, planSearchLimit, planDuration, referalCode } = req.body;
    const subscriptionData = await subscriptionByID(subscription);
    const user = req.User._id;

    const priceId = planDuration === 30
        ? subscriptionData.stripeMonthlyPriceId
        : subscriptionData.stripeYearlyPriceId;

    if (!priceId) {
        throw new ApiError(status.BAD_REQUEST, 'Stripe price ID not found for this plan');
    }

    const session = await stripe.checkout.sessions.create({
        success_url: `http://${process.env.API_SERVER_IP}:${process.env.BACKEND_PORT}/api/v1/transaction/complete?session_id={{CHECKOUT_SESSION_ID}}&subscription=${subscription}&user=${user}&referalCode=${referalCode}&planDuration=${planDuration}&planSearchLimit=${planSearchLimit}&amount=${amount}`,
        cancel_url: `http://${process.env.API_SERVER_IP}:${process.env.BACKEND_PORT}/api/v1/transaction/cancel`,
        // allow_promotion_codes: true,
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        mode: 'subscription',
        customer_email: req.User.email,
    });

    return res.status(status.OK).json(response({ status: 'Success', statusCode: status.OK, type: 'transaction', message: 'payment-created', data: { url: session.url } }));
});


const paymentCompleteController = catchAsync(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { session_id, subscription, user, referalCode } = req.query;
    const amount = Number(req.query.amount);
    const planSearchLimit = Number(req.query.planSearchLimit);
    const planDuration = Number(req.query.planDuration);

    const strWithoutBraces = session_id.replace(/[{}]/g, '');

    // 1. Retrieve Stripe session details
    const retrive = await stripe.checkout.sessions.retrieve(strWithoutBraces);
    const stripeSubscriptionId = retrive.subscription;

    // 2. Retrieve subscription & payment intent details
    const subscriptionObj = await stripe.subscriptions.retrieve(stripeSubscriptionId, {
      expand: ['latest_invoice.payment_intent'],
    });

    const paymentIntent = subscriptionObj.latest_invoice?.payment_intent;

    if (!paymentIntent) {
      throw new ApiError(status.BAD_REQUEST, 'Payment intent not found in subscription invoice');
    }

    const transactionId = paymentIntent.id;
    const paymentMethod = paymentIntent.payment_method_types[0];

    // 3. Prevent duplicate transaction
    const checktransaction = await getTransactionByTransactionId(transactionId);
    if (checktransaction) {
      throw new ApiError(status.BAD_REQUEST, 'Transaction already exists');
    }

    // 4. Add MySubscription
    const mySubscription = await addMySubscription(
      {
        subscription,
        user,
        planDuration,
        planSearchLimit,
        stripeSubscriptionId,
      },
      { session }
    );

    const subscriptionData = await subscriptionByID(subscription);
    subscriptionData.sell = subscriptionData.sell + 1;
    await subscriptionData.save({ session });

    // 5. Update user subscription
    const userdata = await getUserById(user);
    userdata.subscription = mySubscription._id;
    userdata.stripeSubscriptionId = stripeSubscriptionId;
    await userdata.save({ session });

    // 6. Save transaction
    const transactionData = {
      user,
      amount,
      subscription,
      transactionId,
      paymentMethod,
    };
    await addTransactionService(transactionData, { session });

    // 7. Referral system logic
    if (referalCode && referalCode !== 'undefined') {
      const refStatus = await refStatusModel.findOne(); // referral system settings
      if (refStatus.referralSystemEnabled === false)
        throw new ApiError(status.BAD_REQUEST, 'Referral system is disabled');

      const referedUser = await getUserByfilter({ yourRefaralCode: referalCode });
      if (!referedUser) {
        throw new ApiError(status.BAD_REQUEST, 'Invalid referral code');
      }

      // Add referral tracking
      await addReferalManagement({ referalCode, user }, { session });

      // Reward the referrer
      const referedUserSubscription = await getMySubscriptionByFilter({
        user: referedUser._id,
        subscription: subscription,
        expiryDate: { $gt: new Date() },
      });

      const refUser = await getUserById(referedUser._id);

      if (!referedUserSubscription) {
        throw new ApiError(status.BAD_REQUEST, 'Referrer has no active subscription');
      }

      if (referedUserSubscription.planName === 'Free') {
        throw new ApiError(
          status.BAD_REQUEST,
          'Referrer has free subscription, cannot reward'
        );
      }

      referedUserSubscription.searchLimit += planSearchLimit;
      referedUserSubscription.expiryDate = new Date(
        referedUserSubscription.expiryDate.getTime() +
          planDuration * 24 * 60 * 60 * 1000
      );
      await referedUserSubscription.save({ session });
    }

    // 8. Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.redirect(`http://147.93.29.184:3001/payment-success`);
  } catch (error) {
    await session.abortTransaction().catch(() => {});
    session.endSession();
    throw error;
  }
});


// upgradeOrDowngradeSubscription
const upgradeOrDowngradeSubscription = catchAsync(async (req, res) => {
  const { newPriceId, subscription } = req.body;
  const userId = req.User._id;

  const user = await getUserById(userId);

  if (!user.stripeSubscriptionId) {
    return res.status(400).json({ message: 'User does not have an active subscription' });
  }

  const currentSubscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
  // Check if the user is upgrading or downgrading
  const isUpgrade = currentSubscription.items.data[0].price.id !== newPriceId;

  // Update the subscription
  const updatedSubscription = await stripe.subscriptions.update(currentSubscription.id, {
    items: [{
      id: currentSubscription.items.data[0].id,
      price: newPriceId,
    }],
    proration_behavior: 'create_prorations', // Automatically adjust the billing for the change
  });
console.log({updatedSubscription})
const latestInvoice = await stripe.invoices.retrieve(updatedSubscription.latest_invoice);
console.log({latestInvoice})
  // Retrieve the prorated amount from the updated subscription
  const amountDue = updatedSubscription.latest_invoice.amount_due; // In cents
  const prorationAmount = amountDue ? amountDue / 100 : 0; // Convert to dollars (divide by 100)
  console.log({amountDue, prorationAmount})


  // //Retrieve the payment intent and method from the latest invoice
  // const paymentIntent = updatedSubscription.latest_invoice.payment_intent;
  // const paymentMethod = paymentIntent ? paymentIntent.payment_method : undefined;


  const transactionData = {
    user: userId,
    // amount: prorationAmount, // The prorated amount (in dollars)
    subscription: subscription, // Stripe Subscription ID (string)
    // transactionId: paymentIntent.id, // Stripe Payment Intent ID
    // paymentMethod: paymentMethod, // Stripe Payment Method
  };

  await addTransactionService(transactionData); 

  user.stripeSubscriptionId = updatedSubscription.id;
  await user.save();

  res.status(200).json({ message: isUpgrade ? 'Subscription upgraded' : 'Subscription downgraded', prorationAmount });
});






const allTransactions = catchAsync(async (req, res) => {
    const options = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
    };
    const transactions = await getAllTransactions(options);
    return res.status(status.OK).json(response({ status: 'Success', statusCode: status.OK, type: 'transaction', message: 'all-transactions', data: transactions }));
})



const totalEarning = catchAsync(async (req, res) => {
    const total = await getTotalEarning();
    return res.status(status.OK).json(response({ status: 'Success', statusCode: status.OK, type: 'transaction', message: 'total-earning', data: total }));
})


const earningRatio = catchAsync(async (req, res) => {

    let year = Number(req.query.year) || new Date().getFullYear();
    const ratio = await getMonthlyEarningRatio(year);

    return res.status(status.OK).json(
        response({
            statusCode: status.OK,
            message: 'earning-ratio',
            data: ratio,
            status: 'ok',
        })
    );
});

const transactionDetails = catchAsync(async (req, res) => {
    const transaction = await getTransactionByIdWithPopulate(req.params.id);
    return res.status(status.OK).json(response({ status: 'Success', statusCode: status.OK, type: 'transaction', message: 'transaction-details', data: transaction }));
})


module.exports = { paymentController, paymentCompleteController,upgradeOrDowngradeSubscription, allTransactions, transactionDetails, totalEarning, earningRatio }