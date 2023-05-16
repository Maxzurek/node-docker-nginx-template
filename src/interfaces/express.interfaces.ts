import { Request } from "express";
import { UserDTO } from "../models/user";

export interface AuthenticatedRequest extends Request {
    user: UserDTO;
}
