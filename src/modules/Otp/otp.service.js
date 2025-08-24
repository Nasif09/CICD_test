const OTP = require('./otp.model');
const { emailWithNodemailer } = require('../../helpers/email');
const ApiError = require('../../helpers/ApiError');
const httpStatus = require('http-status');

const sendOTP = async (name, sentTo, receiverType, purpose) => {
  const generateOTP = (length = 6) => {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // usage:
  const otp = generateOTP(6); // or 4, 5, etc.
  const subject = purpose === 'email-verification' ? 'Email verification code' : 'Forgot password code';
  if (receiverType === 'email') {
    const emailData = {
      email: sentTo,
      subject: subject,
      html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
          <h2 style="color: #4A90E2;">Hello, ${name}</h2>
          <p>Thank you for choosing <strong>Havn App</strong>! Please use the following code to verify your account:</p>
          <p style="font-size: 1.5em; font-weight: bold; color: #4A90E2;">${otp}</p>
          <p>This code is valid for <strong>${process.env.OTP_EXPIRY_TIME} minutes</strong>.</p>
          <p style="color: #999; font-size: 0.9em;">If you didn't request this code, please ignore this email.</p>
      </div>`
    }
    await emailWithNodemailer(emailData);
  }

  const otpExpiryTime = parseInt(process.env.OTP_EXPIRY_TIME) || 3;
  const expiredAt = new Date();
  expiredAt.setMinutes(expiredAt.getMinutes() + otpExpiryTime);

  const newOTP = new OTP({
    sentTo,
    receiverType,
    purpose,
    otp,
    expiredAt,
  });
  const savedOtp = await newOTP.save();

  // Schedule deletion of OTP after 3 minutes
  setTimeout(async () => {
    try {
      await OTP.findByIdAndDelete(savedOtp._id);
      console.log('OTP deleted successfully after expiry.');
    } catch (error) {
      console.error('Error deleting OTP after expiry:', error);
    }
  }, 180000);

  return true;
}

const checkOTPByEmail = async (sentTo) => {
  return await OTP.findOne({ sentTo: sentTo, status: 'pending', expiredAt: { $gt: new Date() } })
}

const verifyOTP = async (sentTo, receiverType, purpose, otp) => {
  console.log({otp})
  const otpData = await OTP.findOne({ sentTo, receiverType, purpose, otp, expiredAt: { $gt: new Date() }, status: { $eq: "pending" } })
  if (!otpData) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid OTP');
  }
  otpData.status = 'expired';
  otpData.verifiedAt = new Date();
  await otpData.save();
  return otpData;
}

const checkOTPValidity = (sentTo) => {
  return OTP.findOne({ sentTo: sentTo, expiredAt: { $gt: new Date() }, status: 'verified' })
}

const updateOTP = async (otpId, otpBody) => {
  const otpData = await OTP.findById(otpId);
  if (!otpData) {
    return false;
  }
  Object.assign(otpData, otpBody);
  await otpData.save();
  return true;
}

const deleteOTP = async (otpId) => {
  return await OTP.findByIdAndDelete(otpId);
}

module.exports = {
  sendOTP,
  checkOTPByEmail,
  verifyOTP,
  checkOTPValidity,
  updateOTP,
  deleteOTP
}