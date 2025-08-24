const { default: status } = require("http-status");
const { addNotificationService, getNotificationService, updateNotificationService } = require("./notification.service");
const catchAsync = require("../../helpers/catchAsync");
const response = require("../../helpers/response");
const ApiError = require("../../helpers/ApiError");

const addNotification = catchAsync(async (req, res) => {
    if(req.User.role !== 'admin') throw new ApiError(status.UNAUTHORIZED, 'Unauthorized User tryin to post!');
    req.body.user = req.User._id;
    const notification = await addNotificationService(req.body);
    return res.status(status.CREATED).json(response({ status: 'Success', statusCode: status.CREATED, type: 'notification', message: 'notification-added', data: notification }));
})

const getNotification = catchAsync(async (req, res) => {
    const options = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10
    }
    const notification = await getNotificationService(options);
    return res.status(status.OK).json(response({ status: 'Success', statusCode: status.OK, type: 'notification', message: 'notification-found', data: notification }));
})

const readNotification = catchAsync(async (req, res) => {
    const  notification = await updateNotificationService(req.params.id, { isRead: true });
    return res.status(status.OK).json(response({ status: 'Success', statusCode: status.OK, type: 'notification', message: 'notification-read', data: notification }));
})

module.exports = { addNotification, getNotification, readNotification }