const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const userAuth = require('../middleware/userAuth');
const reviewController = require('../controllers/reviewController');
const { reviewValidation } = require('../middleware/validation');

router.get('/:product_id', reviewController.getReviews);
router.post('/', userAuth, reviewValidation.create, reviewController.createReview);
router.get('/admin/all', adminAuth, reviewController.getAllReviews);
router.put('/:id', adminAuth, reviewValidation.update, reviewController.updateReview);
router.delete('/:id', adminAuth, reviewController.deleteReview);

module.exports = router;
