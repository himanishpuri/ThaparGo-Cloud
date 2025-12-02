import { prisma } from "../db/prismaClient";

async function main() {
	console.log("Starting seed...");

	// Create test users
	const user1 = await prisma.user.upsert({
		where: { email: "test1@thapar.edu" },
		update: {},
		create: {
			email: "test1@thapar.edu",
			full_name: "Test User 1",
			phone_number: "9876543210",
			gender: "Male",
			google_authenticated: true,
		},
	});

	const user2 = await prisma.user.upsert({
		where: { email: "test2@thapar.edu" },
		update: {},
		create: {
			email: "test2@thapar.edu",
			full_name: "Test User 2",
			phone_number: "9876543211",
			gender: "Female",
			google_authenticated: true,
		},
	});

	console.log("Users created:", { user1, user2 });

	// Create test pools
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	tomorrow.setHours(10, 0, 0, 0);

	const arrivalTime = new Date(tomorrow);
	arrivalTime.setHours(12, 0, 0, 0);

	const pool1 = await prisma.pool.create({
		data: {
			start_point: "Thapar University",
			end_point: "Chandigarh",
			departure_time: tomorrow,
			arrival_time: arrivalTime,
			transport_mode: "Car",
			total_persons: 4,
			current_persons: 1,
			total_fare: 400,
			is_female_only: false,
			created_by: user1.id,
		},
	});

	// Add creator as member
	await prisma.poolMember.create({
		data: {
			pool_id: pool1.id,
			user_id: user1.id,
			is_creator: true,
		},
	});

	const pool2 = await prisma.pool.create({
		data: {
			start_point: "Thapar University",
			end_point: "Delhi",
			departure_time: tomorrow,
			arrival_time: arrivalTime,
			transport_mode: "Train",
			total_persons: 3,
			current_persons: 1,
			total_fare: 600,
			is_female_only: true,
			created_by: user2.id,
		},
	});

	await prisma.poolMember.create({
		data: {
			pool_id: pool2.id,
			user_id: user2.id,
			is_creator: true,
		},
	});

	console.log("Pools created:", { pool1, pool2 });

	console.log("Seed completed successfully!");
}

main()
	.catch((e) => {
		console.error("Seed error:", e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
