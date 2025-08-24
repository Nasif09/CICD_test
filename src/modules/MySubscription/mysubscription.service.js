const ApiError = require("../../helpers/ApiError");
const { subscriptionByID } = require("../Subscription/subscription.service");
const mysubscriptionModel = require("./mysubscription.model");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const addMySubscription = async (data) => {
  const plan = await subscriptionByID(data.subscription);
  const mySubs = await getMySubscriptionByFilter({ user: data.user, subscription: data.subscription });
  // console.log({mySubs})
  if (plan.planName === 'Free' && mySubs) throw new ApiError(402, 'You\'ve already used the free plan. Try a paid one.')
  // console.log({ mySubs });
  if (!mySubs) {
    const mySubscriptionData = {
      user: data.user,
      stripeSubscriptionId: data.stripeSubscriptionId,
      subscription: data.subscription,
      expiryDate: new Date(Date.now() + data.planDuration * 24 * 60 * 60 * 1000),
      searchLimit: data.planSearchLimit,
      planName: plan.planName,
      planDuration: data.planDuration,
      purchasedSearchLimit: data.planSearchLimit,
      planSearchLimit: data.planSearchLimit,
      isActive: true
    };
    return await mysubscriptionModel.create(mySubscriptionData);
  } else {
    await stripe.subscriptions.update(mySubs.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });//delete subs auto renew
    mySubs.isActive = true;
    const now = new Date();
    const isExpired = new Date(mySubs.expiryDate) < now;
    // If expired → reset searchLimit and expiry
    if (isExpired) {
      mySubs.searchLimit = data.planSearchLimit;
      mySubs.purchasedSearchLimit = data.planSearchLimit;
      mySubs.expiryDate = new Date(now.getTime() + data.planDuration * 24 * 60 * 60 * 1000);
    } else {
      // Not expired → extend expiry and add to searchLimit
      mySubs.searchLimit += data.planSearchLimit;
      mySubs.purchasedSearchLimit += data.planSearchLimit;
      mySubs.expiryDate = new Date(mySubs.expiryDate.getTime() + data.planDuration * 24 * 60 * 60 * 1000);
    }
    // mySubs.expiryDate = new Date(mySubs.expiryDate.getTime() + data.planDuration * 24 * 60 * 60 * 1000);
    // mySubs.searchLimit = mySubs.searchLimit + data.planSearchLimit;
    mySubs.stripeSubscriptionId = data.stripeSubscriptionId
    return await mySubs.save();
  }
}

const getMySubscriptionService = async (data) => {
  return await mysubscriptionModel.find(data).populate('subscription').sort({ createdAt: -1 });
}

const getMySubscriptionById = async (id) => {
  return await mysubscriptionModel.findById(id);
}

const getMySubscriptionByFilter = async (filter) => {
  return await mysubscriptionModel.findOne(filter);
}


const calculateSubscriptionCount = async () => {
  const subscriptionUsage = await mysubscriptionModel.aggregate([
    {
      $group: {
        _id: "$subscription",
        userCount: { $sum: 1 },
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "_id",
        as: "subscriptionDetails"
      }
    },
    {
      $unwind: "$subscriptionDetails"
    },
    {
      $project: {
        _id: 0,
        // subscriptionId: "$subscriptionDetails._id",
        planName: "$subscriptionDetails.planName",
        userCount: 1
      }
    }
  ]);

  return subscriptionUsage;
};



const deductSubscriptionService = async (filter) => {
  const allSubscriptions = await mySubscriptions(filter);
  const sortedPlans = ['Premium', 'Pro', 'Basic', 'Free'];

  for (const plan of sortedPlans) {
    const activeSub = allSubscriptions.find(sub =>
      sub.planName === plan &&
      sub.isActive === true &&
      new Date(sub.expiryDate) > new Date() &&
      sub.searchLimit > 0
    );

    if (activeSub) {
      activeSub.searchLimit -= 1;
      await activeSub.save();

      const planDeatails = await subscriptionByID(activeSub.subscription);

      return {
        success: true,
        usedPlan: plan,
        subs: planDeatails,
        remainingSearchLimit: activeSub.searchLimit
      };
    }
  }

  return {
    success: false,
    message: "No valid subscription available"
  };
};


const checkSubscriptionService = async (filter) => {
  const allSubscriptions = await mySubscriptions(filter);
  const sortedPlans = ['Premium', 'Pro', 'Basic', 'Free'];

  for (const plan of sortedPlans) {
    const activeSub = allSubscriptions.find(sub =>
      sub.planName === plan &&
      sub.isActive === true &&
      new Date(sub.expiryDate) > new Date() &&
      sub.searchLimit > 0
    );

    if (activeSub) {
      const planDeatails = await subscriptionByID(activeSub.subscription);
      return {
        usedPlan: plan,
        subs: planDeatails,
      };
    }
  }

  return {
    success: false,
    message: "No valid subscription available"
  };
};


// const searchLimitService = async (filter) => {
//   const allSubscriptions = await mySubscriptions(filter);
//   const sortedPlans = ['Premium', 'Pro', 'Basic', 'Free' ];

//   for (const plan of sortedPlans) {
//     const activeSub = allSubscriptions.find(sub =>
//       sub.planName === plan &&
//       sub.isActive === true &&
//       new Date(sub.expiryDate) > new Date() &&
//       sub.searchLimit > 0
//     );

//     if (activeSub) {
//       return {
//         success: true,
//         usedPlan: plan,
//         purchasedSearchLimit: activeSub.purchasedSearchLimit,
//         remainingSearchLimit: activeSub.searchLimit
//       };
//     }
//   }

//   return {
//     success: false,
//     message: "No valid subscription available"
//   };
// };


const searchLimitService = async (filter) => {
  const allSubscriptions = await mySubscriptions(filter);

  const activeSubscriptions = allSubscriptions.filter(sub =>
    sub.isActive === true &&
    new Date(sub.expiryDate) > new Date() &&
    sub.searchLimit > 0
  );

  if (activeSubscriptions.length === 0) {
    return {
      success: false,
      message: "No valid subscription available"
    };
  }

  const purchasedSearchLimit = activeSubscriptions.reduce((sum, sub) => {
    return sum + (sub.purchasedSearchLimit || 0);
  }, 0);

  const remainingSearchLimit = activeSubscriptions.reduce((sum, sub) => {
    return sum + sub.searchLimit;
  }, 0);

  return {
    success: true,
    purchasedSearchLimit,
    remainingSearchLimit
  };
};



// //Churn Rate (%) = (Number of Users Lost During Period / Total Users at Start of Period) × 100

// const calculateChurnRate = async (days = 30 ) => {
//   const now = new Date();
//   const pastDate = new Date();
//   pastDate.setDate(now.getDate() - days);

//   // Step 1: Get paid users at the start of the period
//   const totalPaidStart = await mysubscriptionModel.countDocuments({
//     planName: { $in: ["Basic", "Pro", "Premium"] },
//     createdAt: { $lte: pastDate },
//     expiryDate: { $gt: pastDate },
//     isActive: true
//   });
//   console.log({ totalPaidStart });

//   // Step 2: Get users who churned during the period
//   const churnedUsers = await mysubscriptionModel.countDocuments({
//     planName: { $in: ["Basic", "Pro", "Premium"] },
//     $or: [
//       { isActive: false },
//       { expiryDate: { $lt: now } }
//     ],
//     updatedAt: { $gte: pastDate }
//   });
//   console.log({ churnedUsers });

//   const churnRate = totalPaidStart === 0 ? 0 : (churnedUsers / totalPaidStart) * 100;
//   return {
//     periodInDays: days,
//     totalPaidStart,
//     churnedUsers,
//     churnRate: parseFloat(churnRate.toFixed(2))
//   };
// };


// //this is for all time 
// //Churn Rate (%) =(Number of people who left ÷ Number of people who ever paid) × 100
const calculateChurnRate = async () => {
  // Step 1: Total users who have ever subscribed to a paid plan
  const totalPaidEver = await mysubscriptionModel.distinct('user', {
    planName: { $in: ["Basic", "Pro", "Premium"] }
  });

  // Step 2: Users who are no longer active or whose subscription expired
  const churnedUserIds = await mysubscriptionModel.distinct('user', {
    planName: { $in: ["Basic", "Pro", "Premium"] },
    $or: [
      { isActive: false },
      { expiryDate: { $lt: new Date() } }
    ]
  });

  const totalPaidCount = totalPaidEver.length;
  const churnedCount = churnedUserIds.filter(userId => totalPaidEver.includes(userId)).length;

  const churnRate = totalPaidCount === 0 ? 0 : (churnedCount / totalPaidCount) * 100;

  return {
    totalPaidUsersAllTime: totalPaidCount,
    totalChurnedUsers: churnedCount,
    churnRate: parseFloat(churnRate.toFixed(2))
  };
};




const mySubscriptions = async (id) => {
  return await mysubscriptionModel.find(id);
}


module.exports = {
  addMySubscription,
  getMySubscriptionService,
  checkSubscriptionService,
  calculateChurnRate,
  calculateSubscriptionCount,
  getMySubscriptionById,
  searchLimitService,
  getMySubscriptionByFilter,
  mySubscriptions,
  deductSubscriptionService
}





