// src/lib/api/pools.api.ts
// Pool management API functions

import apiClient from "./client";
import type {
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

export const getAllPools = async (
	query?: GetPoolsQuery,
): Promise<GetPoolsResponse> => {
	const params = new URLSearchParams();

	if (query?.start_point) params.append("start_point", query.start_point);
	if (query?.end_point) params.append("end_point", query.end_point);
	if (query?.transport_mode)
		params.append("transport_mode", query.transport_mode);
	if (query?.departure_date)
		params.append("departure_date", query.departure_date);
	if (query?.is_female_only !== undefined)
		params.append("is_female_only", String(query.is_female_only));

	const queryString = params.toString();
	const url = queryString ? `/api/pools?${queryString}` : "/api/pools";

	const response = await apiClient.get<GetPoolsResponse>(url);
	return response.data;
};

export const getPoolById = async (
	poolId: string,
): Promise<GetPoolByIdResponse> => {
	const response = await apiClient.get<GetPoolByIdResponse>(
		`/api/pools/${poolId}`,
	);
	return response.data;
};

export const createPool = async (
	poolData: CreatePoolRequest,
): Promise<CreatePoolResponse> => {
	const response = await apiClient.post<CreatePoolResponse>(
		"/api/pools",
		poolData,
	);
	return response.data;
};

export const joinPool = async (poolId: string): Promise<JoinPoolResponse> => {
	const response = await apiClient.post<JoinPoolResponse>(
		`/api/pools/${poolId}/join`,
		{} as JoinPoolRequest,
	);
	return response.data;
};

export const leavePool = async (poolId: string): Promise<LeavePoolResponse> => {
	const response = await apiClient.post<LeavePoolResponse>(
		`/api/pools/${poolId}/leave`,
	);
	return response.data;
};

export const deletePool = async (
	poolId: string,
): Promise<DeletePoolResponse> => {
	const response = await apiClient.delete<DeletePoolResponse>(
		`/api/pools/${poolId}`,
	);
	return response.data;
};

export const getUserPools = async (): Promise<GetUserPoolsResponse> => {
	const response = await apiClient.get<GetUserPoolsResponse>(
		"/api/pools/user/pools",
	);
	return response.data;
};

export const searchPools = async (
	searchTerm: string,
): Promise<GetPoolsResponse> => {
	// Search can be implemented by combining start_point and end_point filters
	const response = await apiClient.get<GetPoolsResponse>("/api/pools");

	// Client-side filtering for search term
	const filteredPools = response.data.pools.filter(
		(pool) =>
			pool.start_point.toLowerCase().includes(searchTerm.toLowerCase()) ||
			pool.end_point.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	return {
		success: true,
		pools: filteredPools,
	};
};
