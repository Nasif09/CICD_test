const express = require('express');
const { isValidUser } = require('../../middlewares/auth');
const { addFeatureRequestController, getFeatureRequestController } = require('./requestFeature.controller');
const router = express.Router();

router.post('/', isValidUser, addFeatureRequestController);
router.get('/', isValidUser, getFeatureRequestController);

module.exports = router;