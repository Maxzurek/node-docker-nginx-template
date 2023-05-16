import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../utils/email.utils";
import User from "../models/user";

const errorCodes = {
    EMAIL_ALREADY_TAKEN: {
        code: "EMAIL_ALREADY_TAKEN",
        message: "Email is already taken.",
    },
    WRONG_EMAIL_OR_PASSWORD: {
        code: "WRONG_EMAIL_OR_PASSWORD",
        message: "Email or password is wrong.",
    },
    EMAIL_NOT_VERIFIED: {
        code: "EMAIL_NOT_VERIFIED",
        message: "Please verify your email address.",
    },
    EMAIL_VERIFICATION_LINK_EXPIRED: {
        code: "EMAIL_VERIFICATION_LINK_EXPIRED",
        message: "Verification code is expired.",
    },
    EMAIL_VERIFICATION_LINK_INVALID: {
        code: "EMAIL_VERIFICATION_LINK_INVALID",
        message: "The verification link is invalid.",
    },
    EMAIL_ALREADY_VERIFIED: {
        code: "EMAIL_ALREADY_VERIFIED",
        message: "Email is already verified.",
    },
};

/**
 * @api {post} /auth/register
 * @apiName register
 * @apiGroup auth
 *
 * @apiBody {String} email
 * @apiBody {String} password
 *
 * @apiSuccess {String} userId.
 *
 * @apiError {400} EMAIL_ALREADY_TAKEN
 * @apiError {400} Any
 */
const register = async (req: Request, res: Response) => {
    const verificationCode = jwt.sign({ email: req.body.email }, process.env.JWT_SECRET, {
        expiresIn: "24h",
    });
    const user = new User({
        email: req.body.email,
        password: req.body.password,
        verificationCode,
    });

    try {
        await user.save();

        sendVerificationEmail(user.email, verificationCode);
        res.send({ userId: user._id });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).send(errorCodes.EMAIL_ALREADY_TAKEN);
        }

        res.status(400).send(err);
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
 * @apiError {400} WRONG_EMAIL_OR_PASSWORD
 * @apiError {400} EMAIL_NOT_VERIFIED
 */
const login = async (req: Request, res: Response) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).send(errorCodes.WRONG_EMAIL_OR_PASSWORD);
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
        return res.status(400).send(errorCodes.WRONG_EMAIL_OR_PASSWORD);
    }

    if (!user.isVerified) {
        return res.status(400).send(errorCodes.EMAIL_NOT_VERIFIED);
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET!);
    res.header("auth-token", token).send({ authToken: token, userId: user.id });
};

/**
 * @api {post} /auth/verify-email
 * @apiName verifyEmail
 * @apiGroup auth
 *
 * @apiParams {String} verificationCode
 *
 * @apiSuccess {String} message.
 *
 * @apiError {400} EMAIL_VERIFICATION_LINK_EXPIRED
 * @apiError {400} EMAIL_VERIFICATION_LINK_INVALID
 * @apiError {400} EMAIL_ALREADY_VERIFIED
 */
const verifyEmail = async (req: Request, res: Response) => {
    const verificationCode = req.params.verificationCode;
    const decodedToken = jwt.verify(verificationCode, process.env.JWT_SECRET) as jwt.JwtPayload;
    const { email, exp } = decodedToken;

    const verificationCodeExpired = exp < Date.now() / 1000;
    if (verificationCodeExpired) {
        return res.status(400).send(errorCodes.EMAIL_VERIFICATION_LINK_EXPIRED);
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).send(errorCodes.EMAIL_VERIFICATION_LINK_INVALID);
    }
    if (user.isVerified) {
        return res.status(400).send(errorCodes.EMAIL_ALREADY_VERIFIED);
    }

    try {
        user.isVerified = true;
        await user.save();

        res.status(200).send("Your email address has been verified");
    } catch (err) {
        res.status(400).send(err);
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
const resendVerificationEmail = async (req: Request, res: Response) => {
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

export { register, login, verifyEmail, resendVerificationEmail };
