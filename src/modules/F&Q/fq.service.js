const fqModel = require("./fq.model");

const addFQService = async (data) => {
    return await fqModel.insertMany(data);
}

const allFQ = async () => {
    return await fqModel.find({}).exec();
}

module.exports = { addFQService, allFQ }