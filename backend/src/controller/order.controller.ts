import type { Request, Response } from 'express';
import prisma from '../utils/prisma.js';
import { z } from 'zod';

const ORDER_STATUSES = ['PENDING', 'COMPLETED', 'CANCELLED'] as const;
type OrderStatusValue = (typeof ORDER_STATUSES)[number];

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
});

const getIdParam = (req: Request) => {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
};

const getSingleQueryValue = (value: Request['query'][string]) => {
  return Array.isArray(value) ? value[0] : value;
};

/** POST /orders */
export const createOrder = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const parseResult = createOrderSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      message: 'Invalid request body',
      errors: parseResult.error.format(),
    });
  }

  const { items } = parseResult.data;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const productPrices = new Map<string, number>();

      for (const { productId, quantity } of items) {
        const product = await tx.product.findUnique({ where: { id: productId } });

        if (!product) {
          throw new Error(`Product ${productId} not found`);
        }

        if (product.stock < quantity) {
          throw new Error(`Insufficient stock for product ${product.title}`);
        }

        const price = Number.parseFloat(product.price);
        if (Number.isNaN(price)) {
          throw new Error(`Invalid price for product ${product.title}`);
        }

        productPrices.set(productId, price);
      }

      for (const { productId, quantity } of items) {
        await tx.product.update({
          where: { id: productId },
          data: { stock: { decrement: quantity } },
        });
      }

      return tx.order.create({
        data: {
          userId,
          status: 'PENDING',
          orderItems: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchase: productPrices.get(item.productId) ?? 0,
              orderStatus: 'PENDING',
            })),
          },
        },
        include: { orderItems: true },
      });
    });

    return res.status(201).json({ message: 'Order created', order });
  } catch (error: any) {
    console.error('Create order error:', error);
    return res.status(400).json({ message: error.message || 'Failed to create order' });
  }
};

/** GET /orders */
export const getOrders = async (req: Request, res: Response) => {
  const userId = req.userId;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const orders = await prisma.order.findMany({
    where: { userId },
    include: { orderItems: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return res.json(orders);
};

/** GET /orders/:id */
export const getOrderById = async (req: Request, res: Response) => {
  const userId = req.userId;
  const orderId = getIdParam(req);

  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  if (!orderId) return res.status(400).json({ message: 'Order id is required' });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { orderItems: { include: { product: true } } },
  });

  if (!order || order.userId !== userId) {
    return res.status(404).json({ message: 'Order not found' });
  }

  return res.json(order);
};

/** GET /orders/admin/order */
export const adminGetAllOrders = async (req: Request, res: Response) => {
  try {
    const rawStatus = getSingleQueryValue(req.query.status);
    const status = ORDER_STATUSES.includes(rawStatus as OrderStatusValue)
      ? (rawStatus as OrderStatusValue)
      : undefined;
    const page = Number(getSingleQueryValue(req.query.page)) || 1;
    const limit = Number(getSingleQueryValue(req.query.limit)) || 10;
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: {
          include: {
            product: { select: { id: true, title: true, imageUrl: true, price: true } },
          },
        },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const totalOrders = await prisma.order.count({
      where,
    });

    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
      orders,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/** GET /orders/admin/order/:id */
export const adminGetOrderById = async (req: Request, res: Response) => {
  const orderId = getIdParam(req);

  if (!orderId) {
    return res.status(400).json({ error: { code: 400, message: 'Order id is required' } });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: { include: { product: true } },
        payment: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: { code: 404, message: 'Order not found' } });
    }

    return res.status(200).json({ success: true, order });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/** PUT /orders/admin/order/:id */
export const adminUpdateOrderStatus = async (req: Request, res: Response) => {
  const { status } = req.body as { status?: string };
  const orderId = getIdParam(req);

  if (!orderId) return res.status(400).json({ message: 'Order id is required' });

  if (!ORDER_STATUSES.includes(status as OrderStatusValue)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { status: status as OrderStatusValue },
      }),
      prisma.orderItem.updateMany({
        where: { orderId },
        data: { orderStatus: status as OrderStatusValue },
      }),
    ]);

    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: { include: { product: true } },
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/** DELETE /orders/admin/order/:id */
export const adminCancelOrder = async (req: Request, res: Response) => {
  const orderId = getIdParam(req);

  if (!orderId) return res.status(400).json({ message: 'Order id is required' });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) return res.status(404).json({ message: 'Order not found' });

  await prisma.$transaction(async (tx) => {
    const orderItems = await tx.orderItem.findMany({
      where: { orderId },
    });

    for (const item of orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: 'CANCELLED' },
    });

    await tx.orderItem.updateMany({
      where: { orderId },
      data: { orderStatus: 'CANCELLED' },
    });
  });

  return res.json({ message: 'Order cancelled and stock restored' });
};
