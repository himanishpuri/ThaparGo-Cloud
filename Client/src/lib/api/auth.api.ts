// src/lib/api/auth.api.ts
// Authentication API functions

import apiClient, { setAuthToken, setTempToken, clearTokens } from "./client";
import type {
	GoogleAuthRequest,
	GoogleAuthResponse,
	CompleteOnboardingRequest,
	CompleteOnboardingResponse,
	GetCurrentUserResponse,
	LogoutResponse,
} from "./types";

export const googleAuth = async (
	credential: string,
): Promise<GoogleAuthResponse> => {
	const response = await apiClient.post<GoogleAuthResponse>(
		"/api/auth/google",
		{
			credential,
		} as GoogleAuthRequest,
	);

	const data = response.data;

	if (data.isNewUser && data.tempToken) {
		setTempToken(data.tempToken);
	} else if (data.token) {
		setAuthToken(data.token);
	}

	return data;
};

export const cognitoAuth = async (
	code: string,
): Promise<GoogleAuthResponse> => {
	const response = await apiClient.post<GoogleAuthResponse>(
		"/api/auth/cognito",
		{
			code,
		},
	);

	const data = response.data;

	if (data.isNewUser && data.tempToken) {
		setTempToken(data.tempToken);
	} else if (data.token) {
		setAuthToken(data.token);
	}

	return data;
};

export const completeOnboarding = async (
	phone_number: string,
	gender: "Male" | "Female",
): Promise<CompleteOnboardingResponse> => {
	const response = await apiClient.post<CompleteOnboardingResponse>(
		"/api/auth/complete-onboarding",
		{
			phone_number,
			gender,
		} as CompleteOnboardingRequest,
	);

	const data = response.data;

	if (data.token) {
		setAuthToken(data.token);
	}

	return data;
};

export const getCurrentUser = async (): Promise<GetCurrentUserResponse> => {
	const response = await apiClient.get<GetCurrentUserResponse>("/api/auth/me");
	return response.data;
};

export const logout = async (): Promise<LogoutResponse> => {
	const response = await apiClient.post<LogoutResponse>("/api/auth/logout");
	clearTokens();
	return response.data;
};

export const isAuthenticated = (): boolean => {
	const token = localStorage.getItem("thapargo_auth_token");
	return !!token;
};

export const hasTempToken = (): boolean => {
	const tempToken = localStorage.getItem("thapargo_temp_token");
	return !!tempToken;
};
