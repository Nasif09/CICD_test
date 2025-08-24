
const response = require("../../helpers/response");
const catchAsync = require("../../helpers/catchAsync");
const RefStatus = require('./refStatus.model');
const { default: status } = require("http-status");

const toggleController = catchAsync(async (req, res) => {
    const refStatus = await RefStatus.findOne();
    let settings;
    if (refStatus) {
        settings = await RefStatus.findByIdAndUpdate(
            'global-settings',
            { referralSystemEnabled: !refStatus.referralSystemEnabled },
            { new: true }
        );
    }else{
        settings = new RefStatus({
            _id: 'global-settings',
            referralSystemEnabled: true
        });
        await settings.save();
    }
    return res.status(status.OK).json(response({ status: 'Success', statusCode: status.OK, type: 'refStatus', message: 'refStatus updated', data: settings }));
})

const checkToggleStatus = catchAsync(async (req, res) => {
    const refStatus = await RefStatus.findOne();
    if(refStatus.referralSystemEnabled === true) return res.status(status.OK).json(response({ status: true, statusCode: status.OK, type: 'refStatus', message: 'refStatus enabled', data: "true" }));
    return res.status(status.OK).json(response({ status: false, statusCode: status.OK, type: 'refStatus', message: 'refStatus disabled', data: "false" }));
})

module.exports = {
    toggleController,
    checkToggleStatus
}