import { config } from "dotenv";

config();

// src/config/index.ts
function getEnv(name: string, defaultValue?: string): string {
	const val = process.env[name] ?? defaultValue;
	if (val === undefined) {
		throw new Error(`Missing required env var: ${name}`);
	}
	return val;
}

export const env = {
	NODE_ENV: process.env.NODE_ENV || "development",
	PORT: process.env.PORT || "4000",
	LOG_LEVEL:
		process.env.LOG_LEVEL ||
		(process.env.NODE_ENV === "development" ? "debug" : "info"),

	// later you'll set these as Lambda env vars or SSM params
	DATABASE_URL: getEnv(
		"DATABASE_URL",
		"mysql://root:viyug132922@localhost:3306/thapargo",
	),
	JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET", "dev-access-secret"),
	FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "http://localhost:8080"),
	TEMP_TOKEN_EXPIRES_IN: Number(getEnv("TEMP_TOKEN_EXPIRES_IN", "900")),
	JWT_EXPIRES_IN: Number(getEnv("JWT_EXPIRES_IN", "604800")),
};

export const db = {
	url: env.DATABASE_URL,
	username: getEnv("MYSQL_USER", "root"),
	password: getEnv("MYSQL_PASSWORD", "viyug132922"),
	database: getEnv("MYSQL_DATABASE", "thapargo"),
	host: getEnv("MYSQL_HOST", "localhost"),
	port: Number(getEnv("MYSQL_PORT", "3306")),
	connectionLimit: Number(getEnv("DB_CONNECTION_LIMIT", "5")),
};
