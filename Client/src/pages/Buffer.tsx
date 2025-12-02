import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { cognitoAuth } from "@/lib/api/auth.api";
import OnboardingModal from "@/components/OnboardingModal";

const Buffer = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [showOnboarding, setShowOnboarding] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const handleCallback = async () => {
			// Check for errors from Cognito first
			const cognitoError = searchParams.get("error");
			const errorDescription = searchParams.get("error_description");

			if (cognitoError) {
				const errorMsg = errorDescription
					? `${cognitoError}: ${decodeURIComponent(errorDescription)}`
					: cognitoError;
				console.error("Cognito OAuth error:", errorMsg);
				setError(errorMsg);
				setTimeout(() => navigate("/auth"), 3000);
				return;
			}

			const code = searchParams.get("code");

			if (!code) {
				setError("No authorization code received");
				setTimeout(() => navigate("/auth"), 2000);
				return;
			}

			try {
				const response = await cognitoAuth(code);

				if (response.success) {
					if (response.isNewUser || response.requiresOnboarding) {
						setShowOnboarding(true);
					} else {
						navigate("/pools");
					}
				} else {
					setError("Authentication failed");
					setTimeout(() => navigate("/auth"), 2000);
				}
			} catch (err) {
				console.error("Cognito auth error:", err);
				setError("An error occurred during authentication");
				setTimeout(() => navigate("/auth"), 2000);
			}
		};

		handleCallback();
	}, [searchParams, navigate]);

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<h2 className="text-2xl font-semibold text-red-600 mb-2">
						Authentication Error
					</h2>
					<p className="text-gray-600">{error}</p>
					<p className="text-sm text-gray-500 mt-2">
						Redirecting to login...
					</p>
				</div>
			</div>
		);
	}

	if (showOnboarding) {
		return (
			<OnboardingModal
				open={showOnboarding}
				onComplete={() => {
					setShowOnboarding(false);
					navigate("/pools");
				}}
			/>
		);
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
				<p className="text-gray-600">Completing authentication...</p>
			</div>
		</div>
	);
};

export default Buffer;
