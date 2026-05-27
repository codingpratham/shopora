import type { Request, Response } from "express";
import prisma from "../utils/prisma.js";
import {
  createProductSchema,
  type CreateProductInput,
} from "../types/produc.types.js";

export const getProducts = async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const products = await prisma.product.findMany({
      where: { userId },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(products);
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const userId = req.userId;
  const rawId = req.params.id;
  const productId = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    if (!productId) {
      return res.status(400).json({ message: "Product id is required" });
    }

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        userId,
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getCategories = async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const categories = await prisma.product.findMany({
      where: {
        userId,
      },
      select: {
        category: true,
      },
      distinct: ["category"],
    });

    return res.json(categories);
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const searchProducts = async (req: Request, res: Response) => {
  const userId = req.userId;
  const query = req.query.q as string;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!query) {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        userId,
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            category: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
    });

    return res.json(products);
  } catch (error: any) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    const input = createProductSchema.parse(req.body);

    const imageUrls = files.map((file) => file.path);

    const inputData: CreateProductInput = input;

    const product = await prisma.product.create({
      data: {
        imageUrl: imageUrls,
        title: inputData.title,
        description: inputData.description,
        price: String(inputData.price),
        category: inputData.category,
        userId,
      },
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error: any) {
    console.log(error);

    return res.status(500).json({
      message: error?.message || "Internal server error",
    });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const userId = req.userId;
  const rawId = req.params.id;
  const productId = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    if (!productId) {
      return res.status(400).json({
        message: "Product id is required",
      });
    }

    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        userId,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const files = req.files as Express.Multer.File[];

    const input = createProductSchema.partial().parse(req.body);

    let imageUrls = existingProduct.imageUrl;

    if (files && files.length > 0) {
      imageUrls = files.map((file) => file.path);
    }

    const updatedProduct = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.description && {
          description: input.description,
        }),
        ...(input.price && {
          price: input.price,
        }),
        ...(input.category && {
          category: input.category,
        }),
        imageUrl: imageUrls,
      },
    });

    return res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Internal server error",
    });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const userId = req.userId;
  const rawId = req.params.id;
  const productId = Array.isArray(rawId) ? rawId[0] : rawId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    if (!productId) {
      return res.status(400).json({
        message: "Product id is required",
      });
    }

    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        userId,
      },
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    return res.json({
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Internal server error",
    });
  }
};

export const createCategoryCatelog = async (
  req: Request,
  res: Response
) => {
  const userId = req.userId;
  let category = req.params.category;

  if (!userId) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  try {
    if (!category) {
      return res.status(400).json({
        message: "Category is required",
      });
    }

    // req.params.category can be string | string[]; ensure it's a string
    if (Array.isArray(category)) {
      category = category[0];
    }

    const products = await prisma.product.findMany({
      where: {
        userId,
        category: {
          equals: category as string,
          mode: "insensitive",
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      category,
      totalProducts: products.length,
      products,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: error?.message || "Internal server error",
    });
  }
};