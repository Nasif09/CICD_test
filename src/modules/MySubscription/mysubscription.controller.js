const { default: status } = require("http-status");
const { addMySubscription, getMySubscriptionService, calculateSubscriptionCount, getMySubscriptionByFilter, mySubscriptions, deductSubscriptionService, searchLimitService, checkSubscriptionService } = require("./mysubscription.service");
const catchAsync = require("../../helpers/catchAsync");
const response = require("../../helpers/response");
const { getUserById } = require("../User/user.service");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const purchaseSubscription = catchAsync(async (req, res) => {
  req.body.user = req.User._id
  const mySubscription = await addMySubscription(req.body);
  const user = await getUserById(req.User._id);
  user.subscription = mySubscription._id;
  await user.save();
  return res.status(status.CREATED).json(response({ status: 'Success', statusCode: status.CREATED, type: 'mySubscription', message: 'mySubscription-added', data: mySubscription }));
});

const cancelSubscription = catchAsync(async (req, res) => {
  // const mySubscription = await getMySubscriptionByFilter({ user: req.User._id });
  // console.log({mySubscription});

  const stripeSubscriptionId = req.params.stripeSubscriptionId;
  console.log({ stripeSubscriptionId });
  const updatedSubscription = await stripe.subscriptions.update(stripeSubscriptionId, {
    cancel_at_period_end: true,
  });
  // if(updatedSubscription.status === 'canceled') {
  //   mySubscription.isActive = false;
  //   await mySubscription.save();
  // }
  return res.status(status.OK).json(response({ status: 'Success', statusCode: status.OK, type: 'mySubscription', message: 'mySubscription-cancelled', data: updatedSubscription }));
});


const mySubscription = catchAsync(async (req, res) => {
  const mySubscription = await getMySubscriptionService({ user: req.User._id });
  return res.status(status.OK).json(response({ status: 'Success', statusCode: status.OK, type: 'mySubscription', message: 'mySubscription', data: mySubscription }));
});

const subsCount = catchAsync(async (req, res) => {
  const count = await calculateSubscriptionCount();
  return res.status(status.OK).json(response({ statusCode: status.OK, message: 'subs count', data: count, status: "OK" }));
})

const mySearchLimit = catchAsync(async (req, res) => {
  const count = await searchLimitService({ user: req.User._id });
  return res.status(status.OK).json(response({ statusCode: status.OK, message: 'my search limit fetched', data: count, status: "OK" }));
})

const deductSubscription = catchAsync(async (req, res) => {
  const result = await deductSubscriptionService({ user: req.User._id });
  return res.status(status.OK).json(response({ status: 'Success', statusCode: status.OK, type: 'mySubscription', message: 'mySubscription', data: result }));
});

const checkSubscriptionController = catchAsync(async (req, res) => {
  const result = await checkSubscriptionService({ user: req.User._id });
  return res.status(status.OK).json(response({ status: 'Success', statusCode: status.OK, type: 'mySubscription', message: 'valid subscription', data: result }));
});


module.exports = { purchaseSubscription, mySubscription, subsCount, cancelSubscription, deductSubscription, mySearchLimit, checkSubscriptionController };