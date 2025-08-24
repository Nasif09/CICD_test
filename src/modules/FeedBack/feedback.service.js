const Feedback = require("./feedback.model");

const addFeedback = async (feedbackBody) => {
    return await Feedback.create(feedbackBody);
};

const getFeedback = async (options) => {
    const { page =1 , limit = 10 } = options;
    const totalResults = await Feedback.countDocuments();
    const totalPages = Math.ceil(totalResults / limit);
    const feedback = await Feedback.find().skip((page - 1) * limit).limit(limit).populate('user', 'fullName email phoneNumber createdAt');
    return { feedback, pagination: { page, limit, totalPages, totalResults } };
}

module.exports = { addFeedback, getFeedback };