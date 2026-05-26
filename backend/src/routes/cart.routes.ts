import express from 'express'
import { addToCart, deleteCartItem, getCart, updateCartItem } from '../controller/cart.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authenticate)

router.get("/cart", getCart);
router.post("/cart", addToCart);
router.put("/cart/:id", updateCartItem);
router.delete("/cart/:id", deleteCartItem);
    
export default router;