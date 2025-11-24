interface CognitoTokenResponse {
	id_token: string;
	access_token: string;
	refresh_token: string;
	expires_in: number;
	token_type: string;
}

interface CognitoUserInfo {
	sub: string; // Cognito user ID
	email: string;
	email_verified: boolean;
	name?: string;
}

const COGNITO_DOMAIN = process.env.COGNITO_DOMAIN;
const COGNITO_REGION = process.env.COGNITO_REGION;
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID;
const COGNITO_REDIRECT_URI = process.env.COGNITO_REDIRECT_URI;

export const exchangeCodeForTokens = async (
	code: string,
): Promise<CognitoTokenResponse> => {
	const tokenUrl = `https://${COGNITO_DOMAIN}.auth.${COGNITO_REGION}.amazoncognito.com/oauth2/token`;

	const params = new URLSearchParams({
		grant_type: "authorization_code",
		client_id: COGNITO_CLIENT_ID!,
		code: code,
		redirect_uri: COGNITO_REDIRECT_URI!,
	});

	try {
		const response = await fetch(tokenUrl, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: params.toString(),
		});

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ error: "Unknown error" }));
			throw new Error(
				`Cognito token exchange failed: ${
					errorData.error || "Unknown error"
				}`,
			);
		}

		return await response.json();
	} catch (error: any) {
		throw new Error(
			error.message || "Failed to exchange authorization code for tokens",
		);
	}
};

export const getUserInfoFromToken = async (
	accessToken: string,
): Promise<CognitoUserInfo> => {
	const userInfoUrl = `https://${COGNITO_DOMAIN}.auth.${COGNITO_REGION}.amazoncognito.com/oauth2/userInfo`;

	try {
		const response = await fetch(userInfoUrl, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ error: "Unknown error" }));
			throw new Error(
				`Cognito user info fetch failed: ${
					errorData.error || "Unknown error"
				}`,
			);
		}

		return await response.json();
	} catch (error: any) {
		throw new Error(
			error.message || "Failed to fetch user info from Cognito",
		);
	}
};
