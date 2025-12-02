import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import PoolCard from "@/components/PoolCard";
import PoolDetailModal from "@/components/PoolDetailModal";
import CreatePoolModal from "@/components/CreatePoolModal";
import OnboardingModal from "@/components/OnboardingModal";
import {
	getAllPools,
	getCurrentUser,
	getPoolById,
	isAuthenticated,
	type Pool,
} from "@/lib/api";

const Pools = () => {
	const [pools, setPools] = useState<Pool[]>([]);
	const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showOnboarding, setShowOnboarding] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const init = async () => {
			if (!isAuthenticated()) {
				navigate("/auth");
				return;
			}

			try {
				const userResponse = await getCurrentUser();
				if (!userResponse.user.hasCompletedOnboarding) {
					setShowOnboarding(true);
				}

				await loadPools();
			} catch (error) {
				console.error("Failed to load data:", error);
				setError("Failed to load pools");
			} finally {
				setLoading(false);
			}
		};

		init();
	}, [navigate]);

	const loadPools = async () => {
		try {
			const response = await getAllPools();
			setPools(response.pools);
			setError(null);
		} catch (error) {
			console.error("Failed to load pools:", error);
			toast.error("Failed to load pools");
		}
	};

	const handleCreateClick = async () => {
		try {
			const response = await getCurrentUser();
			if (!response.user.hasCompletedOnboarding) {
				setShowOnboarding(true);
				return;
			}
			setShowCreateModal(true);
		} catch (error) {
			toast.error("Please log in first");
			navigate("/auth");
		}
	};

	const handlePoolUpdate = async () => {
		await loadPools();
		if (selectedPool) {
			try {
				const response = await getPoolById(selectedPool.id);
				setSelectedPool(response.pool);
			} catch (error) {
				setSelectedPool(null);
			}
		}
	};

	const handleOnboardingComplete = () => {
		setShowOnboarding(false);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-primary-light/10">
			<Navbar />

			<div className="container mx-auto px-4 py-24">
				{loading ? (
					<div className="text-center py-20">
						<p className="text-xl text-muted-foreground">
							Loading pools...
						</p>
					</div>
				) : error ? (
					<div className="text-center py-20">
						<p className="text-xl text-destructive mb-4">{error}</p>
						<Button
							onClick={() => {
								setError(null);
								setLoading(true);
								loadPools().finally(() => setLoading(false));
							}}
						>
							Retry
						</Button>
					</div>
				) : (
					<>
						<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
							<div>
								<h1 className="text-4xl font-bold mb-2">
									Available Pools
								</h1>
								<p className="text-muted-foreground">
									Find and join rides that match your journey
								</p>
							</div>
							<Button
								onClick={handleCreateClick}
								size="lg"
							>
								<Plus className="mr-2 h-5 w-5" />
								Create Pool
							</Button>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{pools.map((pool) => (
								<PoolCard
									key={pool.id}
									pool={pool}
									onClick={() => setSelectedPool(pool)}
								/>
							))}
						</div>

						{pools.length === 0 && (
							<div className="text-center py-20">
								<p className="text-xl text-muted-foreground mb-4">
									No pools available yet
								</p>
								<Button onClick={handleCreateClick}>
									<Plus className="mr-2 h-5 w-5" />
									Create the First Pool
								</Button>
							</div>
						)}
					</>
				)}
			</div>

			<PoolDetailModal
				pool={selectedPool}
				open={!!selectedPool}
				onClose={() => setSelectedPool(null)}
				onUpdate={handlePoolUpdate}
			/>

			<CreatePoolModal
				open={showCreateModal}
				onClose={() => setShowCreateModal(false)}
				onSuccess={handlePoolUpdate}
			/>

			<OnboardingModal
				open={showOnboarding}
				onComplete={handleOnboardingComplete}
			/>
		</div>
	);
};

export default Pools;
