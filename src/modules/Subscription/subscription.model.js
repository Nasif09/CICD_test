const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    planName: { type: String, required: true },
    monthlyPrice: { type: Number, required: true },
    yearlyPrice: { type: Number, required: true },
    stripeMonthlyPriceId: { type: String }, 
    stripeYearlyPriceId: { type: String },
    monthlySearchLimit: { type: Number, default: 0 },
    yearlySearchLimit: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    valueEstimate: { type: Boolean, default: false },
    rentEstimate: { type: Boolean, default: false },
    returnMetrics: { type: Boolean, default: false },
    comparableProperties: { type: Boolean, default: false },
    operatingExpences: { type: Boolean, default: false },
    rentalInsights: { type: Boolean, default: false },
    cashFlowAndEquityAccumulation: { type: Boolean, default: false },
    marketInsights: { type: Boolean, default: false },
    betaFeatureAccess: { type: Boolean, default: false },
    sell: { type: Number, default: 0 },
    isUnlimited: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);