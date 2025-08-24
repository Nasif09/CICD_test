const RefStatus = require('./refStatus.model');

const toggleReferralStatusService = async (id) => {
    const ref = await RefStatus.findById(id);
    if(!ref) ref = new RefStatus(body);
    ref.status = !ref.status;
    return await ref.save();
}

module.exports = {
    toggleReferralStatusService
};