const notificationModel = require('./notification.model');


const addNotificationService = async (data) => {
    return await notificationModel.create(data);
}

const getNotificationService = async (options) => {
    const { page = 1, limit = 10 } = options;
    const totalResults = await notificationModel.countDocuments();
    const totalPages = Math.ceil(totalResults / limit);
    const notification = await notificationModel.find().skip((page - 1) * limit).limit(limit).sort({createdAt: -1});
    return { notification, pagination: { page, limit, totalPages, totalResults } };
}

const updateNotificationService = async (id, data) => {
    return await notificationModel.findOneAndUpdate({ _id: id }, data, { new: true });
}

module.exports = { addNotificationService, getNotificationService, updateNotificationService }