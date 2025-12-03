import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentUser, logout, isAuthenticated } from "@/lib/api";

const Navbar = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);
	const [user, setUser] = useState<any>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	useEffect(() => {
		const loadUser = async () => {
			if (isAuthenticated()) {
				try {
					const response = await getCurrentUser();
					setUser(response.user);
				} catch (error) {
					console.error("Failed to load user:", error);
					setUser(null);
				}
			}
		};

		loadUser();
	}, []);

	const handleLogout = async () => {
		try {
			await logout();
			setUser(null);
			navigate("/");
		} catch (error) {
			console.error("Logout failed:", error);
			// Still clear local state and redirect
			setUser(null);
			navigate("/");
		}
	};

	const scrollToSection = (id: string) => {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: "smooth" });
			setIsMenuOpen(false);
		} else {
			navigate("/#" + id);
		}
	};

	return (
		<nav
			className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
				isScrolled
					? "bg-background/98 backdrop-blur-lg shadow-lg"
					: "bg-background/80 backdrop-blur-sm"
			}`}
		>
			<div className="container mx-auto px-4 py-4">
				<div className="flex items-center justify-between">
					{/* Logo */}
					<Link
						to="/"
						className="flex items-center gap-2 text-xl font-bold text-primary hover:text-primary-glow transition-colors"
					>
						<Car className="h-6 w-6" />
						Thapargo
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center gap-6">
						<button
							onClick={() => scrollToSection("home")}
							className="text-foreground hover:text-primary transition-colors"
						>
							Home
						</button>
						<button
							onClick={() => scrollToSection("why-thapargo")}
							className="text-foreground hover:text-primary transition-colors"
						>
							Why Thapargo
						</button>
						<button
							onClick={() => scrollToSection("about")}
							className="text-foreground hover:text-primary transition-colors"
						>
							About
						</button>
						<button
							onClick={() => scrollToSection("faq")}
							className="text-foreground hover:text-primary transition-colors"
						>
							FAQ
						</button>
						{user && (
							<Link
								to="/pools"
								className="text-foreground hover:text-primary transition-colors"
							>
								Pools
							</Link>
						)}
						{user ? (
							<div className="flex items-center gap-3">
								<span className="text-sm text-muted-foreground">
									{user.full_name}
								</span>
								<Button
									onClick={handleLogout}
									variant="outline"
									size="sm"
								>
									Logout
								</Button>
							</div>
						) : (
							<Link to="/auth">
								<Button>Login</Button>
							</Link>
						)}
					</div>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
					>
						{isMenuOpen ? (
							<X className="h-6 w-6" />
						) : (
							<Menu className="h-6 w-6" />
						)}
					</button>
				</div>

				{/* Mobile Menu */}
				{isMenuOpen && (
					<div className="md:hidden mt-4 pb-4 pt-4 px-2 bg-background/95 backdrop-blur-lg rounded-lg shadow-lg border border-border flex flex-col gap-4 animate-fade-in">
						<button
							onClick={() => scrollToSection("home")}
							className="text-left text-foreground hover:text-primary transition-colors py-2 px-3 hover:bg-accent rounded-md"
						>
							Home
						</button>
						<button
							onClick={() => scrollToSection("why-thapargo")}
							className="text-left text-foreground hover:text-primary transition-colors py-2 px-3 hover:bg-accent rounded-md"
						>
							Why Thapargo
						</button>
						<button
							onClick={() => scrollToSection("about")}
							className="text-left text-foreground hover:text-primary transition-colors py-2 px-3 hover:bg-accent rounded-md"
						>
							About
						</button>
						<button
							onClick={() => scrollToSection("faq")}
							className="text-left text-foreground hover:text-primary transition-colors py-2 px-3 hover:bg-accent rounded-md"
						>
							FAQ
						</button>
						{user && (
							<Link
								to="/pools"
								className="text-left text-foreground hover:text-primary transition-colors py-2 px-3 hover:bg-accent rounded-md"
								onClick={() => setIsMenuOpen(false)}
							>
								Pools
							</Link>
						)}
						<div className="border-t border-border pt-3 mt-2">
							{user ? (
								<>
									<span className="text-sm text-muted-foreground px-3 block mb-3">
										{user.full_name}
									</span>
									<Button
										onClick={handleLogout}
										variant="outline"
										size="sm"
										className="w-full"
									>
										Logout
									</Button>
								</>
							) : (
								<Link
									to="/auth"
									onClick={() => setIsMenuOpen(false)}
								>
									<Button className="w-full">Login</Button>
								</Link>
							)}
						</div>
					</div>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
