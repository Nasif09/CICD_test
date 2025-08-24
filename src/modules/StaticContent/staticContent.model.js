const mongoose = require('mongoose');

const staticContentSchema = new mongoose.Schema({
  type: { type: String, enum: ['privacy-policy', 'terms-of-condition', 'support', 'about-us'], default: 'privacy-policy' },
  content: { type: String, required: true },
});

module.exports = mongoose.model('StaticContent', staticContentSchema);