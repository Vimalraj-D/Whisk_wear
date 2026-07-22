const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const analyticsController = require('../controllers/analyticsController');

router.get('/revenue', adminAuth, analyticsController.getRevenue);
router.get('/orders', adminAuth, analyticsController.getOrderStats);
router.get('/top-products', adminAuth, analyticsController.getTopProducts);

module.exports = router;
