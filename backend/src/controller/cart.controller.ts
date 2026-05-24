import type { Request, Response } from "express";
import prisma from "../utils/prisma.js";

export const getCart = async(req:Request , res:Response) =>{
    const userId = req.userId;

    if(!userId){
        return res.status(401).json({message:"Unauthorized"})
    }

    try{
        const cart = await prisma.cart.findFirst({
            where: { userId: userId },
        })


        res.json(cart)
    }catch(error:any){
        res.status(500).json({message:"Internal server error"})
    }
}

export const addToCart = async(req:Request , res:Response) =>{
    const userId = req.userId;
    const { productId, quantity } = req.body;

    if(!userId){
        return res.status(401).json({message:"Unauthorized"})
    }

    try{
        const cartItem = await prisma.cart.create({
            data: {
                userId: userId,
                productId: productId,
                quantity: quantity
            }
        })

        res.json(cartItem)
    }catch(error:any){
        res.status(500).json({message:"Internal server error"})
    }
}

export const updateCartItem = async(req:Request , res:Response) =>{
    const userId = req.userId;
    const rawId = req.params.id;
    const cartItemId = Array.isArray(rawId) ? rawId[0] : rawId;
    const { quantity } = req.body;

    if(!userId){
        return res.status(401).json({message:"Unauthorized"})
    }

    if(!cartItemId){
        return res.status(400).json({message:"Invalid cart item id"})
    }

    try{
        const cartItem = await prisma.cart.update({
            where: {
                id: cartItemId,
                userId: userId
            },
            data: {
                id: cartItemId,
                quantity: quantity
            }
        })

        res.json(cartItem)
    }catch(error:any){
        res.status(500).json({message:"Internal server error"})
    }
}

export const deleteCartItem = async(req:Request , res:Response) =>{
    const userId = req.userId;
    const rawId = req.params.id;
    const cartItemId = Array.isArray(rawId) ? rawId[0] : rawId;

    if(!userId){
        return res.status(401).json({message:"Unauthorized"})
    }

    if(!cartItemId){
        return res.status(400).json({message:"Invalid cart item id"})
    }

    try{
        const cartItem = await prisma.cart.delete({
            where: {
                id: cartItemId,
                userId: userId
            }
        })

        res.json(cartItem)
    }catch(error:any){
        res.status(500).json({message:"Internal server error"})
    }
}
