const { searchProperty } = require("../SystemStats/systemStats.service");
const PropertyDetails = require("./property.model");

const propertyService = async (filter) => {
    console.log({filter})
    const property = await PropertyDetails.findOne(filter);
    await searchProperty();
    if(property) {
        return property;
    }else{
        return null;
    }
}


const getAllpropertyService = async (filters, options) => {
    const { page=1, limit=10 } = options;
    const skip = (page - 1) * limit;
    const totalResults = await PropertyDetails.countDocuments(filters);
    const totalPages = Math.ceil(totalResults / limit);
    const property = await PropertyDetails.find(filters).skip(skip).limit(limit);
    return { property, pagination: { page, limit, totalPages, totalResults } };
}


const addPropertyService = async (data) => {
    const property = await PropertyDetails.create(data);
    return property;
}


module.exports = { propertyService, addPropertyService, getAllpropertyService };