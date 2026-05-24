import type { Request, Response } from "express"
import prisma from "../utils/prisma.js";

export const getProducts = async(req:Request , res:Response) =>{
    const userId = req.userId;

    if(!userId){
        return res.status(401).json({message:"Unauthorized"})
    }

    try{
        // Fetch products from database with pagination and filters
        const products = await prisma.product.findMany({
            where: { userId: userId },
        })

        res.json(products)
    }catch(error:any){
        res.status(500).json({message:"Internal server error"})
    }
}

const getProductById = async(req:Request , res:Response) =>{
    const userId = req.userId;
    const rawId = req.params.id;
    const productId = Array.isArray(rawId) ? rawId[0] : rawId;

    if(!userId){
        return res.status(401).json({message:"Unauthorized"})
    }

    try{
        if(!productId){
            return res.status(400).json({ message: "Product id is required" })
        }

        const product = await prisma.product.findFirst({
            where: { id: productId, userId: userId },
        })

        if(!product){
            return res.status(404).json({message:"Product not found"})
        }

        res.json(product)
    }catch(error:any){
        res.status(500).json({message:"Internal server error"})
    }
}

const getCategories = async(req:Request , res:Response) =>{
    const userId = req.userId;

    if(!userId){
        return res.status(401).json({message:"Unauthorized"})
    }

    const category = req.query.category as string;

    try{

        const categories = await prisma.product.findMany({
            where: { userId: userId },
        })
        res.json(categories)
    }catch(error:any){
        res.status(500).json({message:"Internal server error"})
    }
}

const searchProducts = async(req:Request , res:Response) =>{
    const userId = req.userId;
    const query = req.query.q as string;

    if(!userId){
        return res.status(401).json({message:"Unauthorized"})
    }

    try{
        const products = await prisma.product.findMany({
            where: {
                userId: userId,
                OR: [
                    { title: { contains: query } },
                    { tags: { contains: query } }
                ]
            }
        })
        res.json(products)
    }catch(error:any){
        res.status(500).json({message:"Internal server error"})
    }
}


const createProduct = async(req:Request , res:Response) =>{
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    
}

const updateProduct = async(req:Request , res:Response) =>{}

const deleteProduct = async(req:Request , res:Response) =>{}

const createCategoryCatelog = async(req:Request , res:Response) =>{}