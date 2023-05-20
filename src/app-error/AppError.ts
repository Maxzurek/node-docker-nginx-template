import { AppErrorResponse, ErrorCode } from "./appError.interfaces";
import { Response } from "express";

export default class AppError extends Error {
    status: number;
    success: boolean;
    error: {
        errorcode: ErrorCode;
        message: string;
        detail?: string;
    };

    constructor(status: number, errorcode: ErrorCode, message: string, detail?: string) {
        super(message);
        this.name = "AppError";
        this.status = status;
        this.success = false;
        this.error = {
            errorcode,
            message,
            detail,
        };
    }

    send(res: Response): void {
        res.status(this.status).send(this.toResponse());
    }

    toResponse(): AppErrorResponse {
        return {
            status: this.status,
            success: this.success,
            error: this.error,
        };
    }
}
