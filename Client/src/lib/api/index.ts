// src/lib/api/index.ts
// Barrel export for all API modules

// Re-export types
export type {
	User,
	Pool,
	PoolMember,
	GoogleAuthRequest,
	GoogleAuthResponse,
	CompleteOnboardingRequest,
	CompleteOnboardingResponse,
	GetCurrentUserResponse,
	LogoutResponse,
	GetPoolsQuery,
	GetPoolsResponse,
	GetPoolByIdResponse,
	CreatePoolRequest,
	CreatePoolResponse,
	JoinPoolRequest,
	JoinPoolResponse,
	LeavePoolResponse,
	DeletePoolResponse,
	GetUserPoolsResponse,
} from "./types";

// Re-export client utilities
export {
	default as apiClient,
	setAuthToken,
	setTempToken,
	clearTokens,
	getAuthToken,
} from "./client";

// Re-export auth functions
export {
	googleAuth,
	cognitoAuth,
	completeOnboarding,
	getCurrentUser,
	logout,
	isAuthenticated,
	hasTempToken,
} from "./auth.api";

// Re-export pool functions
export {
	getAllPools,
	getPoolById,
	createPool,
	joinPool,
	leavePool,
	deletePool,
	getUserPools,
	searchPools,
} from "./pools.api";
