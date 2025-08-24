const express = require('express');
const { seeMostVisitedPage, seeActiveUsers } = require('./activity.contrroller');
const router = express.Router();

router.get('/mostVisitedPage', seeMostVisitedPage);
router.get('/active-users', seeActiveUsers);

module.exports = router;