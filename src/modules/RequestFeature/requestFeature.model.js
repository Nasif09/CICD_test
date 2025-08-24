const mongoose = require("mongoose");

const requestFeatureSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('RequestFeature', requestFeatureSchema);