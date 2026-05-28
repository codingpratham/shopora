import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { initPayment, paymentWebhook } from '../controller/payment.controller.js';

const router = express.Router();

router.post('/init', authenticate, initPayment);
router.post('/webhook', paymentWebhook);

export default router;
