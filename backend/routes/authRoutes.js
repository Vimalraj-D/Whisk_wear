const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userAuth = require('../middleware/userAuth');
const { authValidation } = require('../middleware/validation');

router.post('/admin/login', authValidation.adminLogin, authController.adminLogin);
router.post('/user/initiate', authValidation.initiateSignup, authController.initiateSignup);
router.post('/user/verify', authValidation.verifyOtp, authController.verifyOtp);
router.post('/user/complete', authValidation.completeRegistration, authController.completeRegistration);
router.post('/user/resend-code', authValidation.resendCode, authController.resendCode);
router.post('/user/login', authValidation.login, authController.login);
router.post('/user/forgot-password', authValidation.forgotPassword, authController.forgotPassword);
router.post('/user/reset-password', authValidation.resetPassword, authController.resetPassword);
router.get('/user/profile/:userId', userAuth, authController.getProfile);
router.put('/user/profile/:userId', userAuth, authValidation.updateProfile, authController.updateProfile);

module.exports = router;
