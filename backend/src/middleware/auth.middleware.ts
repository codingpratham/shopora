import type { NextFunction, Response, Request } from "express";
import jwt from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            userId?: string
        }
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    let token = req.cookies.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: "Invalid token" });
        }

        const payload = decoded as { userId: string };
        req.userId = payload.userId;
        next();
    } catch (error: any) {
        res.status(401).json({ message: "Invalid token" });
    }
}