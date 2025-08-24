const express = require('express');
const { upgradeStaticContent, getAllStaticContent } = require('./staticContent.controller');
const router = express.Router();
const { isValidUser } = require('../../middlewares/auth');
const activityTracker = require('../../helpers/activityTracker');

router.post('/',  isValidUser, upgradeStaticContent);
router.get('/',isValidUser,activityTracker, getAllStaticContent);

module.exports = router;