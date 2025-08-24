const systemStatsModel = require("./systemStats.model");


const searchProperty = async (req, res) => {
  return await systemStatsModel.updateOne({}, { $inc: { propertySearchCount: 1 } }, { upsert: true });
};

const searchCount = async(req,res) => {
    return await systemStatsModel.findOne();
}

module.exports = {
    searchProperty,
    searchCount
}