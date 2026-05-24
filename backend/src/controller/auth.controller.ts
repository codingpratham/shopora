import { type Request , type Response } from "express";
import { loginUserSchema, registerUserSchema, type LoginUserInput, type RegisterUserInput } from "../types/auth.types.js";
import prisma from "../utils/prisma.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import crypto from "crypto"

export const registerUser = async(req:Request  , res:Response ) =>{
    const input = registerUserSchema.parse(req.body);

    if(!input){
        res.status(400).json({message:"Invalid input data"})
    }   

    const inputData : RegisterUserInput = input 

    try {
        const existingUser = await prisma.user.findUnique({
            where:{
                email: inputData.email
            }
        })
        if(existingUser){
            res.status(400).json({message:"User with this email already exists"})
            return
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(inputData.password, salt);
        
        const newUser = await prisma.user.create({
            data:{
                email:inputData.email,
                name:inputData.name,
                password:hashedPassword,
                role: inputData.role|| "USER"
            }
        })

        if(newUser){
            res.status(201).json({message:"User registered successfully"})
        }

        const accessToken = jwt.sign({userId: newUser.id}, process.env.JWT_SECRET as string, {expiresIn:"15min"})

        const refreshToken = crypto.randomBytes(64).toString("hex")

        await prisma.token.create({
            data:{
                token: refreshToken,
                userId: newUser.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            }
        })

        res.cookie("token",refreshToken ,{
            sameSite:"strict",
            httpOnly:true,
            secure: process.env.NODE_ENV === "production",
        })

        res.status(201).json({message:"User registered successfully", accessToken , refreshToken})
    } catch (error) {
        res.status(500).json({message:"Internal server error"})
    }
}

export const loginUser = async(req:Request , res:Response) =>{
    const input = loginUserSchema.parse(req.body);

    if(!input){
        res.status(400).json({message:"Invalid input data"})
    }

    const inputData : LoginUserInput = input

    try{
        const user = await prisma.user.findUnique({
            where:{
                email: inputData.email
            }
        })

        if(!user){
            res.status(400).json({message:"Invalid email or password"})
            return
        }

        const isPasswordValid = bcrypt.compareSync(inputData.password, user.password)

        if(!isPasswordValid){
            res.status(400).json({message:"Invalid email or password"})
            return
        }

        const accessToken = jwt.sign({userId: user.id}, process.env.JWT_SECRET as string, {expiresIn:"15min"})

        const refreshToken = crypto.randomBytes(40).toString("hex")

        await prisma.token.create({
            data:{
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
            }
        })
        res.cookie("token",refreshToken ,{
            sameSite:"strict",
            httpOnly:true,
            secure: process.env.NODE_ENV === "production",
        })

        res.status(200).json({
            "message":"user logged in successfully",
            accessToken,
            refreshToken
        })
                
    }catch(error:any){
        res.status(500).json({message:"Internal server error"})
    }
}

export const refresh = async(req:Request , res:Response) =>{
    const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({
      message: "No refresh token",
    });

  }

  try {
    const stored = await prisma.token.findFirst({
      where: { token: refreshToken },
    });

    if (!stored) {
      return res.status(403).json({
        message: "Invalid refresh token (reuse detected)",
      });
   }

    await prisma.token.deleteMany({
      where: { token: refreshToken },
    });

    const newRefreshToken = crypto.randomBytes(40).toString("hex");

    await prisma.token.create({
      data: {
        token: newRefreshToken,
        userId: stored.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const newAccessToken = jwt.sign(
      { userId: stored.userId },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" },
    );

    res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const RefreshToken = req.cookies.refreshToken;

  if (RefreshToken) {
    await prisma.token.deleteMany({
      where: { token: RefreshToken },
    });
  }

  res.json({ message: "Logged out" });
};
