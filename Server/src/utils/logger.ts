// src/utils/logger.ts
import winston from "winston";
import { env } from "../config";

// Define custom colors for log levels
const colors = {
	error: "red",
	warn: "yellow",
	info: "blue",
	http: "magenta",
	debug: "green",
};

winston.addColors(colors);

// Custom format for console output
const consoleFormat = winston.format.combine(
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
	winston.format.colorize({ all: true }),
	winston.format.printf((info) => {
		const { timestamp, level, message, ...meta } = info;
		let metaString = "";

		// Format metadata nicely
		if (Object.keys(meta).length > 0) {
			metaString = `\n${JSON.stringify(meta, null, 2)}`;
		}

		return `[${timestamp}] ${level}: ${message}${metaString}`;
	}),
);

// Format for file output (JSON for easy parsing)
const fileFormat = winston.format.combine(
	winston.format.timestamp(),
	winston.format.errors({ stack: true }),
	winston.format.json(),
);

// Create transports
const transports: winston.transport[] = [
	// Console transport with colors
	new winston.transports.Console({
		format: consoleFormat,
	}),
];

// Add file transports only in production/non-dev environments
if (env.NODE_ENV !== "development") {
	transports.push(
		// Error log file
		new winston.transports.File({
			filename: "logs/error.log",
			level: "error",
			format: fileFormat,
			maxsize: 5242880, // 5MB
			maxFiles: 5,
		}),
		// Combined log file
		new winston.transports.File({
			filename: "logs/combined.log",
			format: fileFormat,
			maxsize: 5242880, // 5MB
			maxFiles: 5,
		}),
	);
}

// Create the logger
const logger = winston.createLogger({
	level: env.LOG_LEVEL || (env.NODE_ENV === "development" ? "debug" : "info"),
	levels: {
		error: 0,
		warn: 1,
		info: 2,
		http: 3,
		debug: 4,
	},
	transports,
	// Don't exit on error
	exitOnError: false,
});

// Create a stream object for Morgan
export const stream = {
	write: (message: string) => {
		// Remove trailing newline that Morgan adds
		logger.http(message.trim());
	},
};

export default logger;
