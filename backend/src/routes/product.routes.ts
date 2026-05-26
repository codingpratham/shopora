import express from 'express'
import { createCategoryCatelog, createProduct, deleteProduct, getCategories, getProductById, getProducts, searchProducts, updateProduct} from '../controller/product.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import upload from '../middleware/multer.js';

const router = express.Router();

router.get('/products',authenticate, getProducts);
router.get('/products/:id',authenticate, getProductById);
router.get('/categories',authenticate, getCategories);
router.get('/search', authenticate, searchProducts);
router.post('/products', authenticate, upload.array('images'), createProduct);
router.put('/products/:id', authenticate,upload.array('images'), updateProduct);
router.delete('/products/:id', authenticate, deleteProduct);
router.get('/categories/:category', authenticate,    createCategoryCatelog);

export default router;