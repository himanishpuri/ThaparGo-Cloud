import jwt, { SignOptions } from "jsonwebtoken";

export interface JWTPayload {
	userId: string;
	email: string;
	isTemp?: boolean;
}

export const generateToken = (payload: JWTPayload, isTemp = false): string => {
	const secret = process.env.JWT_ACCESS_SECRET;
	if (!secret) {
		throw new Error(
			"JWT_ACCESS_SECRET is not defined in environment variables",
		);
	}

	const expiresIn: number = isTemp
		? parseInt(process.env.TEMP_TOKEN_EXPIRES_IN || "900") // 15 minutes in seconds
		: parseInt(process.env.JWT_EXPIRES_IN || "604800"); // 7 days in seconds

	const JwtPayload = {
		...payload,
		isTemp,
	};

	const options: SignOptions = { expiresIn };

	return jwt.sign(JwtPayload, secret, options);
};

export const verifyToken = (token: string): JWTPayload => {
	const secret = process.env.JWT_ACCESS_SECRET;
	if (!secret) {
		throw new Error("JWT_SECRET is not defined in environment variables");
	}

	return jwt.verify(token, secret) as JWTPayload;
};
