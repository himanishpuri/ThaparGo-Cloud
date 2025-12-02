const COGNITO_DOMAIN = import.meta.env.VITE_COGNITO_DOMAIN;
const COGNITO_REGION = import.meta.env.VITE_COGNITO_REGION;
const COGNITO_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID;
// const COGNITO_REDIRECT_URI = import.meta.env.VITE_COGNITO_REDIRECT_URI;

export const buildLoginUrl = () => {
	const params = new URLSearchParams({
		response_type: "code",
		client_id: COGNITO_CLIENT_ID,
		redirect_uri: `${window.location.origin}/buffer`,
		scope: "openid email",
	});

	return `https://${COGNITO_DOMAIN}.auth.${COGNITO_REGION}.amazoncognito.com/oauth2/authorize?${params.toString()}`;
};

export const buildLogoutUrl = () => {
	const params = new URLSearchParams({
		client_id: COGNITO_CLIENT_ID,
		logout_uri: window.location.origin,
	});

	return `https://${COGNITO_DOMAIN}.auth.${COGNITO_REGION}.amazoncognito.com/logout?${params.toString()}`;
};

export const LOGIN_URLS = {
	login: buildLoginUrl(),
	logout: buildLogoutUrl(),
};
