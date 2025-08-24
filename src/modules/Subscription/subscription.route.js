const express = require('express');
const { updatePlan, allPlans, subsCount, deletePlan } = require('./subscription.controller');
const activityTracker = require('../../helpers/activityTracker');
const router = express.Router();

router.post('/', updatePlan);
router.get('/',activityTracker, allPlans);
router.delete('/:id', deletePlan);

module.exports = router;