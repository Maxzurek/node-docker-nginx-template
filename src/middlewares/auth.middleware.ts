import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { UserRole } from "../models/user";
import { AuthenticatedRequest } from "../interfaces/express.interfaces";
import AppError from "../app-error/AppError";
import { ErrorCode } from "../app-error/appError.interfaces";

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const headerAuth = req.headers.authorization;
    if (!headerAuth) {
        return new AppError(401, ErrorCode.Unauthorized, "Unauthorized").send(res);
    }

    const token = headerAuth.split(" ")[1];
    if (!token) {
        return new AppError(401, ErrorCode.Unauthorized, "Unauthorized").send(res);
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
        const { _id: userId } = decodedToken;
        const user = await User.findById(userId);

        if (!user) {
            return new AppError(401, ErrorCode.Unauthorized, "Unauthorized").send(res);
        }

        req.user = user;
        next();
    } catch (err) {
        new AppError(401, ErrorCode.Unauthorized, "Unauthorized").send(res);
    }
};

export const requireAdmin = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    const { user } = req;

    if (user.role !== UserRole.Admin) {
        return new AppError(403, ErrorCode.Forbidden, "Forbidden").send(res);
    }

    next();
};
