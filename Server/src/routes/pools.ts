import { Router } from "express";
import { prisma } from "../db/prismaClient";
import { requireFullAuth, AuthRequest } from "../middleware/requireAuth";
import { validatePoolData } from "../utils/validation";
import {
	addPoolVirtuals,
	addPoolsVirtuals,
	PoolWithRelations,
} from "../utils/pool-extensions";
import { Prisma } from "@prisma/client";
import logger from "../utils/logger";

const router = Router();

// Helper to include pool relations
const poolInclude = {
	creator: {
		select: {
			id: true,
			full_name: true,
			email: true,
			phone_number: true,
			gender: true,
		},
	},
	members: {
		include: {
			user: {
				select: {
					id: true,
					full_name: true,
					phone_number: true,
					gender: true,
				},
			},
		},
	},
};

// 2.1 Get All Pools
router.get("/", requireFullAuth, async (req: AuthRequest, res) => {
	try {
		const {
			start_point,
			end_point,
			transport_mode,
			departure_date,
			is_female_only,
		} = req.query;

		logger.debug("Fetching pools with filters", {
			userId: req.user!.userId,
			filters: {
				start_point,
				end_point,
				transport_mode,
				departure_date,
				is_female_only,
			},
		});

		// Build where clause
		const where: Prisma.PoolWhereInput = {};

		if (start_point) {
			where.start_point = {
				contains: start_point as string,
			};
		}

		if (end_point) {
			where.end_point = {
				contains: end_point as string,
			};
		}

		if (transport_mode) {
			where.transport_mode = transport_mode as any;
		}

		if (departure_date) {
			const date = new Date(departure_date as string);
			const nextDay = new Date(date);
			nextDay.setDate(nextDay.getDate() + 1);

			where.departure_time = {
				gte: date,
				lt: nextDay,
			};
		}

		if (is_female_only !== undefined) {
			where.is_female_only = is_female_only === "true";
		}

		const pools = await prisma.pool.findMany({
			where,
			include: poolInclude,
			orderBy: {
				departure_time: "asc",
			},
		});

		logger.info("Pools fetched successfully", {
			userId: req.user!.userId,
			poolCount: pools.length,
		});

		// Add virtual properties and check user membership
		const poolsWithVirtuals = addPoolsVirtuals(pools).map((pool) => ({
			...pool,
			user_is_member: pool.members.some(
				(m) => m.user_id === req.user!.userId,
			),
		}));

		return res.json({
			success: true,
			pools: poolsWithVirtuals,
		});
	} catch (error) {
		logger.error("Get pools error", {
			error,
			userId: req.user?.userId,
		});
		return res.status(500).json({
			success: false,
			error: "Failed to fetch pools",
		});
	}
});

// 2.2 Get Pool by ID
router.get("/:id", requireFullAuth, async (req: AuthRequest, res) => {
	try {
		const { id } = req.params;

		logger.debug("Fetching pool by ID", {
			userId: req.user!.userId,
			poolId: id,
		});

		const pool = await prisma.pool.findUnique({
			where: { id },
			include: poolInclude,
		});

		if (!pool) {
			logger.warn("Pool not found", {
				userId: req.user!.userId,
				poolId: id,
			});
			return res.status(404).json({
				success: false,
				error: "Pool not found",
			});
		}

		logger.info("Pool fetched successfully", {
			userId: req.user!.userId,
			poolId: id,
		});

		const poolWithVirtuals = addPoolVirtuals(pool);
		const poolWithMembership = {
			...poolWithVirtuals,
			user_is_member: pool.members.some(
				(m) => m.user_id === req.user!.userId,
			),
		};

		return res.json({
			success: true,
			pool: poolWithMembership,
		});
	} catch (error) {
		logger.error("Get pool error", {
			error,
			userId: req.user?.userId,
			poolId: req.params.id,
		});
		return res.status(500).json({
			success: false,
			error: "Failed to fetch pool",
		});
	}
});

// 2.3 Create Pool
router.post("/", requireFullAuth, async (req: AuthRequest, res) => {
	try {
		const poolData = req.body;
		const userId = req.user!.userId;

		logger.debug("Creating new pool", {
			userId,
			poolData,
		});

		// Validate pool data
		const validation = validatePoolData(poolData);
		if (!validation.valid) {
			logger.warn("Pool validation failed", {
				userId,
				errors: validation.errors,
			});
			return res.status(400).json({
				success: false,
				error: "Validation failed",
				details: validation.errors,
			});
		}

		// Get user to check gender for female-only pools
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			logger.error("User not found during pool creation", { userId });
			return res.status(404).json({
				success: false,
				error: "User not found",
			});
		}

		// Check if female-only pool and user is not female
		if (poolData.is_female_only && user.gender !== "Female") {
			logger.warn("Non-female user attempted to create female-only pool", {
				userId,
				userGender: user.gender,
			});
			return res.status(400).json({
				success: false,
				error: "Only female users can create female-only pools",
			});
		}

		// Create pool and add creator as member in a transaction
		const pool = await prisma.$transaction(async (tx) => {
			const newPool = await tx.pool.create({
				data: {
					start_point: poolData.start_point,
					end_point: poolData.end_point,
					departure_time: new Date(poolData.departure_time),
					arrival_time: new Date(poolData.arrival_time),
					transport_mode: poolData.transport_mode,
					total_persons: poolData.total_persons,
					total_fare: poolData.total_fare,
					is_female_only: poolData.is_female_only || false,
					created_by: userId,
					current_persons: 1,
				},
			});

			// Add creator as member
			await tx.poolMember.create({
				data: {
					pool_id: newPool.id,
					user_id: userId,
					is_creator: true,
				},
			});

			return newPool;
		});

		logger.info("Pool created successfully", {
			userId,
			poolId: pool.id,
			startPoint: pool.start_point,
			endPoint: pool.end_point,
		});

		// Fetch pool with relations
		const poolWithRelations = await prisma.pool.findUnique({
			where: { id: pool.id },
			include: poolInclude,
		});

		const poolWithVirtuals = addPoolVirtuals(poolWithRelations!);

		return res.status(201).json({
			success: true,
			pool: poolWithVirtuals,
			message: "Pool created successfully",
		});
	} catch (error) {
		logger.error("Create pool error", {
			error,
			userId: req.user?.userId,
		});
		return res.status(500).json({
			success: false,
			error: "Failed to create pool",
		});
	}
});

// 2.4 Join Pool
router.post("/:id/join", requireFullAuth, async (req: AuthRequest, res) => {
	try {
		const { id } = req.params;
		const userId = req.user!.userId;

		logger.debug("User attempting to join pool", {
			userId,
			poolId: id,
		});

		// Get pool with members
		const pool = await prisma.pool.findUnique({
			where: { id },
			include: {
				members: true,
			},
		});

		if (!pool) {
			logger.warn("Pool not found for join", {
				userId,
				poolId: id,
			});
			return res.status(404).json({
				success: false,
				error: "Pool not found",
			});
		}

		// Check if already a member
		const isAlreadyMember = pool.members.some((m) => m.user_id === userId);
		if (isAlreadyMember) {
			logger.warn("User already member of pool", {
				userId,
				poolId: id,
			});
			return res.status(400).json({
				success: false,
				error: "You are already a member of this pool",
			});
		}

		// Check if pool is full
		if (pool.current_persons >= pool.total_persons) {
			logger.warn("Pool is full", {
				userId,
				poolId: id,
				currentPersons: pool.current_persons,
				totalPersons: pool.total_persons,
			});
			return res.status(400).json({
				success: false,
				error: "This pool is full",
			});
		}

		// Check gender restriction
		if (pool.is_female_only) {
			const user = await prisma.user.findUnique({
				where: { id: userId },
			});

			if (user?.gender !== "Female") {
				logger.warn("Non-female user attempted to join female-only pool", {
					userId,
					poolId: id,
					userGender: user?.gender,
				});
				return res.status(400).json({
					success: false,
					error: "This pool is female-only",
				});
			}
		}

		// Add user to pool
		await prisma.$transaction([
			prisma.poolMember.create({
				data: {
					pool_id: id,
					user_id: userId,
					is_creator: false,
				},
			}),
			prisma.pool.update({
				where: { id },
				data: {
					current_persons: {
						increment: 1,
					},
				},
			}),
		]);

		logger.info("User joined pool successfully", {
			userId,
			poolId: id,
		});

		// Fetch updated pool
		const updatedPool = await prisma.pool.findUnique({
			where: { id },
			include: poolInclude,
		});

		const poolWithVirtuals = addPoolVirtuals(updatedPool!);

		return res.json({
			success: true,
			message: "Successfully joined pool",
			pool: {
				id: poolWithVirtuals.id,
				current_persons: poolWithVirtuals.current_persons,
				fare_per_head: poolWithVirtuals.fare_per_head,
				available_seats: poolWithVirtuals.available_seats,
				is_full: poolWithVirtuals.is_full,
			},
		});
	} catch (error) {
		logger.error("Join pool error", {
			error,
			userId: req.user?.userId,
			poolId: req.params.id,
		});
		return res.status(500).json({
			success: false,
			error: "Failed to join pool",
		});
	}
});

// 2.5 Leave Pool
router.post("/:id/leave", requireFullAuth, async (req: AuthRequest, res) => {
	try {
		const { id } = req.params;
		const userId = req.user!.userId;

		logger.debug("User attempting to leave pool", {
			userId,
			poolId: id,
		});

		// Check if user is a member
		const membership = await prisma.poolMember.findFirst({
			where: {
				pool_id: id,
				user_id: userId,
			},
		});

		if (!membership) {
			logger.warn("User not a member of pool", {
				userId,
				poolId: id,
			});
			return res.status(400).json({
				success: false,
				error: "You are not a member of this pool",
			});
		}

		// Check if user is the creator
		if (membership.is_creator) {
			logger.warn("Pool creator attempted to leave", {
				userId,
				poolId: id,
			});
			return res.status(400).json({
				success: false,
				error: "Pool creator cannot leave. Delete the pool instead.",
			});
		}

		// Remove user from pool
		await prisma.$transaction([
			prisma.poolMember.delete({
				where: {
					id: membership.id,
				},
			}),
			prisma.pool.update({
				where: { id },
				data: {
					current_persons: {
						decrement: 1,
					},
				},
			}),
		]);

		logger.info("User left pool successfully", {
			userId,
			poolId: id,
		});

		return res.json({
			success: true,
			message: "Successfully left pool",
		});
	} catch (error) {
		logger.error("Leave pool error", {
			error,
			userId: req.user?.userId,
			poolId: req.params.id,
		});
		return res.status(500).json({
			success: false,
			error: "Failed to leave pool",
		});
	}
});

// 2.6 Delete Pool
router.delete("/:id", requireFullAuth, async (req: AuthRequest, res) => {
	try {
		const { id } = req.params;
		const userId = req.user!.userId;

		logger.debug("User attempting to delete pool", {
			userId,
			poolId: id,
		});

		const pool = await prisma.pool.findUnique({
			where: { id },
		});

		if (!pool) {
			logger.warn("Pool not found for deletion", {
				userId,
				poolId: id,
			});
			return res.status(404).json({
				success: false,
				error: "Pool not found",
			});
		}

		// Check if user is the creator
		if (pool.created_by !== userId) {
			logger.warn("Non-creator attempted to delete pool", {
				userId,
				poolId: id,
				creatorId: pool.created_by,
			});
			return res.status(403).json({
				success: false,
				error: "Only the pool creator can delete this pool",
			});
		}

		// Delete pool (members will be deleted via cascade)
		await prisma.pool.delete({
			where: { id },
		});

		logger.info("Pool deleted successfully", {
			userId,
			poolId: id,
		});

		return res.json({
			success: true,
			message: "Pool deleted successfully",
		});
	} catch (error) {
		logger.error("Delete pool error", {
			error,
			userId: req.user?.userId,
			poolId: req.params.id,
		});
		return res.status(500).json({
			success: false,
			error: "Failed to delete pool",
		});
	}
});

// 2.7 Get User's Pools
router.get(
	"/users/me/pools",
	requireFullAuth,
	async (req: AuthRequest, res) => {
		try {
			const { type = "all" } = req.query;
			const userId = req.user!.userId;

			logger.debug("Fetching user's pools", {
				userId,
				type,
			});

			let created_pools: PoolWithRelations[] = [];
			let joined_pools: PoolWithRelations[] = [];

			if (type === "created" || type === "all") {
				created_pools = await prisma.pool.findMany({
					where: {
						created_by: userId,
					},
					include: poolInclude,
					orderBy: {
						departure_time: "asc",
					},
				});
			}

			if (type === "joined" || type === "all") {
				const memberships = await prisma.poolMember.findMany({
					where: {
						user_id: userId,
						is_creator: false,
					},
					include: {
						pool: {
							include: poolInclude,
						},
					},
				});

				joined_pools = memberships.map((m) => m.pool);
			}

			logger.info("User pools fetched successfully", {
				userId,
				createdCount: created_pools.length,
				joinedCount: joined_pools.length,
			});

			return res.json({
				success: true,
				created_pools: addPoolsVirtuals(created_pools),
				joined_pools: addPoolsVirtuals(joined_pools),
			});
		} catch (error) {
			logger.error("Get user pools error", {
				error,
				userId: req.user?.userId,
			});
			return res.status(500).json({
				success: false,
				error: "Failed to fetch user pools",
			});
		}
	},
);

export default router;
