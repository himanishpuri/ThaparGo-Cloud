export const validateEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
	return /^\d{10}$/.test(phone);
};

export const validatePoolData = (
	data: any,
): { valid: boolean; errors: string[] } => {
	const errors: string[] = [];

	if (!data.start_point) errors.push("Start point is required");
	if (!data.end_point) errors.push("End point is required");
	if (!data.departure_time) errors.push("Departure time is required");
	if (!data.arrival_time) errors.push("Arrival time is required");
	if (!data.transport_mode) errors.push("Transport mode is required");
	if (!data.total_persons) errors.push("Total persons is required");
	if (data.total_fare === undefined) errors.push("Total fare is required");

	if (
		data.total_persons &&
		(data.total_persons < 2 || data.total_persons > 50)
	) {
		errors.push("Total persons must be between 2 and 50");
	}

	if (data.total_fare && data.total_fare < 0) {
		errors.push("Total fare must be greater than or equal to 0");
	}

	if (data.departure_time) {
		const departureDate = new Date(data.departure_time);
		if (departureDate <= new Date()) {
			errors.push("Departure time must be in the future");
		}
	}

	if (data.departure_time && data.arrival_time) {
		const departureDate = new Date(data.departure_time);
		const arrivalDate = new Date(data.arrival_time);
		if (arrivalDate <= departureDate) {
			errors.push("Arrival time must be after departure time");
		}
	}

	const validTransportModes = [
		"Car",
		"Bike",
		"Train",
		"Bus",
		"Plane",
		"Ferry",
	];
	if (
		data.transport_mode &&
		!validTransportModes.includes(data.transport_mode)
	) {
		errors.push(
			`Transport mode must be one of: ${validTransportModes.join(", ")}`,
		);
	}

	return {
		valid: errors.length === 0,
		errors,
	};
};
