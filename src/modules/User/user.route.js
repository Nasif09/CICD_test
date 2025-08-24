const express = require('express');
const { userDetails, updateProfile, allUsers, userRatio, deleteUserAccount, userDetailsByID, banUserController, unbanUserController, seeOwnReferalCode, countController } = require('./user.controller');
const router = express.Router();
const userFileUploadMiddleware = require("../../middlewares/fileUpload");
const UPLOADS_FOLDER_USERS = "./public/uploads/users";
const uploadUsers = userFileUploadMiddleware(UPLOADS_FOLDER_USERS);
const { isValidUser } = require('../../middlewares/auth')
const convertHeicToPng = require('../../middlewares/converter');
const ensureUploadFolderExists = require('../../helpers/fileExists');
ensureUploadFolderExists(UPLOADS_FOLDER_USERS);



router.get('/user-details', isValidUser, userDetails);
router.get('/', isValidUser, allUsers);
router.get('/user-ratio', isValidUser, userRatio);
router.get('/see-referal-code', isValidUser, seeOwnReferalCode);
router.put('/', uploadUsers.single('profileImage'), convertHeicToPng(UPLOADS_FOLDER_USERS), isValidUser, updateProfile);
router.delete("/delete-own-account", isValidUser, deleteUserAccount);
router.put("/ban/:userId", isValidUser, banUserController);
router.put("/unban/:userId", isValidUser, unbanUserController);
router.get('/counts',isValidUser, countController);
router.get('/userbyid/:id', isValidUser, userDetailsByID);



module.exports = router;  