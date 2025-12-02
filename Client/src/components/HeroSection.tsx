import { ArrowRight, Users, Leaf, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "@/lib/api";

const HeroSection = () => {
	const navigate = useNavigate();
	const userLoggedIn = isAuthenticated();

	const handleGetStarted = () => {
		if (userLoggedIn) {
			navigate("/pools");
		} else {
			navigate("/auth");
		}
	};

	return (
		<section
			id="home"
			className="min-h-screen flex items-center justify-center pt-20 px-4"
		>
			<div className="container mx-auto text-center">
				<div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
					{/* Main Heading */}
					<h1 className="text-5xl md:text-7xl font-bold">
						<span className="text-gradient">Share the ride.</span>
						<br />
						<span className="text-gradient">Share the cost.</span>
						<br />
						<span className="text-gradient">Share the journey.</span>
					</h1>

					{/* Subtitle */}
					<p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
						Connect with fellow travelers from Thapar University. Split
						costs, reduce emissions, and make every journey better
						together.
					</p>

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
						<Dialog>
							<DialogTrigger asChild>
								<Button
									size="lg"
									className="text-lg px-8 py-6 hover-lift"
								>
									Get Started Now
									<ArrowRight className="ml-2 h-5 w-5" />
								</Button>
							</DialogTrigger>
							<DialogContent className="max-w-md">
								<DialogHeader>
									<DialogTitle>
										Ready to start your journey?
									</DialogTitle>
									<DialogDescription className="space-y-4 pt-4">
										<p>Join Thapargo today and experience:</p>
										<ul className="space-y-2 text-left">
											<li className="flex items-start gap-2">
												<Users className="h-5 w-5 text-primary mt-0.5" />
												<span>
													Connect with verified Thapar students
												</span>
											</li>
											<li className="flex items-start gap-2">
												<Shield className="h-5 w-5 text-primary mt-0.5" />
												<span>Safe and secure ride-sharing</span>
											</li>
											<li className="flex items-start gap-2">
												<Leaf className="h-5 w-5 text-success mt-0.5" />
												<span>Reduce your carbon footprint</span>
											</li>
										</ul>
										<Button
											onClick={handleGetStarted}
											className="w-full mt-4"
										>
											{userLoggedIn ? "Browse Pools" : "Sign Up Now"}
										</Button>
									</DialogDescription>
								</DialogHeader>
							</DialogContent>
						</Dialog>

						<Button
							size="lg"
							variant="outline"
							className="text-lg px-8 py-6"
							onClick={() => {
								document
									.getElementById("why-thapargo")
									?.scrollIntoView({ behavior: "smooth" });
							}}
						>
							Learn More
						</Button>
					</div>

					{/* Stats */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 max-w-3xl mx-auto">
						<div className="space-y-2">
							<div className="text-4xl font-bold text-primary">500+</div>
							<div className="text-sm text-muted-foreground">
								Active Users
							</div>
						</div>
						<div className="space-y-2">
							<div className="text-4xl font-bold text-secondary">
								1000+
							</div>
							<div className="text-sm text-muted-foreground">
								Rides Shared
							</div>
						</div>
						<div className="space-y-2">
							<div className="text-4xl font-bold text-success">30%</div>
							<div className="text-sm text-muted-foreground">
								Cost Savings
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HeroSection;
