const axios = require('axios');
const catchAsync = require('../../helpers/catchAsync');
const response = require('../../helpers/response');
const { propertyService, addPropertyService, getAllpropertyService } = require('./property.service');
const { searchFavouriteByFilters } = require('../Favourite/favourite.service');


const propertyController = catchAsync(async (req, res) => {
    const filters = { zpId: req.params.zpId }
    if (req.query.bathrooms) filters.bathrooms = req.query.bathrooms
    if (req.query.bedrooms) filters.bedrooms = req.query.bedrooms
    const property = await propertyService(filters);
    const result = await searchFavouriteByFilters({ user: req.User._id, zpId: req.params.zpId });
    const isFavourite = result.length > 0;
    if (property) return res.status(200).json(response({ status: 'Success', statusCode: 200, type: 'property', message: 'property-found', data: { property, isFavourite } }));
    else return res.status(404).json(response({ status: 'Error', statusCode: 404, type: 'property', message: 'property not in DB', data: null }));
});


const allPropertyController = catchAsync(async (req, res) => {
    const options = {
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10
    }
    let filters = {};
    const search = req.query.search;
    if (search && search !== 'null' && search !== '' && search !== undefined) {
        const searchRegExp = new RegExp('.*' + search + '.*', 'i');
        filters.$or = [
            { formattedAddress: { $regex: searchRegExp } },
            { propertyType: { $regex: searchRegExp } }
        ];
    }
    const property = await getAllpropertyService(filters, options);
    return res.status(200).json(response({ status: 'Success', statusCode: 200, type: 'property', message: 'property-found', data: property }));
});


const addPropertyController = catchAsync(async (req, res) => {
    const property = await addPropertyService(req.body);
    return res.status(200).json(response({ status: 'Success', statusCode: 200, type: 'property', message: 'property-added', data: property }));
});

module.exports = { propertyController, addPropertyController, allPropertyController };
