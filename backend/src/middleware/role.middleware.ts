import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
export const roleMiddleware = (req : Request , res : Response, next : NextFunction) => {

    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY || "secret") as { role: string };

        const payload = decode.role

        if (payload !== "admin") {
            return res.status(403).json({ message: "Forbidden" });
        }

        next();
    } catch (error: any) {
        return res.status(500).json({ message: error?.message || "Internal server error" });
    }
}