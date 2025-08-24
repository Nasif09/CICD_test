const { status } = require("http-status");
const { addFQService, allFQ } = require("./fq.service");
const response = require("../../helpers/response");

const addFQ = async (req, res) => {
    if (req.User.role !== 'admin') throw new ApiError(status.UNAUTHORIZED, 'you are Unauthorized User!');
    const newFQ = await addFQService(req.body);
    return res.status(status.CREATED).json(response({ status: status.CREATED, statusCode: status.CREATED, type: "F&Q", message: "F&Q added successfully", data: newFQ, }));

}


const getFQ = async (req, res) => {
    const FQ = await allFQ();
    return res.status(status.OK).json(response({ status: status.OK, statusCode: status.OK, type: "F&Q", message: "F&Q fetched successfully", data: FQ, }));
}

module.exports = { addFQ, getFQ }