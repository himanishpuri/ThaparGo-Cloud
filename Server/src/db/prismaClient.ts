// src/db/prismaClient.ts
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { db } from "../config/index";

const adapter = new PrismaMariaDb({
	host: db.host,
	port: db.port,
	user: db.username,
	password: db.password,
	database: db.database,
	connectionLimit: db.connectionLimit,
	connectTimeout: 30000, // 30 seconds
	acquireTimeout: 30000, // 30 seconds
});

export const prisma = new PrismaClient({
	log: ["query", "info", "warn", "error"],
	adapter,
});
