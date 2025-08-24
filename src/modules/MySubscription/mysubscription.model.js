const mongoose = require("mongoose");

const mySubscriptionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
    planName: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    searchLimit: { type: Number, required: true },
    planDuration: { type: Number, required: true },
    planSearchLimit: { type: Number, required: true },
    purchasedSearchLimit: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    stripeSubscriptionId: { type: String }
}, { timestamps: true });


// Inside your schema file
mySubscriptionSchema.pre(['find', 'findOne'], function (next) {
    const now = new Date();
    this.where({ $or: [{ expiryDate: { $gt: now } }, { isActive: false }] });
    next();
});


module.exports = mongoose.model('MySubscription', mySubscriptionSchema);