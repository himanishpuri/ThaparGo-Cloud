import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { googleAuth, isAuthenticated, hasTempToken } from "@/lib/api";
import { Car } from "lucide-react";
import OnboardingModal from "@/components/OnboardingModal";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

const Auth = () => {
	const [showOnboarding, setShowOnboarding] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	// Redirect if already logged in
	useEffect(() => {
		if (isAuthenticated() && !hasTempToken()) {
			navigate("/pools");
		} else if (hasTempToken()) {
			setShowOnboarding(true);
		}
	}, [navigate]);

	const handleOnboardingComplete = () => {
		setShowOnboarding(false);
		navigate("/pools");
	};

	const handleGoogleSuccess = async (
		credentialResponse: CredentialResponse,
	) => {
		try {
			if (!credentialResponse.credential) {
				toast.error("Google authentication failed");
				return;
			}

			setIsLoading(true);
			const result = await googleAuth(credentialResponse.credential);

			if (result.success) {
				if (result.requiresOnboarding || result.isNewUser) {
					toast.success(
						result.isNewUser
							? "Welcome! Please complete your profile."
							: "Please complete your profile.",
					);
					setShowOnboarding(true);
				} else {
					toast.success("Login successful!");
					navigate("/pools");
				}
			}
		} catch (error: any) {
			const message =
				error.response?.data?.error || "Failed to process Google login";
			toast.error(message);
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleError = () => {
		toast.error("Google login failed");
	};

	return (
		<div className="min-h-screen flex items-center justify-center px-4 py-20 bg-gradient-to-br from-background via-accent/5 to-primary-light/10">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center space-y-3">
					<div className="flex items-center justify-center gap-2 text-primary">
						<Car className="h-8 w-8" />
						<span className="text-2xl font-bold">Thapargo</span>
					</div>
					<CardTitle className="text-2xl">Welcome to Thapargo</CardTitle>
					<CardDescription>
						Sign in with Google to start sharing rides
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center gap-4 py-8">
						{isLoading ? (
							<div className="text-sm text-muted-foreground">
								Authenticating...
							</div>
						) : (
							<GoogleLogin
								onSuccess={handleGoogleSuccess}
								onError={handleGoogleError}
								useOneTap
							/>
						)}
					</div>
				</CardContent>
			</Card>

			<OnboardingModal
				open={showOnboarding}
				onComplete={handleOnboardingComplete}
			/>
		</div>
	);
};

export default Auth;
