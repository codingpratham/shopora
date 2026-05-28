import express from 'express';
import authRouter from './auth.routes.js';
import productRouter from './product.routes.js';
import cartRouter from './cart.routes.js';
import userRouter from './user.routes.js';
import orderRouter from './order.routes.js';
import paymentRouter from './payment.routes.js';


const router = express.Router();

router.use('/auth',authRouter)
router.use('/user',userRouter)

router.use('/products',productRouter)
router.use('/cart',cartRouter)
router.use('/orders',orderRouter)
router.use('/payments', paymentRouter)


export default router;
