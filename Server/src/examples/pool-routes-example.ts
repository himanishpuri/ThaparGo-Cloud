// Example usage of Pool virtual properties

import { prisma } from "../db/prismaClient";
import { addPoolVirtuals, addPoolsVirtuals } from "../utils/pool-extensions";
import type { Request, Response } from "express";

// Example 1: Get single pool with computed fare_per_head
export async function getPoolById(req: Request, res: Response) {
	try {
		const pool = await prisma.pool.findUnique({
			where: { id: req.params.id },
		});

		if (!pool) {
			return res.status(404).json({ error: "Pool not found" });
		}

		// Add virtual properties (like Mongoose virtuals)
		const poolWithVirtuals = addPoolVirtuals(pool);

		// Now you can access fare_per_head
		res.json({
			...poolWithVirtuals,
			fare_per_head: poolWithVirtuals.fare_per_head, // Computed on access
		});
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch pool" });
	}
}

// Example 2: Get all pools with computed properties
export async function getAllPools(req: Request, res: Response) {
	try {
		const pools = await prisma.pool.findMany({
			include: {
				creator: true,
				members: true,
			},
		});

		// Add virtual properties to all pools
		const poolsWithVirtuals = addPoolsVirtuals(pools);

		// Return with computed fare_per_head for each
		res.json(
			poolsWithVirtuals.map((pool) => ({
				...pool,
				fare_per_head: pool.fare_per_head,
			})),
		);
	} catch (error) {
		res.status(500).json({ error: "Failed to fetch pools" });
	}
}

// Example 3: Create pool - store total_fare, compute per head on read
export async function createPool(req: Request, res: Response) {
	try {
		const {
			start_point,
			end_point,
			departure_time,
			arrival_time,
			transport_mode,
			total_persons,
			total_fare, // Store total fare
			is_female_only,
			created_by,
		} = req.body;

		const pool = await prisma.pool.create({
			data: {
				start_point,
				end_point,
				departure_time: new Date(departure_time),
				arrival_time: new Date(arrival_time),
				transport_mode,
				total_persons,
				total_fare, // Store the total fare
				is_female_only,
				created_by,
			},
		});

		// Return with computed fare_per_head
		const poolWithVirtuals = addPoolVirtuals(pool);

		res.status(201).json({
			...poolWithVirtuals,
			fare_per_head: poolWithVirtuals.fare_per_head,
		});
	} catch (error) {
		res.status(500).json({ error: "Failed to create pool" });
	}
}
