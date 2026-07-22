const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const subscriberController = require('../controllers/subscriberController');
const { subscriberValidation } = require('../middleware/validation');

router.post('/subscribe', subscriberValidation.subscribe, subscriberController.subscribe);
router.post('/send-campaign', adminAuth, subscriberValidation.campaign, subscriberController.sendCampaign);

module.exports = router;
