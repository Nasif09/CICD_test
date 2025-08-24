const mongoose = require("mongoose");

const systemStatsSchema = new mongoose.Schema({
  propertySearchCount: { type: Number, default: 0 }
});

module.exports = mongoose.model("SystemStats", systemStatsSchema);
