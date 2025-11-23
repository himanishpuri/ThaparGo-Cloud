import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";

export interface AuthRequest extends Request {
	user?: {
		userId: string;
		email: string;
		isTemp?: boolean;
	};
}

export const requireAuth = (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return res.status(401).json({
				success: false,
				error: "Unauthorized - No token provided",
			});
		}

		const token = authHeader.substring(7);
		const decoded = verifyToken(token);

		req.user = decoded;
		next();
	} catch (error) {
		return res.status(401).json({
			success: false,
			error: "Unauthorized - Invalid token",
		});
	}
};

export const requireFullAuth = (
	req: AuthRequest,
	res: Response,
	next: NextFunction,
) => {
	requireAuth(req, res, () => {
		if (req.user?.isTemp) {
			return res.status(401).json({
				success: false,
				error: "Please complete onboarding first",
			});
		}
		next();
	});
};
