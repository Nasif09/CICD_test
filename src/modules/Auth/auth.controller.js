// const passport = require("passport");
const { tokenGenerator } = require("../../helpers/tokenGenerator");
const catchAsync = require("../../helpers/catchAsync");
const response = require("../../helpers/response");
const { addUser, login, getUserByEmail } = require("./auth.service");
const { sendOTP, verifyOTP, deleteOTP, checkOTPByEmail } = require("../Otp/otp.service");
const { addToken, verifyToken, deleteToken } = require("../Token/token.service");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { default: status } = require("http-status");
const { CLOSING } = require("ws");


const localAuth = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(status.BAD_REQUEST).json(response({ statusCode: status.OK, message: "login-credentials-required", status: "OK", }));
  }
  const user = await login(email, password, "signIn");
  if (user) {
    const token = await tokenGenerator(user);
    return res.status(status.OK).json(response({ statusCode: status.OK, message: "login-success", status: "OK", type: "user", data: user, accessToken: token, }));
  }
  return res.status(status.NOT_FOUND).json(response({ statusCode: status.BAD_REQUEST, message: "login-failed", status: "OK" }));
});



//google login
const googleLogin = catchAsync(async (req, res) => {
  const user = await getUserByEmail(req.user.email);
  if (!user) {
    let userData = {
      email: req.user.email,
      fullName: `${req.user.name.givenName} ${req.user.name.familyName}`,
      image: req.user.picture,
    }
    // Include phoneNumber only if it exists
    if (req.user?.phoneNumber) {
      userData.phoneNumber = req.user.phoneNumber;
    }
    const user = await addUser(userData);
    const token = await tokenGenerator(user);
    return res.status(status.OK).json(response({ statusCode: status.OK, message: "login-success", status: "OK", type: "user", data: user, accessToken: token, }));
  } else {
    const token = await tokenGenerator(user);
    return res.status(status.OK).json(response({ statusCode: status.OK, message: "login-success", status: "OK", type: "user", data: user, accessToken: token, }));
  }
});


//Sign up
const signUp = catchAsync(async (req, res) => {
  // console.log(req.body)
  var otpPurpose = "email-verification";
  var { fullName, email, password, role,isAppUser  } = req.body;

  const existingUser = await getUserByEmail(email);
  if (existingUser) return res.status(status.CONFLICT).json(response({ status: "Error", statusCode: status.CONFLICT, type: "user", message: "email-already-registered" }));

  const existingOTP = await checkOTPByEmail(email);
  var message = "otp-sent";
  if (existingOTP) {
    message = "otp-exists";
  } else {
    const otpData = await sendOTP(fullName, email, "email", otpPurpose);
    if (otpData) {
      message = "otp-sent";
    }
  }

  const signUpData = { fullName, email, password, role,isAppUser };
  const signUpToken = jwt.sign(signUpData, process.env.JWT_ACCESS_TOKEN, { expiresIn: "1h" });
  return res.status(status.CREATED).json(response({ status: "OK", statusCode: status.CREATED, type: "user", message: message, signUpToken: signUpToken }));
});


// Validate email
const validateEmail = catchAsync(async (req, res) => {
  const otpData = await verifyOTP(req.User?.email, "email", req.body.purpose, req.body.otp);
  console.log(req.User)
  const registeredUser = await addUser(req.User);
  const accessToken = await tokenGenerator(registeredUser);
  await deleteOTP(otpData._id);
  return res.status(status.CREATED).json(response({ status: "OK", statusCode: status.CREATED, type: "user", message: "user-verified", data: registeredUser, accessToken: accessToken, }));
});


// Forget password
const forgetPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(status.NOT_FOUND).json(response({ status: "Error", statusCode: "status.NOT_FOUND", type: "user", message: "user-not-exists" }));
  }
  const otpData = await sendOTP(user.fullName, email, "email", "forget-password");
  if (otpData) {
    return res.status(status.OK).json(response({ status: "OK", statusCode: status.OK, type: "user", message: "otp sent for forget password" }));
  }
  return res.status(status.BAD_REQUEST).json(response({ status: "Error", statusCode: status.BAD_REQUEST, type: "user", message: "forget password otp sent faild", })
  );
});


// Verify forget password OTP
const verifyForgetPasswordOTP = catchAsync(async (req, res) => {
  const { otp, email, purpose } = req.body;
  console.log({ otp, email, purpose })
  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(status.NOT_FOUND).json(response({ status: "Error", statusCode: "status.NOT_FOUND", type: "user", message: "user-not-exists" }));
  }
  const otpVerified = await verifyOTP(email, "email", purpose, otp);
  if (!otpVerified) {
    return res.status(status.BAD_REQUEST).json(response({ status: "Error", statusCode: status.BAD_REQUEST, type: "user", message: "invalid-otp" }));
  }
  const token = crypto.randomBytes(32).toString("hex");
  const data = { token: token, userId: user._id, purpose: "forget-password" };
  await addToken(data);
  return res.status(status.OK).json(response({ status: "OK", statusCode: status.OK, type: "user", message: "otp-verified", forgetPasswordToken: token, }));
});

const resetPassword = catchAsync(async (req, res) => {
  var forgetPasswordToken;
  if (
    req.headers["forget-password"] &&
    req.headers["forget-password"].startsWith("Forget-password ")
  ) {
    forgetPasswordToken = req.headers["forget-password"].split(" ")[1];
  }
  if (!forgetPasswordToken) {
    return res.status(401).json(response({ status: "Error", statusCode: status.BAD_REQUEST, type: "user", message: "unauthorised" }));
  }

  const tokenData = await verifyToken(forgetPasswordToken, "forget-password");
  if (!tokenData) {
    return res.status(status.BAD_REQUEST).json(response({ status: "Error", statusCode: status.BAD_REQUEST, type: "user", message: "invalid-token" }));
  }
  const { email, password } = req.body;
  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(status.NOT_FOUND).json(response({ status: "Error", statusCode: status.NOT_FOUND, type: "user", message: "user-not-exists" }));
  }
  user.password = password;
  await user.save();
  await deleteToken(tokenData._id);
  return res.status(status.OK).json(response({ status: "OK", statusCode: status.OK, type: "user", message: "password-reset-success", })
  );
});

const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const verifyUser = await login(req.User.email, oldPassword, "changePass");
  if (!verifyUser) {
    return res.status(status.BAD_REQUEST).json(response({ status: "Error", statusCode: status.BAD_REQUEST, type: "user", message: "password-invalid" }));
  }
  verifyUser.password = newPassword;
  await verifyUser.save();
  return res.status(status.OK).json(response({ status: "OK", statusCode: status.OK, type: "user", message: "password-changed", data: verifyUser })
  );
});

const resendOTP = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = await getUserByEmail(email);
  // if (!user) {
  //   return res.status(status.NOT_FOUND).json(
  //     response({
  //       status: "Error",
  //       statusCode: status.NOT_FOUND,
  //       type: "user",
  //       message: "user-not-exists",
  //     })
  //   );
  // }
  const fullName = user?.fullName || "User"; 
  const otpData = await sendOTP(fullName, email, "email", "resend-otp");
  if (otpData) {
    return res.status(status.OK).json(
      response({
        status: "OK",
        statusCode: status.OK,
        type: "user",
        message: "otp sent again to your email",
      })
    );
  }
});

module.exports = {
  localAuth,
  googleLogin,
  signUp,
  validateEmail,
  forgetPassword,
  verifyForgetPasswordOTP,
  resetPassword,
  changePassword,
  resendOTP
};
