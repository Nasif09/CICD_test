// middleware/activityTracker.js

const activityModel = require("../modules/Activity/activity.model");

const activityTracker = async (req, res, next) => {
  try {
    // console.log("activityTracker:: ",req.User);
    const userId = req.User?._id || null; 
    const path = req.originalUrl;

    await activityModel.create({
      userId,
      path,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('Activity log failed:', err);
  }

  next();
};

module.exports = activityTracker;
