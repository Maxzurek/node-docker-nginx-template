export enum ErrorCode {
    InternalServerError,
    Unauthorized,
    Forbidden,
    EmailAlreadyTaken,
    WrongCredentials,
    EmailUnverified,
    EmailVerificationLinkExpired,
    EmailVerificationLinkInvalid,
    EmailAlreadyVerified,
}

export interface AppErrorResponse {
    status: number;
    success: boolean;
    error: {
        errorcode: ErrorCode;
        message: string;
        detail?: string;
    };
}
