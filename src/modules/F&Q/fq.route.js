const express = require('express');
const { addFQ, getFQ } = require('./fq.controller');
const { isValidUser } = require('../../middlewares/auth');
const activityTracker = require('../../helpers/activityTracker');
const router = express.Router();

router.post('/',isValidUser, addFQ);
router.get('/',activityTracker, getFQ);

module.exports = router;