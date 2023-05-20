import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/email.utils";
import User from "../models/user";
import AppError from "../app-error/AppError";
import { ErrorCode } from "../app-error/appError.interfaces";
import InternalServerError from "../app-error/InternalServerError";

/**
 * @api {post} /auth/register
 * @apiName register
 * @apiGroup auth
 *
 * @apiBody {String} email
 * @apiBody {String} password
 * @apiBody {Number} role
 *
 * @apiSuccess {String} userId.
 *
 * @apiError {400} ErrorCode.EmailAlreadyTaken
 * @apiError {500} InternalServerError
 */
export const register = async (req: Request, res: Response) => {
    const verificationCode = jwt.sign({ email: req.body.email }, process.env.JWT_SECRET, {
        expiresIn: "24h",
    });
    const user = new User({
        email: req.body.email,
        password: req.body.password,
        verificationCode,
        role: req.body.role,
    });

    try {
        await user.save();

        sendVerificationEmail(user.email, verificationCode);
        res.send({ userId: user._id });
    } catch (err) {
        if (err.code === 11000) {
            return new AppError(
                400,
                ErrorCode.EmailAlreadyTaken,
                "Email is already taken.",
                "The email address provided is already associated with an existing account. Please choose a different email address or try logging in instead."
            ).send(res);
        }

        new InternalServerError(err).send(res);
    }
};

/**
 * @api {post} /auth/login
 * @apiName login
 * @apiGroup auth
 *
 * @apiBody {String} email
 * @apiBody {String} password
 *
 * @apiSuccess {String} authToken.
 * @apiSuccess {String} userId.
 *
 * @apiError {400} ErrorCode.WrongCredentials
 * @apiError {403} ErrorCode.EmailUnverified
 */
export const login = async (req: Request, res: Response) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return new AppError(
            400,
            ErrorCode.WrongCredentials,
            "Authentication Failed",
            "The credentials provided are invalid."
        ).send(res);
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
        return new AppError(
            400,
            ErrorCode.WrongCredentials,
            "Authentication Failed",
            "The credentials provided are invalid."
        ).send(res);
    }

    if (!user.isVerified) {
        return new AppError(
            403,
            ErrorCode.EmailUnverified,
            "Email Not Verified",
            "Your email address has not been verified yet. Please check your inbox for a verification email and follow the instructions to complete the email verification process."
        ).send(res);
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!);
    res.header("auth-token", token).send({ authToken: token, userId: user.id });
};

/**
 * @api {get} /auth/verify-email
 * @apiName verifyEmail
 * @apiGroup auth
 *
 * @apiParams {String} verificationCode
 *
 * @apiSuccess {String} message.
 *
 * @apiError {400} ErrorCode.EmailVerificationLinkInvalid
 * @apiError {400} ErrorCode.EmailAlreadyVerified
 * @apiError {400} ErrorCode.EmailVerificationLinkExpired
 */
export const verifyEmail = async (req: Request, res: Response) => {
    const verificationCode = req.params.verificationCode;

    try {
        const decodedToken = jwt.verify(verificationCode, process.env.JWT_SECRET) as jwt.JwtPayload;
        const { email } = decodedToken;

        const user = await User.findOne({ email });
        if (!user) {
            return new AppError(
                400,
                ErrorCode.EmailVerificationLinkInvalid,
                "Invalid Email Verification Link",
                "The email verification link is invalid or has been tampered with. Please ensure you are using the correct link or request a new verification email."
            ).send(res);
        }
        if (user.isVerified) {
            return new AppError(
                400,
                ErrorCode.EmailAlreadyVerified,
                "Email Already Verified",
                "The email address associated with this account has already been verified. You can proceed to log in or use the 'Forgot Password' option if needed"
            ).send(res);
        }

        user.isVerified = true;
        await user.save();

        res.status(200).send("Your email address has been verified");
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return new AppError(
                400,
                ErrorCode.EmailVerificationLinkExpired,
                "Email Verification Link Expired",
                "The email verification link has expired. Please request a new verification email to complete the email verification process."
            ).send(res);
        }

        new InternalServerError(err).send(res);
    }
};

/**
 * @api {post} /auth/resend-verification-email
 * @apiName resendVerificationEmail
 * @apiGroup auth
 *
 * @apiBody {String} email
 *
 * @apiSuccess {200}
 */
export const resendVerificationEmail = async (req: Request, res: Response) => {
    const userEmail = req.body.email;

    const user = await User.findOne({ email: userEmail });
    if (!user) {
        return res.status(200).send();
    }

    const verificationCode = jwt.sign({ email: userEmail }, process.env.JWT_SECRET, {
        expiresIn: "24h",
    });
    sendVerificationEmail(userEmail, verificationCode);

    res.status(200).send();
};
