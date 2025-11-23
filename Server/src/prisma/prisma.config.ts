import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export default {
	schema: "./schema.prisma",
	datasource: {
		url:
			process.env.DATABASE_URL ||
			"mysql://root:viyug132922@localhost:3306/thapargo",
	},
};
