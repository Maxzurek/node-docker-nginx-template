import express from "express";

import { requireAdmin, requireAuth } from "../middlewares/auth.middleware";
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
// TODO Route added for testing purposes, remove if not needed
authRoutes.get("/require-auth", requireAuth, (_req, res) => {
    res.send("Requires Authentication");
});
// TODO Route added for testing purposes, remove if not needed
authRoutes.get("/require-admin", requireAdmin, (_req, res) => {
    res.send("Requires Admin role");
});

export default authRoutes;
