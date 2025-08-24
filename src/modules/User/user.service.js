const { decode } = require('jsonwebtoken');
const User = require('./user.model');
const { default: mongoose } = require('mongoose');
const httpStatus = require('http-status');
const ApiError = require("../../helpers/ApiError");
const { search } = require('./user.route');
const subscriptionModel = require('../Subscription/subscription.model');
const isBoolean = require('lodash.isboolean');
const { CLOSING } = require('ws');

const getUserById = async (id) => {
  return await User.findById(id).select('+password');
}

const getUserProfile = async (id) => {
  return await User.aggregate([
    {
      $match: { _id: new mongoose.Types.ObjectId(String(id)) }
    },
    {
      $lookup: {
        from: 'mysubscriptions',
        localField: 'subscription',
        foreignField: '_id',
        as: 'mysubscription'
      }
    },
    {
      $unwind: {
        path: '$mysubscription',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: 'mysubscription.subscription',
        foreignField: '_id',
        as: 'subscription'
      }
    },
    {
      $unwind: {
        path: '$subscription',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        _id: 1,
        fullName: 1,
        email: 1,
        image: 1,
        phoneNumber: 1,
        address: 1,
        createdAt: 1,
        isBan: 1,
        subscriptionId: '$mysubscription.subscription',
        subscriptionName: '$subscription.planName',
      }
    }
  ]);
}


const getSpecificDetails = async (id, select) => {
  return await User.findById(id).select(select);
}

const getUserByEmail = async (email) => {
  return await User.findOne({ email });
}
const getUserByfilter = async (filter) => {
  return await User.findOne(filter);
}



const deleteAccount = async (id) => {
  return await User.findByIdAndDelete(id)
}





const calculateCountUserService = async () => {
  return await User.countDocuments();
};


const banUserService = async(id, data) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error('User not found');
  }
  Object.assign(user, data);
  const updatedUser = await user.save();
  return updatedUser;
}


const unbanUserService = async(id, data) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error('User not found');
  }
  Object.assign(user, data);
  const updatedUser = await user.save();
  return updatedUser;
} 

const isAppUserService = async() => {
  return User.countDocuments({isAppUser: true})
} 

const iswebUserService = async() => {
  return User.countDocuments({isAppUser: false})
} 



const updateUser = async (userId, userbody) => {
  let result

  if (userbody && userbody.isDeleted === "true" || userbody.isDeleted === true) {
    result = await User.findByIdAndUpdate(userId, { isDeleted: true }, { new: true });
  }
  else {
    result = await User.findByIdAndUpdate(userId, userbody, { new: true });
  }

  return result
}

const addMoreUserFeild = async (id, data) => {
  const user = await User.findById(id);
  if (!user) {
    throw new Error('User not found');
  }
  Object.assign(user, data);
  const updatedUser = await user.save();
  return updatedUser;
};



const getUsers = async (filter, options) => {
  const users = await User.aggregate([
    { $match: filter },
    { 
      $lookup: { 
        from: 'mysubscriptions', 
        localField: 'subscription', 
        foreignField: '_id', 
        as: 'mysubscription' 
      } 
    },
    { $unwind: { path: '$mysubscription', preserveNullAndEmptyArrays: true } },
    { 
      $lookup: { 
        from: 'favourites', 
        localField: '_id',  
        foreignField: 'user', 
        as: 'favourite' 
      } 
    },
    { 
      $addFields: { 
        favouriteProperties: { $cond: { if: { $isArray: '$favourite' }, then: { $size: '$favourite' }, else: 0 } } 
      } 
    },

    // Project required fields
    { 
      $project: {
        userId: '$_id',
        fullName: 1,
        email: 1,
        phoneNumber: 1,
        address: 1,
        role: 1,
        image: 1,
        propertySearchCount: '$propertySearchCount',
        isBan: 1,
        subscriptionId: '$mysubscription.subscription',
        memberType: '$mysubscription.planName',
        propertySearch: '$mysubscription.searchCount',
        favouriteProperties: 1
      } 
    },

    { $sort: { createdAt: -1 } },
    { $skip: (options.page - 1) * options.limit },
    { $limit: options.limit }
  ]);

  const totalResults = await User.countDocuments(filter);
  const totalPages = Math.ceil(totalResults / options.limit);
  const pagination = { totalResults, totalPages, currentPage: options.page, limit: options.limit };

  return { users, pagination };
};


const getMonthlyUserRatio = async (year) => {
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31T23:59:59`);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const result = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { "_id.month": 1 }
    }
  ]);

  // Format result for all 12 months, default to 0 if no users
  const formattedResult = months.map((month, index) => {
    const monthData = result.find(r => r._id.month === index + 1);
    return {
      month,
      user: monthData ? monthData.count : 0
    };
  });

  return formattedResult;
};





const checkForUserWithGroup = async (searchQuery) => {
  try {
    const regex = new RegExp('.*' + searchQuery + '.*', 'i');

    // Perform aggregation
    const result = await User.aggregate([
      // Step 1: Match the user in the User collection
      {
        $match: {
          $or: [{ fullName: { $regex: regex } }, { email: { $regex: regex } }],
        },
      },
      {
        $limit: 3, // Limit to three users match
      },
      // Step 2: Lookup to check group membership
      {
        $lookup: {
          from: 'groups', // Collection name for Group
          localField: '_id',
          foreignField: 'participants',
          as: 'userGroups',
        },
      },
      // Step 3: Unwind userGroups to handle empty or null arrays
      {
        $unwind: {
          path: '$userGroups',
          preserveNullAndEmptyArrays: true, // Allow users with no groups
        },
      },
      // Step 4: Add a field for group membership status
      {
        $addFields: {
          isInGroup: { $cond: { if: { $ifNull: ['$userGroups', false] }, then: true, else: false } },
        },
      },
      // Step 5: Project the required fields
      {
        $project: {
          _id: 1,
          fullName: 1,
          image: 1,
          isInGroup: 1,
        },
      },
    ]);

    if (!result || result.length === 0) {
      return { message: 'User not found', data: null }; // Return when no user is matched
    }

    return { message: 'Users found', data: result }; // Return matched users' details
  } catch (error) {
    console.error('Error in checkForUserWithGroup:', error);
    return { message: 'An error occurred', data: null };
  }
};


const acceptDriverVerification = async (token, payload) => {
  const { userId, validDriver, isOnDuty } = payload
  const decodedToken = decode(token, process.env.SECRET_KEY);


  if (decodedToken.role !== 'admin') {
    throw new Error('You are not authorized to perform this action');
  }

  const driver = await User.findById(userId);
  if (!driver) {
    throw new Error('Driver not found');
  }

  const result = await User.findByIdAndUpdate(userId, { $set: { validDriver: validDriver } }, { new: true });
  return result
};

const activeOnDutyStatus = async (userId, payload) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.role !== 'driver') {
    throw new Error('You are not authorized to perform this action');
  }

  const truckId = payload?.truckId
  const trailerId = payload?.trailerId



  let result
  let findTruckFromEquipment
  let findTrailerIdFromEquipment
  let findTruck
  if (payload.isOnDuty) {

    findTruckFromEquipment = await Equipment.findOne({
      $and: [
        {
          _id: new mongoose.Types.ObjectId(String(truckId)),
        },
        {
          driver: new mongoose.Types.ObjectId(String(userId))
        }
      ]
    })

    if (!findTruckFromEquipment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'No Truck found');
    }

    findTrailerIdFromEquipment = await Equipment.findOne({
      $and: [
        {
          $and: [
            {
              _id: new mongoose.Types.ObjectId(String(trailerId)),
            },
            {
              driver: new mongoose.Types.ObjectId(String(userId))
            }
          ]
        },
        {
          $and: [
            { trailerSize: { $gt: 0 }, },
            { palletSpace: { $gt: 0 } }
          ]
        }
      ]
    })

    if (!findTrailerIdFromEquipment) {
      throw new ApiError(httpStatus.NOT_FOUND, 'You have no trailer and pallet space');
    }

    result = await User.findByIdAndUpdate(
      userId,
      {
        $set: { location: payload.location, isOnDuty: payload.isOnDuty }
      }, { new: true });


    const addTruckData = {
      driver: userId,
      cdlNumber: findTruckFromEquipment.cdlNumber,
      truckNumber: findTruckFromEquipment.truckNumber,
      trailerSize: findTrailerIdFromEquipment.trailerSize,
      palletSpace: findTrailerIdFromEquipment.palletSpace,
      weight: findTrailerIdFromEquipment.weight
    }

    findTruck = await Truck.findOne({
      driver: userId,
      cdlNumber: findTruckFromEquipment.cdlNumber,
      truckNumber: findTruckFromEquipment.truckNumber,
    })
    if (!findTruck) {
      await Truck.create(addTruckData)
    }
  }

  result = await User.findByIdAndUpdate(
    userId,
    {
      $set: { isOnDuty: payload.isOnDuty }
    }, { new: true });


  // setInterval(async () => {
  //   try {
  //     result = await User.findByIdAndUpdate(
  //       userId,
  //       {
  //         $set: { location: payload.location }
  //       }, { new: true });
  //   } catch (error) {
  //     console.error('Error in interval:', error.message);
  //   }
  // }, 60 * 1000);

  return { result, findTruck }

}

const allDriverRequestQuery = async (query) => {

  const page = query.page || 1;
  const limit = query.limit || 10;

  const skip = (Number(page) - 1) * Number(limit);

  const result = await User.aggregate([
    { $match: { role: 'driver' } },
    { $match: { validDriver: false } },
    { $skip: skip },
    { $limit: Number(limit) },
  ]);

  // Optionally, include total count for pagination meta info
  const totalResults = await User.countDocuments({ role: 'driver', validDriver: false });
  const totalPages = Math.ceil(totalResults / Number(limit));

  return {
    data: result,
    pagination: {
      page,
      limit,
      totalPages,
      totalResults,
    },
  };
};

module.exports = {
  getUserById,
  banUserService,
  unbanUserService,
  getUserProfile,
  updateUser,
  getUserByEmail,
  deleteAccount,
  getUsers,
  getSpecificDetails,
  getMonthlyUserRatio,
  checkForUserWithGroup,
  addMoreUserFeild,
  getUserByfilter,
  acceptDriverVerification,
  activeOnDutyStatus,
  allDriverRequestQuery,
  calculateCountUserService,
  iswebUserService,
  isAppUserService
}
