const generateReferralCode = () => {
  return Math.random().toString(36).substring(2, 14).toUpperCase();
};

module.exports = generateReferralCode;