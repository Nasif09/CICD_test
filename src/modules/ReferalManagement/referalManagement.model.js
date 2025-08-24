const mongoose = require('mongoose');

const referalManagementSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    referalCode: { type: String, required: true },
    count: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('ReferalManagement', referalManagementSchema);