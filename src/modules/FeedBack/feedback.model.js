const mongoose = require("mongoose");
const { platform } = require("os-utils");
 const feedbackSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    platform: { type: String, enum: ['application', 'website'], required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true }
 },
 { timestamps: true }
 );

 module.exports = mongoose.model('Feedback', feedbackSchema);