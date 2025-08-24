const express = require("express");
const { localAuth, signUp, validateEmail, forgetPassword, verifyForgetPasswordOTP, resetPassword, changePassword, resendOTP, googleLogin } = require("./auth.controller");
const { isValidUser, tokenCheck } = require("../../middlewares/auth");
const router = express.Router();
const passport = require('passport')
require('../../middlewares/googleAuth')



router.post("/local", localAuth);
router.post("/sign-up", signUp);
router.post("/resend-otp", resendOTP);
router.post("/verify-email", tokenCheck, validateEmail);
router.post("/forget-password", forgetPassword);
router.post("/verify-otp", verifyForgetPasswordOTP);
router.post("/reset-password", resetPassword);
router.patch("/change-password", isValidUser, changePassword);



//for app
router.get('/googleSignin', (req, res) => {
  
});
//app end

//google login
function isLoggedIn(req, res, next) {
    if (req.user) {
        // console.log("isLoggedIn:: ",req.user);
        next();
    } else {
        res.sendStatus(401);
    }
}

router.get('/googlelogin', (req, res) => {
    res.send('<a href="/api/v1/auth/google">Authenticate with Google</a>');
});

router.get('/google',
  passport.authenticate('google', { scope: ['email', 'profile'] }
));

router.get('/google/callback',
  passport.authenticate('google', { 
    successRedirect: process.env.SUCCESS_URL_WEB,
    failureRedirect: process.env.FAILURE_URL_WEB 
})),

router.get('/protected',isLoggedIn, googleLogin);

router.get('/failure', (req, res) => {
  res.send('Failed to authenticate..');
});

module.exports = router;

