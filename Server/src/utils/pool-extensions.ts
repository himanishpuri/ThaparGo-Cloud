// Pool model extensions with computed properties (like Mongoose virtuals)
import type { Pool, User, PoolMember } from "@prisma/client";

/**
 * Pool with relations type
 */
export type PoolWithRelations = Pool & {
	creator: Pick<
		User,
		"id" | "full_name" | "email" | "phone_number" | "gender"
	>;
	members: (PoolMember & {
		user: Pick<User, "id" | "full_name" | "phone_number" | "gender">;
	})[];
};

/**
 * Extended Pool type with computed properties
 */
export type PoolWithVirtuals = PoolWithRelations & {
	fare_per_head: number | null;
	available_seats: number;
	is_full: boolean;
};

/**
 * Add virtual properties to a pool (like Mongoose virtuals)
 * @param pool - The pool object from Prisma with relations
 * @returns Pool with computed properties
 */
export function addPoolVirtuals(pool: PoolWithRelations): PoolWithVirtuals {
	const fare_per_head =
		pool.total_fare && pool.current_persons > 0
			? Number(pool.total_fare) / pool.current_persons
			: null;

	const available_seats = pool.total_persons - pool.current_persons;
	const is_full = pool.current_persons >= pool.total_persons;

	return {
		...pool,
		fare_per_head,
		available_seats,
		is_full,
	};
}

/**
 * Add virtual properties to an array of pools
 * @param pools - Array of pool objects from Prisma with relations
 * @returns Array of pools with computed properties
 */
export function addPoolsVirtuals(
	pools: PoolWithRelations[],
): PoolWithVirtuals[] {
	return pools.map(addPoolVirtuals);
}

/**
 * Alternative: Calculate fare per head directly without extending the object
 * Use this for simple calculations without modifying the object
 */
export function calculateFarePerHead(
	totalFare: number | null,
	currentPersons: number,
): number | null {
	if (!totalFare || currentPersons === 0) {
		return null;
	}
	return totalFare / currentPersons;
}
