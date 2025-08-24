const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    zpId: { type: String, required: true },
    formattedAddress: { type: String, required: true },
    propertyType: { type: String, required: true },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    squareFootage: { type: Number, required: true },
    rent: { type: Number, required: true },
    longitude: {type: Number, required: true},
    latitude: {type: Number, required: true},
    propertyImageUrl: [{ type: String, required: true }],
    valuePrice: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Favourite', favouriteSchema);