const { default: status } = require("http-status");
const catchAsync = require('../../helpers/catchAsync')
const response = require("../../helpers/response");
const unlinkImage = require('../../helpers/unlinkImage')
const { getUserById, getUsers, updateUser, getMonthlyUserRatio, addMoreUserFeild, deleteAccount, getUserProfile, calculateCount, unbanUserService, banUserService, calculateCountUserService, iswebUserService, isAppUserService } = require('./user.service');
const { getMySubscriptionById, getMySubscription, calculateSubscriptionCount, calculateChurnRate } = require("../MySubscription/mysubscription.service");
const { default: mongoose } = require("mongoose");
const ApiError = require("../../helpers/ApiError");
const bcrypt = require('bcryptjs');
const { getActiveUserStatsService } = require("../Activity/activity.service");
const { getTotalEarning } = require("../Transaction/transaction.service");
const { calculateConversionRate } = require("../Activity/activity.contrroller");
const { searchCount } = require("../SystemStats/systemStats.service");


//Get user details
const userDetails = catchAsync(async (req, res) => {
  const userDetails = await getUserProfile(req.User._id);
  return res.status(status.OK).json(response({ statusCode: status.OK, message: 'user-details', data: userDetails, status: "OK" }));
})



const seeOwnReferalCode = catchAsync(async (req, res) => {
  const data = await getUserById(req.User._id);
  return res.status(status.OK).json(response({ status: 'Success', statusCode: status.OK, type: 'user', message: 'your referal code', data: data.yourRefaralCode }));
})



const userDetailsByID = catchAsync(async (req, res) => {
  const userDetails = await getUserProfile(req.params.id);
  return res.status(status.OK).json(response({ statusCode: status.OK, message: 'user-details-byId', data: userDetails, status: "OK" }));
})


const countController = catchAsync(async (req, res) => {
  // if(req.User.role !== 'admin') throw new ApiError(status.UNAUTHORIZED, 'unauthorized');
  const totaluser = await calculateCountUserService();
  const isAppUser  = await isAppUserService();
  const webUser = await iswebUserService()
  const activity = await getActiveUserStatsService();
  const totalEarning = await getTotalEarning();
  const conversionRate = await calculateConversionRate();
  const churnRate = await calculateChurnRate(30);
  const propertyStats =await searchCount();
  const subscriptionCount = await calculateSubscriptionCount();
  const result = { 
    totalUsers: totaluser,
    webUser : webUser ? webUser : 0,
    isAppUser : isAppUser ? isAppUser : 0,
    todayActiveUserCount: activity.todayVisitUserCount,
    churnRate: churnRate,
    weeklyAciveUsersCount: activity.weeklyAciveUsersCount,
    totalEarning: totalEarning,
    conversionRate:conversionRate.conversionRate,
    subscriptionCount: subscriptionCount,
    propertySearchCount : propertyStats.propertySearchCount
   };
  return res.status(status.OK).json(response({ statusCode: status.OK, message: 'user-count', data: result, status: "OK" }));
})


const updateProfile = catchAsync(async (req, res) => {
  const user = await getUserById(req.User._id);
  if (!user) {
    return res.status(status.NOT_FOUND).json(response({
      status: 'Error',
      statusCode: status.NOT_FOUND,
      type: 'user',
      message: 'user-not-exists'
    }));
  }

  if (req.file) {
    const { filename } = req.file;
    if (filename && filename.length > 0) {
      const defaultPath1 = '/uploads/users/user.png';
      const defaultPath2 = '/uploads/users/user.jpg';
      if (user.image !== defaultPath1 && user.image !== defaultPath2) {
        unlinkImage(user.image);
      }
      req.body.image = `/uploads/users/${filename}`;
    }
  }
  const updatedUser = await updateUser(user._id, req.body);
  return res.status(status.OK).json(response({
    status: 'OK',
    statusCode: status.OK,
    type: 'user',
    message: 'user-updated',
    data: updatedUser
  }));
});


// Get all users
const allUsers = catchAsync(async (req, res) => {
  let filters = {};
  const options = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10
  };

  const role = req.query.role;
  if (role && role !== 'null' && role !== '' && role !== undefined) {
    filters.role = role;
  }

  const search = req.query.search;
  if (search && search !== 'null' && search !== '' && search !== undefined) {
    const searchRegExp = new RegExp('.*' + search + '.*', 'i');
    filters.$or = [
      { fullName: { $regex: searchRegExp } },
      { email: { $regex: searchRegExp } },
      { phoneNumber: { $regex: searchRegExp } }
    ];
  }

  const subscriptionId = req.query.subscriptionId;
  if (subscriptionId && mongoose.Types.ObjectId.isValid(subscriptionId)) {
    const mysubscription = await getMySubscription({ subscription: new mongoose.Types.ObjectId(String(subscriptionId)) });
    const userBySubscription = mysubscription.map((mysubscription) => mysubscription.user);
    filters._id = { $in: userBySubscription };
  }
  const users = await getUsers(filters, options);
  return res.status(status.OK).json(response({ statusCode: status.OK, message: 'users-list', data: users, status: 'OK' }));
});



//Get user to  ratio
const userRatio = catchAsync(async (req, res) => {
  let year = Number(req.query.year) || new Date().getFullYear();
  const ratio = await getMonthlyUserRatio(year);

  return res.status(status.OK).json(
    response({
      statusCode: status.OK,
      message: 'user-ratio',
      data: ratio,
      status: 'ok',
    })
  );
});


const completeAccount = catchAsync(async (req, res) => {
  const user = await getUserById(req.User._id);
  if (!user) {
    return res.status(status.NOT_FOUND).json(response({
      status: 'Error',
      statusCode: status.NOT_FOUND,
      type: 'user',
      message: 'user-not-exists'
    }));
  }

  if (req.files) {
    const { profileImage, certificateImage, cdlNumberVerificationImage } = req.files;

    if (profileImage?.[0]) {
      const defaultPath1 = '/uploads/users/user.png';
      const defaultPath2 = '/uploads/users/user.jpg';
      if (user.image !== defaultPath1 && user.image !== defaultPath2) {
        unlinkImage(user.image);
      }
      req.body.image = `/uploads/users/${profileImage[0].filename}`;
    }

    if (cdlNumberVerificationImage?.[0]) {
      req.body.cdlNumberImage = `/uploads/users/${cdlNumberVerificationImage[0]?.filename}`;
    }
  }

  if (user.isComplete === false) {
    if (req.User.role === 'user') {
      const { phoneNumber, taxid, address, image, document } = req.body;
      const userId = req.User._id;
      const userInfo = { phoneNumber, image, document, taxid, address, isComplete: true };
      const updatedUser = await addMoreUserFeild(userId, userInfo);
      return res.status(status.CREATED).json(response({
        status: 'OK',
        statusCode: status.CREATED,
        type: 'user',
        message: "Account completed successfully",
        data: updatedUser,
      }));
    } else if (req.User.role === 'driver') {
      const { phoneNumber, address, image, cdlNumberImage, weight, truckNumber, trailerSize, palletSpace, cdlNumber } = req.body;
      const driver = req.User._id;
      const trailerInfo = { driver, type: 'trailer', trailerSize, palletSpace, weight };
      const truckInfo = { driver, type: 'truck', truckNumber, cdlNumber };
      const userInfo = { address, image, phoneNumber, isComplete: true, cdlNumberImage };
      const equipmentDetails = await addManyEquipmentDetails([trailerInfo, truckInfo]);
      const newProfile = await addMoreUserFeild(driver, userInfo);
      return res.status(status.CREATED).json(response({
        status: 'OK',
        statusCode: status.CREATED,
        message: 'Account completed successfully',
        data: {
          type: 'user',
          attributes: { equipmentDetails, newProfile },
        },
      }));
    }
  } else {
    return res.status(status.BAD_REQUEST).json(response({
      status: 'BAD_REQUEST',
      statusCode: status.BAD_REQUEST,
      message: 'Failed to complete account',
    }));
  }
});


const banUserController = catchAsync(async(req, res) => {
  const user = await banUserService(req.params.userId, { isBan: true });
  return res.status(status.OK).json(response({ status: 'Success', statusCode: status.OK, type: 'user', message: 'user-banned', data: user }));
})

const unbanUserController = catchAsync(async(req, res) => {
  const user = await unbanUserService(req.params.userId, { isBan: false });
  return res.status(status.OK).json(response({ status: 'Success', statusCode: status.OK, type: 'user', message: 'user-unbanned', data: user }));
})


const deleteUserAccount = catchAsync(async (req, res) => {
  const password = req.body.password;
  const user = await getUserById(req.User._id);
  
  if (!user) {
    return res.status(status.NOT_FOUND).json(response({
      status: 'Error',
      statusCode: status.NOT_FOUND,
      type: 'user',
      message: 'user-not-exists'
    }));
  }

  if (!password) {
    throw new ApiError(status.BAD_REQUEST, 'password-required');
  }

  if (!user.password) {
    throw new ApiError(status.INTERNAL_SERVER_ERROR, 'user-password-not-set');
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new ApiError(status.UNAUTHORIZED, 'password-not-match');
  }

  const data = await deleteAccount(req.User._id);
  return res.status(status.OK).json({
    status: 'OK',
    statusCode: status.OK,
    message: 'Account Deleted successfully',
    data: data,
  });
});



const Count = catchAsync(async (req, res) => {
  const result = await calculateCount();
  return res.status(status.OK).json({ status: 'OK', statusCode: status.OK, message: 'Count fetched successfully', data: result, });
})


module.exports = { userDetails, updateProfile, allUsers, userRatio, completeAccount, deleteUserAccount, Count,userDetailsByID, unbanUserController,seeOwnReferalCode, banUserController,countController };