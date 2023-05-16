import express from "express";

import requireAuth from "../middlewares/auth.middleware";
import {
    login,
    register,
    resendVerificationEmail,
    verifyEmail,
} from "../controllers/auth.controller";

const authRoutes = express.Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.post("/resend-verification-email", resendVerificationEmail);
authRoutes.get("/verify-email/:verificationCode", verifyEmail);
authRoutes.get("/protected", requireAuth, (_req, res) => {
    res.send("Protected route");
});

export default authRoutes;
