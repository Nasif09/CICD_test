const express = require('express');
const { toggleController, checkToggleStatus } = require('./refStatus.controller');
const router = express.Router();

router.patch('/toggle-status', toggleController);
router.get('/toggle-status-check', checkToggleStatus )

module.exports = router