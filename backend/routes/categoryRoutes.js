const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const categoryController = require('../controllers/categoryController');
const { categoryValidation } = require('../middleware/validation');
const { upload } = require('../middleware/upload');

router.get('/', categoryController.getCategories);
router.get('/subcategories', categoryController.getSubcategories);
router.post('/', adminAuth, categoryValidation.create, categoryController.createCategory);
router.put('/:id', adminAuth, categoryValidation.update, categoryController.updateCategory);
router.delete('/:id', adminAuth, categoryController.deleteCategory);
router.post('/subcategories', adminAuth, categoryValidation.create, categoryController.createSubcategory);
router.put('/subcategories/:id', adminAuth, categoryValidation.update, categoryController.updateSubcategory);
router.delete('/subcategories/:id', adminAuth, categoryController.deleteSubcategory);
router.post('/upload-subcategory-image', adminAuth, upload.single('image'), categoryController.uploadSubcategoryImage);
router.post('/upload-category-image', adminAuth, upload.single('image'), categoryController.uploadCategoryImage);

module.exports = router;
