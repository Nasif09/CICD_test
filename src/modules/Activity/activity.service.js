const Activity = require("./activity.model");

const getActiveUserStatsService = async () => {
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 6);

  // 1. Daily active users
//   const dailyStats = await Activity.aggregate([
//     {
//       $match: {
//         userId: { $ne: null }
//       }
//     },
//     {
//       $group: {
//         _id: {
//           $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
//         },
//         users: { $addToSet: '$userId' }
//       }
//     },
//     {
//       $project: {
//         date: '$_id',
//         activeUser: { $size: '$users' },
//         _id: 0
//       }
//     },
//     { $sort: { date: -1 } }
//   ]);

  // 2. Weekly active users (unique users over last 7 days)
  const weeklyUsers = await Activity.distinct('userId', {
    userId: { $ne: null },
    timestamp: { $gte: startOfWeek }
  });

  // 3. Today's total visits (every hit, not just unique users)
  const todayVisitCount = await Activity.distinct('userId', {
    userId: { $ne: null },
    timestamp: { $gte: startOfToday }
  });

  return {
    // dailyStats,
    weeklyAciveUsersCount: weeklyUsers.length,
    todayVisitUserCount: todayVisitCount.length
  };
};


module.exports = { getActiveUserStatsService };