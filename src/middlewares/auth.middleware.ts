import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";
import { AuthenticatedRequest } from "../interfaces/express.interfaces";

const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) return res.status(401).send("Access denied");

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;
        const user = await User.findById(decodedToken.userId);

        if (!user) {
            return res.status(401).send("Unauthorized");
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(401).send("Unauthorized");
    }
};

export default requireAuth;
