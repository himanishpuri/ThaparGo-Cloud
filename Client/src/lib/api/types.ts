// src/lib/api/types.ts
// TypeScript types for API requests and responses

export interface User {
	id: string;
	email: string;
	full_name: string;
	phone_number?: string;
	gender?: "Male" | "Female";
	google_authenticated: boolean;
	hasCompletedOnboarding: boolean;
	date_joined?: string;
}

export interface PoolMember {
	id: string;
	user_id: string;
	is_creator: boolean;
	user: {
		id: string;
		full_name: string;
		phone_number: string;
		gender: "Male" | "Female";
	};
}

export interface PoolCreator {
	id: string;
	full_name: string;
	email: string;
	phone_number: string;
	gender: "Male" | "Female";
}

export interface Pool {
	id: string;
	start_point: string;
	end_point: string;
	departure_time: string;
	arrival_time: string;
	transport_mode: "Car" | "Bike" | "Train" | "Bus" | "Plane" | "Ferry";
	total_persons: number;
	current_persons: number;
	total_fare: number;
	fare_per_head: number;
	is_female_only: boolean;
	created_by: string;
	creator: PoolCreator;
	members: PoolMember[];
	available_seats: number;
	is_full: boolean;
	user_is_member: boolean;
}

// API Response wrappers
export interface ApiSuccessResponse<T> {
	success: true;
	data?: T;
	message?: string;
}

export interface ApiErrorResponse {
	success: false;
	error: string;
	details?: Record<string, unknown>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Auth API Types
export interface GoogleAuthRequest {
	credential: string;
}

export interface GoogleAuthResponse {
	success: true;
	isNewUser: boolean;
	requiresOnboarding?: boolean;
	user: User;
	token?: string;
	tempToken?: string;
}

export interface CompleteOnboardingRequest {
	phone_number: string;
	gender: "Male" | "Female";
}

export interface CompleteOnboardingResponse {
	success: true;
	user: User;
	token: string;
}

export interface GetCurrentUserResponse {
	success: true;
	user: User;
}

export interface LogoutResponse {
	success: true;
	message: string;
}

// Pool API Types
export interface GetPoolsQuery {
	start_point?: string;
	end_point?: string;
	transport_mode?: string;
	departure_date?: string;
	is_female_only?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface JoinPoolRequest {
	// Empty request body - poolId comes from URL params
}

export interface GetPoolsResponse {
	success: true;
	pools: Pool[];
}

export interface GetPoolByIdResponse {
	success: true;
	pool: Pool;
}

export interface CreatePoolRequest {
	start_point: string;
	end_point: string;
	departure_time: string;
	arrival_time: string;
	transport_mode: "Car" | "Bike" | "Train" | "Bus" | "Plane" | "Ferry";
	total_persons: number;
	total_fare: number;
	is_female_only?: boolean;
}

export interface CreatePoolResponse {
	success: true;
	pool: Pool;
	message: string;
}

export interface JoinPoolResponse {
	success: true;
	message: string;
	pool: {
		id: string;
		current_persons: number;
		fare_per_head: number;
		available_seats: number;
		is_full: boolean;
	};
}

export interface LeavePoolResponse {
	success: true;
	message: string;
}

export interface DeletePoolResponse {
	success: true;
	message: string;
}

export interface GetUserPoolsQuery {
	type?: "created" | "joined" | "all";
}

export interface GetUserPoolsResponse {
	success: true;
	created_pools: Pool[];
	joined_pools: Pool[];
}
