const mongoose = require('mongoose');

const refStatusSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: 'global-settings', // Fixed ID for single document
    },
    referralSystemEnabled: {
        type: Boolean,
        default: true,
    },
})

module.exports = mongoose.model('RefStatus', refStatusSchema);