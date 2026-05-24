import type { Request, Response } from "express";
import prisma from "../../utils/prisma.js";

const validStatuses = [
  "PENDING",
  "COMPLETED",
  "CANCELLED",
] as const;

type StatusType =
  | "PENDING"
  | "COMPLETED"
  | "CANCELLED";

export const getAllOrders = async (
  req: Request,
  res: Response
) => {
  try {
    const statusParam = req.query.status;

    const status =
      typeof statusParam === "string"
        ? (statusParam as StatusType)
        : undefined;

    const pageParam = req.query.page;
    const limitParam = req.query.limit;

    const page =
      Number(
        Array.isArray(pageParam)
          ? pageParam[0]
          : pageParam
      ) || 1;

    const limit =
      Number(
        Array.isArray(limitParam)
          ? limitParam[0]
          : limitParam
      ) || 10;

    const skip = (page - 1) * limit;

    const whereClause = status
      ? {
          orderItems: {
            some: {
              orderStatus: status,
            },
          },
        }
      : {};

    const orders = await prisma.order.findMany({
      where: whereClause,

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                imageUrl: true,
                price: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },

      skip,
      take: limit,
    });

    const totalOrders = await prisma.order.count({
      where: whereClause,
    });

    return res.status(200).json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
      orders,
    });
  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getOrderById = async (
  req: Request,
  res: Response
) => {
  try {
    const rawId = req.params.id;

    const orderId = Array.isArray(rawId)
      ? rawId[0]
      : rawId;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order id is required",
      });
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const rawId = req.params.id;

    const orderId = Array.isArray(rawId)
      ? rawId[0]
      : rawId;

    const statusParam = req.body.status;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order id is required",
      });
    }

    if (
      !statusParam ||
      typeof statusParam !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required",
      });
    }

    if (
      !validStatuses.includes(
        statusParam as StatusType
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const status = statusParam as StatusType;

    const existingOrder =
      await prisma.order.findUnique({
        where: {
          id: orderId,
        },

        include: {
          orderItems: true,
        },
      });

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    await prisma.orderItem.updateMany({
      where: {
        orderId: orderId,
      },

      data: {
        orderStatus: status,
      },
    });

    const updatedOrder =
      await prisma.order.findUnique({
        where: {
          id: orderId,
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

    return res.status(200).json({
      success: true,
      message:
        "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};