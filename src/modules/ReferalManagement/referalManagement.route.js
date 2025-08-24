const express = require('express');
const { getAllReferals } = require('./referalManagement.controller');
const { isValidUser } = require('../../middlewares/auth');
const router = express.Router();

router.get('/',isValidUser, getAllReferals);

module.exports = router;