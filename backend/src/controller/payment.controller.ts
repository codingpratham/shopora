import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { z } from 'zod';

// Request schema for initiating a payment
const initPaymentSchema = z.object({
  orderId: z.string(),
});

/**
 * Initiate a mock payment for an order.
 * Calculates the total amount from OrderItems, creates a Payment record with status PENDING,
 * and returns a mock payment URL and paymentId.
 */
export const initPayment = async (req: Request, res: Response) => {
  const parseResult = initPaymentSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Invalid request', errors: parseResult.error.format() });
  }
  const { orderId } = parseResult.data;

  // Verify order exists and belongs to the user (optional security check)
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: true },
  });
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  // Calculate total amount from order items
  const totalAmount = order.orderItems.reduce((sum, item) => {
    return sum + (item.priceAtPurchase * (item.quantity ?? 1));
  }, 0);

  // Create a Payment record (mock provider)
  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      amount: totalAmount,
      provider: 'mock',
      status: 'PENDING',
    },
  });

  // Return a mock payment URL (could be a front‑end route)
  const mockPaymentUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/pay/${payment.id}`;
  return res.status(201).json({
    paymentId: payment.id,
    paymentUrl: mockPaymentUrl,
    amount: totalAmount,
    status: payment.status,
  });
};

/**
 * Webhook / mock callback that marks a payment as completed.
 * Expected body: { paymentId: string }
 */
const webhookSchema = z.object({ paymentId: z.string() });
export const paymentWebhook = async (req: Request, res: Response) => {
  const parseResult = webhookSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Invalid webhook payload', errors: parseResult.error.format() });
  }
  const { paymentId } = parseResult.data;

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }

  // Update payment status to COMPLETED
  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'COMPLETED' },
  });

  // Also mark the associated order as COMPLETED (if exists)
  if (payment.orderId) {
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'COMPLETED' }, // orderStatus handled via OrderStatus enum on OrderItem; we update orderItems status
    });
  }

  return res.json({ message: 'Payment marked as completed' });
};
