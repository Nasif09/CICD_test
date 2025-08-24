const subscriptionModel = require("./subscription.model");

const updateSubscriptionPlan = async (data) => {
    const subscription = await subscriptionModel.findOne({ planName: data.planName });
    if (subscription) {
        Object.assign(subscription, data);
        return await subscription.save();
    } else {
        return await subscriptionModel.create(data);
    }
};

const getAllPlans = async () => {
    return await subscriptionModel.find();
}


const subscriptionByID = async (id) => {
    return await subscriptionModel.findById(id);
}

const deleteSubscriptionPlan = async (id) => {
    return await subscriptionModel.findByIdAndDelete(id);
}


module.exports = { updateSubscriptionPlan, getAllPlans, subscriptionByID , deleteSubscriptionPlan};
