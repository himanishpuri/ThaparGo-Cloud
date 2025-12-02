import { Router } from "express";
import { requireAuth, requireFullAuth } from "../middleware/requireAuth";
import * as authController from "../controllers/auth.controller";

const router = Router();

// 1.1 Google OAuth Signup/Login
// router.post("/google", authController.googleAuth);

// 1.1.1 Cognito OAuth Signup/Login
router.post("/cognito", authController.cognitoAuth);

// 1.2 Complete User Onboarding
router.post(
	"/complete-onboarding",
	requireAuth,
	authController.completeOnboarding,
);

// 1.3 Get Current User
router.get("/me", requireFullAuth, authController.getCurrentUser);

// 1.4 Logout
router.post("/logout", requireFullAuth, authController.logout);

export default router;
