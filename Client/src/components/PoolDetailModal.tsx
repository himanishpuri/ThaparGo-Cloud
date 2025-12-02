import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Car,
	Bike,
	Plane,
	Ship,
	Train,
	Bus,
	MapPin,
	Users,
	IndianRupee,
	User,
} from "lucide-react";
import { type Pool, joinPool, leavePool, getCurrentUser } from "@/lib/api";
import { format } from "date-fns";
import { toast } from "sonner";

interface PoolDetailModalProps {
	pool: Pool | null;
	open: boolean;
	onClose: () => void;
	onUpdate: () => void;
}

const transportIcons: Record<string, any> = {
	Car: Car,
	Bike: Bike,
	Plane: Plane,
	Ferry: Ship,
	Train: Train,
	Bus: Bus,
};

const PoolDetailModal = ({
	pool,
	open,
	onClose,
	onUpdate,
}: PoolDetailModalProps) => {
	const [currentUser, setCurrentUser] = useState<any>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const loadUser = async () => {
			try {
				const response = await getCurrentUser();
				setCurrentUser(response.user);
			} catch (error) {
				console.error("Failed to load user:", error);
			}
		};

		if (open) {
			loadUser();
		}
	}, [open]);

	if (!pool) return null;

	const TransportIcon = transportIcons[pool.transport_mode];
	const isMember = pool.members.some((m) => m.user.id === currentUser?.id);
	const isFull = pool.current_persons >= pool.total_persons;
	const isCreator = pool.members.find(
		(m) => m.user.id === currentUser?.id,
	)?.is_creator;

	const handleJoin = async () => {
		setLoading(true);
		try {
			await joinPool(pool.id);
			toast.success("Successfully joined the pool!");
			onUpdate();
		} catch (error: any) {
			const message = error.response?.data?.error || "Failed to join pool";
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	const handleLeave = async () => {
		setLoading(true);
		try {
			await leavePool(pool.id);
			toast.success("Left the pool");
			onUpdate();
		} catch (error: any) {
			const message = error.response?.data?.error || "Failed to leave pool";
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onClose}
		>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<div className="flex items-center gap-3 mb-2">
						<div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
							<TransportIcon className="h-6 w-6 text-primary" />
						</div>
						<div>
							<DialogTitle className="capitalize">
								{pool.transport_mode} Pool
							</DialogTitle>
							<DialogDescription>
								Created by {pool.creator.full_name}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-6">
					{/* Badges */}
					<div className="flex gap-2">
						{pool.is_female_only && (
							<Badge
								variant="secondary"
								className="bg-pink-100 text-pink-700 border-pink-200"
							>
								Female Only
							</Badge>
						)}
						{isFull && <Badge variant="destructive">Full</Badge>}
						{isMember && (
							<Badge className="bg-success">You're in this pool</Badge>
						)}
					</div>

					{/* Route */}
					<div className="space-y-3">
						<h3 className="font-semibold">Route</h3>
						<div className="space-y-2 pl-4 border-l-2 border-primary">
							<div className="flex items-start gap-2">
								<MapPin className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
								<div>
									<div className="text-sm font-medium">
										{pool.start_point}
									</div>
									<div className="text-xs text-muted-foreground">
										{format(
											new Date(pool.departure_time),
											"MMM dd, yyyy • HH:mm",
										)}
									</div>
								</div>
							</div>
							<div className="flex items-start gap-2">
								<MapPin className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
								<div>
									<div className="text-sm font-medium">
										{pool.end_point}
									</div>
									<div className="text-xs text-muted-foreground">
										{format(
											new Date(pool.arrival_time),
											"MMM dd, yyyy • HH:mm",
										)}
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Stats */}
					<div className="grid grid-cols-2 gap-4">
						<div className="flex items-center gap-2 text-sm">
							<Users className="h-4 w-4 text-muted-foreground" />
							<span>
								{pool.current_persons} / {pool.total_persons} seats
							</span>
						</div>
						<div className="flex items-center gap-2 text-sm font-semibold text-primary">
							<IndianRupee className="h-4 w-4" />
							{pool.fare_per_head} per person
						</div>
					</div>

					{/* Members */}
					<div className="space-y-3">
						<h3 className="font-semibold">Members</h3>
						<div className="space-y-2">
							{pool.members.map((member) => (
								<div
									key={member.id}
									className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
								>
									<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
										<User className="h-4 w-4 text-primary" />
									</div>
									<div className="flex-1">
										<div className="text-sm font-medium">
											{member.user.full_name}
										</div>
										<div className="text-xs text-muted-foreground">
											{member.user.gender}
										</div>
									</div>
									{member.is_creator && (
										<Badge
											variant="outline"
											className="text-xs"
										>
											Creator
										</Badge>
									)}
								</div>
							))}
						</div>
					</div>

					{/* Actions */}
					<div className="flex gap-2 pt-4">
						{!isMember && !isFull && (
							<Button
								onClick={handleJoin}
								className="flex-1"
								disabled={loading}
							>
								{loading ? "Joining..." : "Join Pool"}
							</Button>
						)}
						{isMember && !isCreator && (
							<Button
								onClick={handleLeave}
								variant="destructive"
								className="flex-1"
								disabled={loading}
							>
								{loading ? "Leaving..." : "Leave Pool"}
							</Button>
						)}
						{isCreator && (
							<div className="flex-1 text-sm text-muted-foreground text-center py-2">
								You created this pool
							</div>
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default PoolDetailModal;
