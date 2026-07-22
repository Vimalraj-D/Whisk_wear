const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const userAuth = require('../middleware/userAuth');
const optionalUserAuth = require('../middleware/optionalUserAuth');
const orderController = require('../controllers/orderController');
const { orderValidation } = require('../middleware/validation');

router.post('/', optionalUserAuth, orderValidation.create, orderController.createOrder);
router.get('/my-orders', userAuth, orderController.getMyOrders);
router.get('/', adminAuth, orderController.getAllOrders);
router.put('/:id', adminAuth, orderValidation.updateStatus, orderController.updateOrderStatus);
router.post('/create-order', orderController.createRazorpayOrder);
router.post('/verify-payment', optionalUserAuth, orderController.verifyPayment);
router.post('/cancel-order', optionalUserAuth, orderController.cancelOrder);
router.post('/cod-order', optionalUserAuth, orderValidation.create, orderController.createCodOrder);

module.exports = router;
