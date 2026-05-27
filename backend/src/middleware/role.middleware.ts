import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma.js";

export const roleMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    let token = req.cookies.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user || user.role !== "ADMIN") {
            return res.status(403).json({ message: "Forbidden" });
        }

        next();
    } catch (error: any) {
        return res.status(500).json({ message: error?.message || "Internal server error" });
    }
}