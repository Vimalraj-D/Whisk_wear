const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const { upload } = require('../middleware/upload');
const productController = require('../controllers/productController');
const { productValidation } = require('../middleware/validation');

router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
router.post('/', adminAuth, upload.array('images', 10), productValidation.create, productController.createProduct);
router.put('/:id', adminAuth, upload.array('images', 10), productValidation.update, productController.updateProduct);
router.delete('/:id', adminAuth, productController.deleteProduct);

module.exports = router;
