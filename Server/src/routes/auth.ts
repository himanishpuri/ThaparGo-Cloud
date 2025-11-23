import { Router } from "express";
import { prisma } from "../db/prismaClient";
import { verifyGoogleToken } from "../utils/google-auth";
import { generateToken } from "../utils/jwt";
import { validateEmail, validatePhoneNumber } from "../utils/validation";
import {
	requireAuth,
	requireFullAuth,
	AuthRequest,
} from "../middleware/requireAuth";
import logger from "../utils/logger";

const router = Router();

// 1.1 Google OAuth Signup/Login
router.post("/google", async (req, res) => {
	try {
		const { credential } = req.body;

		if (!credential) {
			logger.warn("Google auth attempt without credential");
			return res.status(400).json({
				success: false,
				error: "Google credential is required",
			});
		}

		// Verify Google token
		logger.debug("Verifying Google token");
		const googleUser = await verifyGoogleToken(credential);
		logger.debug("Google token verified", { email: googleUser.email });

		// Validate email domain
		if (!validateEmail(googleUser.email)) {
			logger.warn("Invalid email domain attempted", {
				email: googleUser.email,
			});
			return res.status(400).json({
				success: false,
				error: "Only @thapar.edu email addresses are allowed",
			});
		}

		// Check if user exists
		let user = await prisma.user.findUnique({
			where: { email: googleUser.email },
		});

		if (user) {
			// Existing user - return full auth token
			logger.info("User logged in successfully", {
				userId: user.id,
				email: user.email,
			});

			const token = generateToken({
				userId: user.id,
				email: user.email,
			});

			return res.json({
				success: true,
				isNewUser: false,
				user: {
					id: user.id,
					email: user.email,
					full_name: user.full_name,
					phone_number: user.phone_number,
					gender: user.gender,
					google_authenticated: user.google_authenticated,
					hasCompletedOnboarding: !!(user.phone_number && user.gender),
					date_joined: user.date_joined,
				},
				token,
			});
		}

		// New user - create with partial data
		logger.info("Creating new user", { email: googleUser.email });
		user = await prisma.user.create({
			data: {
				email: googleUser.email,
				full_name: googleUser.name,
				google_authenticated: true,
			},
		});

		logger.info("New user created successfully", {
			userId: user.id,
			email: user.email,
		});

		// Generate temporary token
		const tempToken = generateToken(
			{
				userId: user.id,
				email: user.email,
			},
			true,
		);

		return res.status(201).json({
			success: true,
			isNewUser: true,
			user: {
				id: user.id,
				email: user.email,
				full_name: user.full_name,
				google_authenticated: user.google_authenticated,
				hasCompletedOnboarding: false,
			},
			tempToken,
		});
	} catch (error: any) {
		logger.error("Google auth error", {
			error: error.message,
			stack: error.stack,
		});
		return res.status(500).json({
			success: false,
			error: error.message || "Failed to authenticate with Google",
		});
	}
});

// 1.2 Complete User Onboarding
router.post(
	"/complete-onboarding",
	requireAuth,
	async (req: AuthRequest, res) => {
		try {
			const { phone_number, gender } = req.body;
			const userId = req.user!.userId;

			logger.debug("Onboarding attempt", { userId, phone_number, gender });

			// Validate it's a temp token
			if (!req.user?.isTemp) {
				logger.warn("Invalid token type for onboarding", { userId });
				return res.status(400).json({
					success: false,
					error: "Invalid token for onboarding",
				});
			}

			// Validate phone number
			if (!phone_number || !validatePhoneNumber(phone_number)) {
				logger.warn("Invalid phone number format", {
					userId,
					phone_number,
				});
				return res.status(400).json({
					success: false,
					error: "Phone number must be exactly 10 digits",
				});
			}

			// Validate gender
			if (!gender || !["Male", "Female"].includes(gender)) {
				logger.warn("Invalid gender value", { userId, gender });
				return res.status(400).json({
					success: false,
					error: "Gender must be either Male or Female",
				});
			}

			// Check if phone number already exists
			const existingPhone = await prisma.user.findUnique({
				where: { phone_number },
			});

			if (existingPhone && existingPhone.id !== userId) {
				logger.warn("Phone number already in use", {
					userId,
					phone_number,
					existingUserId: existingPhone.id,
				});
				return res.status(400).json({
					success: false,
					error: "Phone number already registered",
				});
			}

			// Update user
			const user = await prisma.user.update({
				where: { id: userId },
				data: {
					phone_number,
					gender,
				},
			});

			logger.info("User onboarding completed", {
				userId: user.id,
				email: user.email,
				phone_number: user.phone_number,
				gender: user.gender,
			});

			// Generate full auth token
			const token = generateToken({
				userId: user.id,
				email: user.email,
			});

			return res.json({
				success: true,
				user: {
					id: user.id,
					email: user.email,
					full_name: user.full_name,
					phone_number: user.phone_number,
					gender: user.gender,
					google_authenticated: user.google_authenticated,
					hasCompletedOnboarding: true,
					date_joined: user.date_joined,
				},
				token,
			});
		} catch (error: any) {
			logger.error("Onboarding error", {
				error: error.message,
				stack: error.stack,
				userId: req.user?.userId,
			});
			return res.status(500).json({
				success: false,
				error: "Failed to complete onboarding",
			});
		}
	},
);

// 1.3 Get Current User
router.get("/me", requireFullAuth, async (req: AuthRequest, res) => {
	try {
		const userId = req.user!.userId;
		logger.debug("Fetching current user", { userId });

		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			logger.warn("User not found", { userId });
			return res.status(404).json({
				success: false,
				error: "User not found",
			});
		}

		logger.debug("User data fetched successfully", { userId });

		return res.json({
			success: true,
			user: {
				id: user.id,
				email: user.email,
				full_name: user.full_name,
				phone_number: user.phone_number,
				gender: user.gender,
				google_authenticated: user.google_authenticated,
				hasCompletedOnboarding: !!(user.phone_number && user.gender),
				date_joined: user.date_joined,
			},
		});
	} catch (error) {
		logger.error("Get user error", {
			error: error,
			userId: req.user?.userId,
		});
		return res.status(500).json({
			success: false,
			error: "Failed to fetch user data",
		});
	}
});

// 1.4 Logout
router.post("/logout", requireFullAuth, async (req: AuthRequest, res) => {
	logger.info("User logged out", { userId: req.user!.userId });

	// For stateless JWT, logout is handled client-side
	// If you want to implement token blacklist, add it here
	return res.json({
		success: true,
		message: "Logged out successfully",
	});
});

export default router;
