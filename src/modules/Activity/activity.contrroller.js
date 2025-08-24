const { default: status } = require("http-status");
const catchAsync = require("../../helpers/catchAsync");
const Activity = require("./activity.model");
const { getActiveUserStatsService } = require("./activity.service");
const mysubscriptionModel = require("../MySubscription/mysubscription.model");

// const seeMostVisitedPage = catchAsync(async (req, res) => {[]
//   const data = await Activity.aggregate([
//     {
//       $group: {
//         _id: '$path',
//         count: { $sum: 1 }
//       }
//     },
//     { $sort: { count: -1 } }
//   ]);

//   return res.status(200).json({ status: "success", statusCode: status.OK, message: "Most visited pages", data });
// });

const seeMostVisitedPage = catchAsync(async (req, res) => {
  const data = await Activity.aggregate([
    {
      $project: {
        originalPath: '$path',
        normalizedPath: {
          $cond: [
            { $regexMatch: { input: "$path", regex: /^\/api\/v1\/property\/search\// } },
            "/api/v1/property/search/",
            "$path"
          ]
        }
      }
    },
    {
      $group: {
        _id: '$normalizedPath',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);

  return res.status(200).json({
    status: "success",
    statusCode: status.OK,
    message: "Most visited pages",
    data
  });
});



//// from free to paid
const calculateConversionRate = async () => {
  const allSubs = await mysubscriptionModel.aggregate([
    {
      $sort: { createdAt: -1 } 
    },
    {
      $group: {
        _id: "$user",
        latestPlan: { $first: "$planName" }
      }
    },
    {
      $group: {
        _id: null,
        totalFreeUsers: {
          $sum: {
            $cond: [{ $eq: ["$latestPlan", "Free"] }, 1, 0]
          }
        },
        totalPaidUsers: {
          $sum: {
            $cond: [
              { $in: ["$latestPlan", ["Basic", "Pro", "Premium"]] },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalFreeUsers: 1,
        totalPaidUsers: 1,
        conversionRate: {
          $cond: [
            { $eq: ["$totalFreeUsers", 0] },
            0,
            {
              $multiply: [
                { $divide: ["$totalPaidUsers", { $add: ["$totalFreeUsers", "$totalPaidUsers"] }] },
                100
              ]
            }
          ]
        }
      }
    }
  ]);

  return allSubs[0] || {
    totalFreeUsers: 0,
    totalPaidUsers: 0,
    conversionRate: 0
  };
};



const seeActiveUsers = catchAsync(async (req, res) => {
  const data = await getActiveUserStatsService();
  return res.status(status.OK).json({
    status: 'success',
    statusCode: status.OK,
    message: 'Active user stats',
    data
  });
});


// const seeActiveUsers = catchAsync(async (req, res) => {
//   try {
//     const today = new Date();
//     const startOfToday = new Date(today.setHours(0, 0, 0, 0));
//     const startOfWeek = new Date();
//     startOfWeek.setDate(startOfWeek.getDate() - 6);

//     // 1. Daily active users
//     const dailyStats = await Activity.aggregate([
//       {
//         $match: {
//           userId: { $ne: null }
//         }
//       },
//       {
//         $group: {
//           _id: {
//             $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
//           },
//           users: { $addToSet: '$userId' }
//         }
//       },
//       {
//         $project: {
//           date: '$_id',
//           activeUser: { $size: '$users' },
//           _id: 0
//         }
//       },
//       { $sort: { date: -1 } }
//     ]);

//     // 2. Weekly active users (unique users over last 7 days)
//     const weeklyUsers = await Activity.distinct('userId', {
//       userId: { $ne: null },
//       timestamp: { $gte: startOfWeek }
//     });

//     // 3. Today's total visits (every hit, not just unique users)
//     const todayVisitCount = await Activity.distinct('userId', {
//       userId: { $ne: null },
//       timestamp: { $gte: startOfToday }
//     });

//     return res.status(200).json({
//       status: 'success',
//       statusCode: status.OK,
//       message: 'Active user stats',
//       data: {
//         dailyStats,
//         weeklyAciveUsersCount: weeklyUsers.length,
//         todayVisitUserCount: todayVisitCount.length
//       }
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({
//       status: 'error',
//       statusCode: status.INTERNAL_SERVER_ERROR,
//       message: 'An error occurred while fetching active user stats'
//     });
//   }
// });



module.exports = { seeMostVisitedPage, seeActiveUsers, calculateConversionRate };