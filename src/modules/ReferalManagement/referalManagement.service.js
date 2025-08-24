const ReferalManagement = require('./referalManagement.model');

const addReferalManagement = async (data) => {
    const ref = await getReferalManagementByFilter({ referalCode : data.referalCode});
    if (ref) {
        ref.count += 1; 
        return await ref.save();
    } else {
        const newReferal = new ReferalManagement(data);
        return await newReferal.save();
    }
}

const getReferalManagementByFilter = async (filter) => {
    return await ReferalManagement.findOne(filter);
}


const getAllReferalsService = async (options) => {
    const { page=1, limit=10 } = options;
    const skip = (page - 1) * limit;
    const totalResults = await ReferalManagement.countDocuments();
    const totalPages = Math.ceil(totalResults / limit);
    const referal = await ReferalManagement.find().skip(skip).limit(limit).populate('user', 'fullName email image').sort({ createdAt: -1 });
    return { referal, pagination: { page, limit, totalPages, totalResults } };
}


module.exports = {
    addReferalManagement,
    getReferalManagementByFilter,
    getAllReferalsService
}