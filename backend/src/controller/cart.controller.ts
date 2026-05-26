import type { Request, Response } from "express";
import prisma from "../utils/prisma.js";

export const getCart = async(req:Request , res:Response) =>{
    const userId = req.userId;

    if(!userId){
        return res.status(401).json({message:"Unauthorized"})
    }

    try{
        let cart = await prisma.cart.findUnique({
            where: { userId: userId },
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        })

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId: userId },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            })
        }

        return res.json(cart)
    }catch(error:any){
        return res.status(500).json({message:"Internal server error"})
    }
}

export const addToCart = async(req:Request , res:Response) =>{
    const userId = req.userId;
    const { productId, quantity } = req.body;

    if(!userId){
        return res.status(401).json({message:"Unauthorized"})
    }

    try{
        let cart = await prisma.cart.findUnique({
            where: { userId: userId }
        });

        if (!cart) {
            cart = await prisma.cart.create({
                data: { userId: userId }
            });
        }

        const existingCartItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId: productId
            }
        });

        let cartItem;
        if (existingCartItem) {
            cartItem = await prisma.cartItem.update({
                where: { id: existingCartItem.id },
                data: { quantity: existingCartItem.quantity + Number(quantity) }
            });
        } else {
            cartItem = await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    productId: productId,
                    quantity: Number(quantity)
                }
            });
        }

        return res.json(cartItem)
    }catch(error:any){
        return res.status(500).json({message:"Internal server error"})
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
        const existingCartItem = await prisma.cartItem.findUnique({
            where: { id: cartItemId },
            include: { cart: true }
        });

        if (!existingCartItem || existingCartItem.cart.userId !== userId) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        const cartItem = await prisma.cartItem.update({
            where: {
                id: cartItemId
            },
            data: {
                quantity: Number(quantity)
            }
        })

        return res.json(cartItem)
    }catch(error:any){
        return res.status(500).json({message:"Internal server error"})
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
        const existingCartItem = await prisma.cartItem.findUnique({
            where: { id: cartItemId },
            include: { cart: true }
        });

        if (!existingCartItem || existingCartItem.cart.userId !== userId) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        const cartItem = await prisma.cartItem.delete({
            where: {
                id: cartItemId
            }
        })

        return res.json(cartItem)
    }catch(error:any){
        return res.status(500).json({message:"Internal server error"})
    }
}
