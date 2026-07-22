const { body, param, validationResult } = require('express-validator');

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
}

const authValidation = {
  adminLogin: [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidation,
  ],
  initiateSignup: [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name too long'),
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    handleValidation,
  ],
  verifyOtp: [
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('code').trim().notEmpty().withMessage('Code is required').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits'),
    handleValidation,
  ],
  completeRegistration: [
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters').isLength({ max: 128 }).withMessage('Password too long'),
    handleValidation,
  ],
  resendCode: [
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    handleValidation,
  ],
  login: [
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidation,
  ],
  forgotPassword: [
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    handleValidation,
  ],
  resetPassword: [
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('code').trim().notEmpty().withMessage('Code is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters').isLength({ max: 128 }).withMessage('Password too long'),
    handleValidation,
  ],
  updateProfile: [
    param('userId').notEmpty().withMessage('User ID is required'),
    body('name').optional().trim().isLength({ max: 100 }).withMessage('Name too long'),
    handleValidation,
  ],
};

const productValidation = {
  create: [
    body('name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 200 }).withMessage('Name too long'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be non-negative'),
    body('discount_percent').optional().isInt({ min: 0, max: 100 }).withMessage('Discount must be 0-100'),
    handleValidation,
  ],
  update: [
    param('id').notEmpty().withMessage('Product ID is required'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Valid price is required'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be non-negative'),
    body('discount_percent').optional().isInt({ min: 0, max: 100 }).withMessage('Discount must be 0-100'),
    handleValidation,
  ],
};

const orderValidation = {
  create: [
    body('customer_name').trim().notEmpty().withMessage('Customer name is required'),
    body('customer_email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('customer_address').trim().notEmpty().withMessage('Address is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    body('items.*.product_id').notEmpty().withMessage('Product ID is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    handleValidation,
  ],
  updateStatus: [
    param('id').notEmpty().withMessage('Order ID is required'),
    body('status').trim().notEmpty().withMessage('Status is required'),
    handleValidation,
  ],
};

const reviewValidation = {
  create: [
    body('product_id').notEmpty().withMessage('Product ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    body('comment').optional().trim().isLength({ max: 1000 }).withMessage('Comment too long'),
    handleValidation,
  ],
  update: [
    param('id').notEmpty().withMessage('Review ID is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5'),
    handleValidation,
  ],
};

const categoryValidation = {
  create: [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name too long'),
    handleValidation,
  ],
  update: [
    param('id').notEmpty().withMessage('Category ID is required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    handleValidation,
  ],
};

const subscriberValidation = {
  subscribe: [
    body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    handleValidation,
  ],
  campaign: [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('content').trim().notEmpty().withMessage('Content is required'),
    handleValidation,
  ],
};

module.exports = {
  authValidation,
  productValidation,
  orderValidation,
  reviewValidation,
  categoryValidation,
  subscriberValidation,
};
