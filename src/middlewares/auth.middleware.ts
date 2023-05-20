import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { UserRole } from "../models/user";
import { AuthenticatedRequest } from "../interfaces/express.interfaces";

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) return res.status(401).send("Unauthorized");

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
        const { _id: userId } = decodedToken;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(401).send("Unauthorized");
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(401).send("Unauthorized");
    }
};

export const requireAdmin = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const { user } = req;

    if (user.role !== UserRole.Admin) {
        res.status(403).send("Forbidden");
    }

    next();
};
