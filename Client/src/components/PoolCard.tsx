import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Car,
	Bike,
	Plane,
	Ship,
	Train,
	Bus,
	MapPin,
	Clock,
	Users,
	IndianRupee,
} from "lucide-react";
import { type Pool } from "@/lib/api";
import { format } from "date-fns";

interface PoolCardProps {
	pool: Pool;
	onClick: () => void;
}

const transportIcons = {
	Car: Car,
	Bike: Bike,
	Plane: Plane,
	Ferry: Ship,
	Train: Train,
	Bus: Bus,
};

const PoolCard = ({ pool, onClick }: PoolCardProps) => {
	const TransportIcon = transportIcons[pool.transport_mode];
	const isFull = pool.current_persons >= pool.total_persons;

	return (
		<Card
			className="hover-lift cursor-pointer border-border bg-gradient-to-br from-card to-accent/5"
			onClick={onClick}
		>
			<CardContent className="p-6 space-y-4">
				{/* Header */}
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-2">
						<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
							<TransportIcon className="h-5 w-5 text-primary" />
						</div>
						<div className="text-sm">
							<div className="font-medium capitalize">
								{pool.transport_mode}
							</div>
							<div className="text-muted-foreground text-xs">
								by {pool.creator.full_name}
							</div>
						</div>
					</div>
					{pool.is_female_only && (
						<Badge
							variant="secondary"
							className="bg-pink-100 text-pink-700 border-pink-200"
						>
							Female Only
						</Badge>
					)}
				</div>

				{/* Route */}
				<div className="space-y-2">
					<div className="flex items-start gap-2">
						<MapPin className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
						<span className="text-sm font-medium">
							{pool.start_point}
						</span>
					</div>
					<div className="flex items-start gap-2">
						<MapPin className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
						<span className="text-sm font-medium">{pool.end_point}</span>
					</div>
				</div>

				{/* Time */}
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Clock className="h-4 w-4" />
					<span>
						{format(new Date(pool.departure_time), "MMM dd, HH:mm")}
					</span>
				</div>

				{/* Footer */}
				<div className="flex items-center justify-between pt-2 border-t border-border">
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-1 text-sm">
							<Users className="h-4 w-4 text-muted-foreground" />
							<span
								className={isFull ? "text-destructive font-medium" : ""}
							>
								{pool.current_persons}/{pool.total_persons}
							</span>
						</div>
						<div className="flex items-center gap-1 text-sm font-semibold text-primary">
							<IndianRupee className="h-4 w-4" />
							{pool.fare_per_head}
						</div>
					</div>
					{isFull && (
						<Badge
							variant="destructive"
							className="text-xs"
						>
							Full
						</Badge>
					)}
				</div>
			</CardContent>
		</Card>
	);
};

export default PoolCard;
