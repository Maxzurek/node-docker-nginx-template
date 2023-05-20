import { logger } from "../logger/logger";
import AppError from "./AppError";
import { ErrorCode } from "./appError.interfaces";
import { Response } from "express";

export default class InternalServerError extends AppError {
    originalError: Error;

    constructor(error: Error) {
        super(
            500,
            ErrorCode.InternalServerError,
            "Internal Server Error",
            "An unexpected error occurred while processing your request."
        );
        this.originalError = error;
    }

    send(res: Response): void {
        super.send(res);

        logger.log({
            level: "error",
            message: this.originalError.message,
            stack: this.originalError.stack,
        });
    }
}
