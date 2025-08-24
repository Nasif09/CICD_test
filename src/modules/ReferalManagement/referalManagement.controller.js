const { default: status } = require("http-status");
const response = require("../../helpers/response");
const catchAsync = require("../../helpers/catchAsync");
const { getAllReferalsService } = require("./referalManagement.service");
const ApiError = require("../../helpers/ApiError");

const getAllReferals = catchAsync(async (req, res) => {
    if (req.User.role !== 'admin') throw new ApiError(status.UNAUTHORIZED, 'you are Unauthorized User!');
    const options ={
        page : Number(req.query.page) || 1,
        limit : Number(req.query.limit) || 10
    }
    const referals = await getAllReferalsService(options);
    return res.status(status.OK).json(response({ status: 'Success', statusCode: status.CREATED, type: 'referals', message: 'referals-added', data: referals }));
});

module.exports = { getAllReferals };