import type { Request, Response } from "express";
import prisma from "../utils/prisma.js";
import { updateUserSchema, type UpdateUserInput } from "../types/user.types.js";

export const getProfile = async(req:Request , res:Response) =>{
    const userId = req.userId;

    if(!userId){
        return res.status(401).json({message:"Unauthorized"})
    }

    try{
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        })
        if(!user){
            return res.status(404).json({message:"User not found"})
        }
        res.json(user)
    }catch(error:any){
        res.status(500).json({message:"Internal server error"})
    }
}

export const updateProfile = async(req:Request , res:Response) =>{
    const userId = req.userId;

    if(!userId){
        return res.status(401).json({message:"Unauthorized"})
    }

    const input = updateUserSchema.parse(req.body);

    if(!input){
        return res.status(400).json({message:"Invalid input data"})
    }

    const inputData : UpdateUserInput = input

    try{

        const  updatedUser = await prisma.onBoarding.upsert({
            where: { userId: userId },
            update: {
                address: inputData.address,
                phoneNumber: inputData.phoneNumber
            },
            create: {
                userId: userId,
                address: inputData.address,
                phoneNumber: inputData.phoneNumber
            }
        })

        // Mark user as onboarded
        await prisma.user.update({
            where: { id: userId },
            data: { onBoard: true }
        })

        if(!updatedUser){
            return res.status(404).json({message:"User not found"})
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                name: true,
                email: true,
                role: true,
                onBoarding: {
                    select: {
                        address: true,
                        phoneNumber: true
                    }
                }
            }})
        res.json({message:"Profile updated successfully", user})

        
    }catch(error:any){
        res.status(500).json({message:"Internal server error"})
    }
}