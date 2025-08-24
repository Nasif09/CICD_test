const transactionModel = require("./transaction.model");

// const addTransactionService = async (data) => await Transaction.create(data);

const addTransactionService = async (data) => {
    return await transactionModel.create(data);
}

const getTotalEarning = async()=> {
  const total = await transactionModel.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: '$amount' }
            }
        }
    ]);
    return total[0].total
}

const getAllTransactions = async (options) => {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const transactions = await transactionModel.find()
        .populate('user', 'fullName email phoneNumber')
        .populate('subscription', 'planName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    const totalResults = await transactionModel.countDocuments();
    const totalPages = Math.ceil(totalResults / limit);
    return { transactions, pagination: { page, limit, totalPages, totalResults } };
}
  // await transactionModel.find().populate('user', 'fullName email phoneNumber').populate('subscription', 'planName').sort({ createdAt: -1 });


const getTransactionByIdWithPopulate = async (transactionId) => {
    return await transactionModel.findById( transactionId ).populate('user', 'fullName email phoneNumber').populate('subscription', 'planName');}

const getTransactionByTransactionId = async (transactionId) => await transactionModel.findOne({ transactionId });

const getMonthlyEarningRatio = async (year) => {
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31T23:59:59`);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const result = await transactionModel.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        totalEarning: { $sum: "$amount" }
      }
    },
    {
      $sort: { "_id.month": 1 }
    }
  ]);

  // Ensure all 12 months are included, even with 0 earnings
  const formattedResult = months.map((month, index) => {
    const monthData = result.find(r => r._id.month === index + 1);
    return {
      month,
      earnings: monthData ? monthData.totalEarning : 0
    };
  });

  return formattedResult;
};


module.exports = { addTransactionService , getTransactionByTransactionId ,getTotalEarning, getAllTransactions, getTransactionByIdWithPopulate, getMonthlyEarningRatio};