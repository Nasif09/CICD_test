const { default: status } = require("http-status");
const { searchFavouriteByFilters, addFavouriteService, unFavouriteService, updateDataService } = require("./favourite.service");
const catchAsync = require("../../helpers/catchAsync");
const response = require("../../helpers/response");
const { default: mongoose } = require("mongoose");

const addFavourite = catchAsync(async (req, res) => {
  req.body.user = req.User._id;
  const favouritePropertyExists = await searchFavouriteByFilters({ zpId: req.body.zpId, bedrooms: req.body.bedrooms, bathrooms: req.body.bathrooms, user: req.User._id });
  if (!favouritePropertyExists.length) {
    const newFavourite = await addFavouriteService(req.body);
    return res.status(status.CREATED).json(response({ status: 'Success', statusCode: status.CREATED, type: 'favourite', message: 'favourite-added', data: newFavourite }));
  } else {
    return res.status(status.OK).json(response({ status: 'Success', statusCode: status.OK, type: 'favourite', message: 'this already exists in your favourite' }));
  }
});


const updateDataController = catchAsync(async (req, res) => {
  const data = { user: req.User._id, zpId: req.body.zpId, bedrooms: req.body.bedrooms, bathrooms: req.body.bathrooms};

  setTimeout(() => {
    updateDataService(data).then(updated => {
      console.log('Favourite updated after delay:', updated);
    }).catch(err => {
      console.error('Error updating favourite after delay:', err);
    });
  },500);

  return res.status(status.OK).json(response({
    status: 'success',
    statusCode: status.OK,
    type: 'favourite',
    message: 'Update scheduled after delay',
  }));
});


const unFavourite = catchAsync(async (req, res) => {
  const unfav = await unFavouriteService({ user: req.User._id, zpId: req.params.zpId, bedrooms: req.params.bedrooms, bathrooms: req.params.bathrooms });
  return res.status(status.OK).json(response({ status: 'Success', statusCode: status.OK, type: 'favourite', message: 'property marked as unfavourite', data: unfav }))
})

const myFavourite = catchAsync(async (req, res) => {
  let filters = {
    user: new mongoose.Types.ObjectId(String(req.User._id))
  };

  const search = req.query.search;
  if (search && search.trim()) {
    const searchRegExp = new RegExp(search.trim(), 'i');
    filters.zpId = { $regex: searchRegExp };
  }
  const favourites = await searchFavouriteByFilters(filters);

  return res.status(status.OK).json(response({
    status: 'Success',
    statusCode: status.OK,
    type: 'favourite',
    message: 'favourite-found',
    data: favourites
  }));
});


module.exports = { addFavourite, myFavourite, unFavourite, updateDataController };