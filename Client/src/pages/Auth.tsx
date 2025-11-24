import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isAuthenticated, hasTempToken } from "@/lib/api";
import { Car } from "lucide-react";
import { buildLoginUrl } from "@/utils/cognitoUrls";

const Auth = () => {
	const navigate = useNavigate();

	// Redirect if already logged in
	useEffect(() => {
		if (isAuthenticated() && !hasTempToken()) {
			navigate("/pools");
		}
	}, [navigate]);

	const handleLogin = () => {
		window.location.href = buildLoginUrl();
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
					<CardDescription>Sign in to start sharing rides</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col items-center gap-4 py-8">
						<Button
							onClick={handleLogin}
							className="w-full"
							size="lg"
						>
							Sign In / Sign Up
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default Auth;
