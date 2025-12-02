// src/index.ts
import { createApp } from "./app";
import { env } from "./config";
import logger from "./utils/logger";

const app = createApp();
const PORT = env.PORT || 4000;

app.listen(PORT, () => {
	logger.info(`🚀 Backend running locally on http://localhost:${PORT}`, {
		environment: env.NODE_ENV,
		logLevel: env.LOG_LEVEL,
		port: PORT,
	});
});
