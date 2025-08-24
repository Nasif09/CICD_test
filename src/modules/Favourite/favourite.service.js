const { propertyService } = require("../Property/property.service");
const favouriteModel = require("./favourite.model");

const searchFavouriteByFilters = async (filters) => {
    return await favouriteModel.find(filters);
}

const addFavouriteService = async (data) => {
    return await favouriteModel.create(data);
}

const updateDataService = async (data) => {
    const [favProperty] = await searchFavouriteByFilters(data);
    const searchdata = await propertyService({ zpId: data.zpId });
    favProperty.valuePrice = searchdata.valuePrice;
    favProperty.rent = searchdata.rent;
    favProperty.bathrooms = searchdata.bathrooms;
    favProperty.bedrooms = searchdata.bedrooms;
    favProperty.propertyType = searchdata.propertyType;
    //   favProperty.propertyImageUrl = searchdata.propertyImageUrl;
    // favProperty.propertyImageUrl = Array.isArray(searchdata.propertyImageUrl)
    //     ? searchdata.propertyImageUrl
    //     : [searchdata.propertyImageUrl];
    favProperty.squareFootage = searchdata.squareFootage;

    await favProperty.save();
    return favProperty;
};


const unFavouriteService = async (data) => {
    return await favouriteModel.deleteOne(data)
}


module.exports = {
    searchFavouriteByFilters,
    addFavouriteService,
    unFavouriteService,
    updateDataService
}