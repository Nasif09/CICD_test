const mongoose = require("mongoose");

const MailingAddressSchema = new mongoose.Schema({
    id: String,
    formattedAddress: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    zipCode: String,
});

const OwnerSchema = new mongoose.Schema({
    names: [String],
    type: String,
    mailingAddress: MailingAddressSchema,
});

const PropertyHistorySchema = new mongoose.Schema({
    event: String,
    date: String,
    price: Number,
});

const PropertyTaxSchema = new mongoose.Schema({
    year: Number,
    total: Number,
});

const TaxAssessmentSchema = new mongoose.Schema({
    year: Number,
    value: Number,
    land: Number,
    improvements: Number,
});

const FeaturesSchema = new mongoose.Schema({
    architectureType: String,
    cooling: Boolean,
    coolingType: String,
    exteriorType: String,
    fireplace: Boolean,
    fireplaceType: String,
    floorCount: Number,
    foundationType: String,
    garage: Boolean,
    garageSpaces: Number,
    garageType: String,
    heating: Boolean,
    heatingType: String,
    pool: Boolean,
    poolType: String,
    roofType: String,
    roomCount: Number,
    unitCount: Number,
    viewType: String,
});

const HOASchema = new mongoose.Schema({
    fee: { type: Number, default: 0 },
});

const PropertyRecordsSchema = new mongoose.Schema({
    id: String,
    formattedAddress: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    zipCode: String,
    county: String,
    latitude: Number,
    longitude: Number,
    propertyType: String,
    bedrooms: Number,
    bathrooms: Number,
    squareFootage: Number,
    lotSize: Number,
    yearBuilt: Number,
    assessorID: String,
    legalDescription: String,
    subdivision: String,
    zoning: String,
    lastSaleDate: String,
    lastSalePrice: Number,
    hoa: HOASchema,
    features: FeaturesSchema,
    taxAssessments: { type: Map, of: TaxAssessmentSchema },
    propertyTaxes: { type: Map, of: PropertyTaxSchema },
    history: { type: Map, of: PropertyHistorySchema },
    owner: OwnerSchema,
    ownerOccupied: Boolean,
});

const ComparablePropertySchema = new mongoose.Schema({
    id: String,
    formattedAddress: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    state: String,
    zipCode: String,
    county: String,
    latitude: Number,
    longitude: Number,
    propertyType: String,
    bedrooms: Number,
    bathrooms: Number,
    squareFootage: Number,
    lotSize: Number,
    yearBuilt: Number,
    price: Number,
    listingType: String,
    listedDate: String,
    removedDate: String,
    lastSeenDate: String,
    daysOnMarket: Number,
    distance: Number,
    daysOld: Number,
    correlation: Number,
    propertyImageUrl: String,
    valuePrice: Number,
});

const RentPriceOverTimeSchema = new mongoose.Schema({
    month: String,
    year: String,
    price: Number,
});

const YearlyDataSchema = new mongoose.Schema({
    year: Number,
    averageValue: Number,
});

const PropertyDetailsSchema = new mongoose.Schema({
    zpId: String,
    formattedAddress: String,
    latitude: Number,
    longitude: Number,
    propertyType: String,
    bedrooms: Number,
    bathrooms: Number,
    squareFootage: Number,
    rent: Number,
    rentRangeLow: Number,
    rentRangeHigh: Number,
    propertyImageUrl: [String],
    valuePrice: Number,
    comparableProperties: [ComparablePropertySchema],
    propertyRecords: PropertyRecordsSchema,
    rentalDataList: [RentPriceOverTimeSchema],
    yearlyDataList: [YearlyDataSchema],
    createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 30 
    // expires: 10
  }
});

module.exports = mongoose.model("PropertyDetails", PropertyDetailsSchema);
