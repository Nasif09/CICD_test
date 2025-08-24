const catchAsync = require("../../helpers/catchAsync");
const { addFeedback, getFeedback } = require("./feedback.service");
const response = require("../../helpers/response");
const { default: status } = require("http-status");


const addFeedbackController = catchAsync(async (req, res) => {
    req.body.user = req.User._id;
    const feedback = await addFeedback(req.body);
    return res.status(status.CREATED).json(response({ status: "success", statusCode: status.CREATED, type: "feedback", message: "feedback added successfully", data: feedback }));
});

const getFeedbackController = catchAsync(async (req, res) => {
    const options = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10
    }
    const feedback = await getFeedback(options);
    return res.status(status.OK).json(response({ status: "success", statusCode: status.OK, type: "feedback", message: "feedback fetched successfully", data: feedback }));
});

module.exports = { addFeedbackController, getFeedbackController };