// src/app.ts
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import poolRoutes from "./routes/pools";
import { httpLogger, requestLogger, logError } from "./middleware/logger";
import logger from "./utils/logger";

export const createApp = () => {
	const app = express();

	// Middleware
	app.use(
		cors({
			origin: "*",
			credentials: true,
			methods: ["GET", "POST", "PUT", "DELETE"],
		}),
	);

	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	// Logging middleware (must be after body parsers, before routes)
	app.use(httpLogger);
	app.use(requestLogger);

	// Routes
	app.use("/api/auth", authRoutes);
	app.use("/api/pools", poolRoutes);

	// Health check
	app.get("/health", (req, res) => {
		logger.debug("Health check endpoint hit");
		res.json({ status: "ok", timestamp: new Date().toISOString() });
	});

	// 404 handler
	app.use((req, res) => {
		logger.warn("Route not found", {
			method: req.method,
			url: req.originalUrl,
			ip: req.ip,
		});
		res.status(404).json({
			success: false,
			error: "Route not found",
		});
	});

	// Error handler
	app.use(
		(
			err: any,
			req: express.Request,
			res: express.Response,
			next: express.NextFunction,
		) => {
			logError(err, {
				method: req.method,
				url: req.originalUrl,
				ip: req.ip,
				body: req.body,
			});

			res.status(err.status || 500).json({
				success: false,
				error: err.message || "Internal server error",
			});
		},
	);

	return app;
};
