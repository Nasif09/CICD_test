
const { default: status } = require("http-status");
const catchAsync = require("../../helpers/catchAsync");
const response = require("../../helpers/response");
const { addFeatureRequest, getFeatureRequest } = require("./requestFeature.service");


const addFeatureRequestController = catchAsync(async (req, res) => {
    req.body.user = req.User._id;
    const newRequest = await addFeatureRequest(req.body);
    return res.status(status.CREATED).json(response({ status: 'Success', statusCode: status.CREATED, type: 'requestFeature', message: 'requestFeature added successfully', data: newRequest }));
}
)


const getFeatureRequestController = catchAsync(async (req, res) => {
    const options = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10
    }
    const requestFeature = await getFeatureRequest(options);
    return res.status(status.OK).json(response({ status: 'Success', statusCode: status.OK, type: 'requestFeature', message: 'requestFeature fetched successfully', data: requestFeature }));
});


module.exports = { addFeatureRequestController, getFeatureRequestController };