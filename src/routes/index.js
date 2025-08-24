const express = require('express');
const router = express.Router();
const authRoutes = require('../modules/Auth/auth.route');
const userRoutes = require('../modules/User/user.route');
const staticContentRoutes = require('../modules/StaticContent/staticContent.route');
const fandqRoutes = require('../modules/F&Q/fq.route');
const subscriptionRoutes = require('../modules/Subscription/subscription.route');
const mysubscriptionRoutes = require('../modules/MySubscription/mysubscription.route');
const favouriteRoutes = require('../modules/Favourite/favourite.route');
const activityRoutes = require('../modules/Activity/activity.route');
const feedbackRoutes = require('../modules/FeedBack/feedback.route');
const notificationsRoutes = require('../modules/Notification/notification.route');
const transactionRoutes = require('../modules/Transaction/transaction.route');
const requestFeatureRoutes = require('../modules/RequestFeature/requestFeature.route');
const referalsRoutes = require('../modules/ReferalManagement/referalManagement.route');
const refStatusRoutes = require('../modules/ReferalStatusManagement/refStatus.route');
const propertyRoutes = require('../modules/Property/property.route');


const moduleRoutes = [
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/users',
    route: userRoutes,
  },
  {
    path: '/static-contents',
    route: staticContentRoutes,
  },
  {
    path: '/fandq',
    route: fandqRoutes,
  },
  {
    path: '/subscription',
    route: subscriptionRoutes,
  },
  {
    path: '/mysubscription',
    route: mysubscriptionRoutes,
  },
  {
    path: '/notifications',
    route: notificationsRoutes,
  },
  {
    path: '/activity',
    route: activityRoutes,
  },
  {
    path: '/favourite',
    route: favouriteRoutes
  },
  {
    path: '/property',
    route: propertyRoutes
  },
  {
    path: '/feedback',
    route: feedbackRoutes
  },
  {
    path: '/transaction',
    route: transactionRoutes
  },
  {
    path: '/request-feature',
    route: requestFeatureRoutes
  },
  {
    path: '/referals',
    route: referalsRoutes
  },
  {
    path: '/ref-status',
    route: refStatusRoutes
  }
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

module.exports = router;