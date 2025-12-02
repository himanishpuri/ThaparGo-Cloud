// src/middleware/logger.ts
import { Request, Response, NextFunction } from "express";
import morgan from "morgan";
import logger, { stream } from "../utils/logger";
import { AuthRequest } from "./requireAuth";

// Custom Morgan token for user ID
morgan.token("user-id", (req: Request) => {
	const authReq = req as AuthRequest;
	return authReq.user?.userId || "anonymous";
});

// Custom Morgan token for user email
morgan.token("user-email", (req: Request) => {
	const authReq = req as AuthRequest;
	return authReq.user?.email || "anonymous";
});

// Custom Morgan format with colors and detailed info
const morganFormat =
	":method :url :status :response-time ms - :res[content-length] bytes - User: :user-id (:user-email) - IP: :remote-addr";

// Morgan middleware
export const httpLogger = morgan(morganFormat, { stream });

// Request logger middleware with performance monitoring
export const requestLogger = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const startTime = Date.now();
	const authReq = req as AuthRequest;

	// Log incoming request
	logger.http("Incoming request", {
		method: req.method,
		url: req.originalUrl,
		ip: req.ip || req.socket.remoteAddress,
		userAgent: req.get("user-agent"),
		userId: authReq.user?.userId || null,
		body: req.body || {},
		query: req.query || {},
	});

	// Capture response
	const originalSend = res.send;
	res.send = function (data: any): Response {
		const duration = Date.now() - startTime;

		// Log response
		logger.http("Outgoing response", {
			method: req.method,
			url: req.originalUrl,
			statusCode: res.statusCode,
			duration: `${duration}ms`,
			userId: authReq.user?.userId || null,
		});

		// Performance warning for slow requests
		if (duration > 1000) {
			logger.warn("Slow request detected", {
				method: req.method,
				url: req.originalUrl,
				duration: `${duration}ms`,
				userId: authReq.user?.userId || null,
			});
		}

		return originalSend.call(this, data);
	};

	next();
};

// Error logging helper
export const logError = (error: any, context?: Record<string, any>) => {
	logger.error(error.message || "Unknown error", {
		error: {
			message: error.message,
			stack: error.stack,
			name: error.name,
			code: error.code,
		},
		...context,
	});
};
