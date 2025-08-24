const requestFeatureModel = require("./requestFeature.model");

const addFeatureRequest = async (data) => {
    return await requestFeatureModel.create(data);
}

const getFeatureRequest = async (options) => {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const totalResults = await requestFeatureModel.countDocuments();
    const totalPages = Math.ceil(totalResults / limit);
    const requestFeature = await requestFeatureModel.find().skip((page - 1) * limit).limit(limit).populate('user', 'fullName image email');
    return { requestFeature, pagination: { page, limit, totalPages, totalResults } };
}

module.exports = { addFeatureRequest, getFeatureRequest }