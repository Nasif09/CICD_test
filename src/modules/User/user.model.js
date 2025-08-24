const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const generateReferralCode = require('../../helpers/referalCode');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: false, trim: true },
  email: { type: String, required: false, trim: true },
  image: { type: String, required: false, default: '/uploads/users/user.jpg' },
  password: { type: String, required: false, select: 0, set: (v) => bcrypt.hashSync(v, bcrypt.genSaltSync(10)), },
  phoneNumber: { type: String, required: false },
  address: { type: String, required: false },
  isAppUser: { type: Boolean, required: false },
  isComplete: { type: Boolean, default: false },
  isBan: { type: Boolean, default: false },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  // propertySearchCount: { type: Number, default: 0 },
  favoritePropertiesCount: { type: Number, default: 0 },

  subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
  stripeSubscriptionId : { type: String },
  yourRefaralCode: { type: String, unique: true },
  referredBy: { type: String, required: false },
},
  {
    timestamps: true
  }
);

// Generate referral code before saving
userSchema.pre('save', async function (next) {
  if (!this.yourRefaralCode) {
    let code;
    let exists = true;

    // Ensure uniqueness
    while (exists) {
      code = generateReferralCode();
      exists = await mongoose.models.User.exists({ yourRefaralCode: code });
    }
    this.yourRefaralCode = code;
  }
  next();
});


module.exports = mongoose.model('User', userSchema);