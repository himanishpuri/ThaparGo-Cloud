import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { createPool, type CreatePoolRequest } from "@/lib/api";

type TransportMode = "Car" | "Bike" | "Train" | "Bus" | "Plane" | "Ferry";

interface CreatePoolModalProps {
	open: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

const CreatePoolModal = ({
	open,
	onClose,
	onSuccess,
}: CreatePoolModalProps) => {
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		start_point: "",
		end_point: "",
		departure_time: "",
		arrival_time: "",
		transport_mode: "Car" as TransportMode,
		total_persons: 4,
		fare_per_head: "",
		is_female_only: false,
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!formData.start_point || !formData.end_point) {
			toast.error("Please fill in start and end points");
			return;
		}

		if (!formData.departure_time || !formData.arrival_time) {
			toast.error("Please fill in departure and arrival times");
			return;
		}

		if (
			new Date(formData.departure_time) >= new Date(formData.arrival_time)
		) {
			toast.error("Arrival time must be after departure time");
			return;
		}

		if (!formData.fare_per_head || parseFloat(formData.fare_per_head) <= 0) {
			toast.error("Please enter a valid fare");
			return;
		}

		if (formData.total_persons < 2) {
			toast.error("Pool must have at least 2 seats");
			return;
		}

		setLoading(true);
		try {
			const farePerHead = parseFloat(formData.fare_per_head);
			const totalFare = farePerHead * formData.total_persons;

			const poolData: CreatePoolRequest = {
				start_point: formData.start_point,
				end_point: formData.end_point,
				departure_time: formData.departure_time,
				arrival_time: formData.arrival_time,
				transport_mode: formData.transport_mode,
				total_persons: formData.total_persons,
				total_fare: totalFare,
				is_female_only: formData.is_female_only,
			};

			await createPool(poolData);
			toast.success("Pool created successfully!");
			onSuccess();
			onClose();

			// Reset form
			setFormData({
				start_point: "",
				end_point: "",
				departure_time: "",
				arrival_time: "",
				transport_mode: "Car",
				total_persons: 4,
				fare_per_head: "",
				is_female_only: false,
			});
		} catch (error: any) {
			const message = error.response?.data?.error || "Failed to create pool";
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
			<DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create a New Pool</DialogTitle>
					<DialogDescription>
						Fill in the details to create your ride pool
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={handleSubmit}
					className="space-y-4"
				>
					<div className="space-y-2">
						<Label htmlFor="start_point">Start Point</Label>
						<Input
							id="start_point"
							placeholder="e.g., Thapar University"
							value={formData.start_point}
							onChange={(e) =>
								setFormData({
									...formData,
									start_point: e.target.value,
								})
							}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="end_point">End Point</Label>
						<Input
							id="end_point"
							placeholder="e.g., Chandigarh"
							value={formData.end_point}
							onChange={(e) =>
								setFormData({ ...formData, end_point: e.target.value })
							}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="departure_time">Departure</Label>
							<Input
								id="departure_time"
								type="datetime-local"
								value={formData.departure_time}
								onChange={(e) =>
									setFormData({
										...formData,
										departure_time: e.target.value,
									})
								}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="arrival_time">Arrival</Label>
							<Input
								id="arrival_time"
								type="datetime-local"
								value={formData.arrival_time}
								onChange={(e) =>
									setFormData({
										...formData,
										arrival_time: e.target.value,
									})
								}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="transport_mode">Transport Mode</Label>
						<Select
							value={formData.transport_mode}
							onValueChange={(value: TransportMode) =>
								setFormData({ ...formData, transport_mode: value })
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Car">Car</SelectItem>
								<SelectItem value="Bike">Bike</SelectItem>
								<SelectItem value="Train">Train</SelectItem>
								<SelectItem value="Bus">Bus</SelectItem>
								<SelectItem value="Plane">Plane</SelectItem>
								<SelectItem value="Ferry">Ferry</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="total_persons">Total Seats</Label>
							<Input
								id="total_persons"
								type="number"
								min="2"
								max="10"
								value={formData.total_persons}
								onChange={(e) =>
									setFormData({
										...formData,
										total_persons: parseInt(e.target.value),
									})
								}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="fare_per_head">Fare Per Person (₹)</Label>
							<Input
								id="fare_per_head"
								type="number"
								min="0"
								step="0.01"
								placeholder="200.00"
								value={formData.fare_per_head}
								onChange={(e) =>
									setFormData({
										...formData,
										fare_per_head: e.target.value,
									})
								}
							/>
						</div>
					</div>

					<div className="flex items-center space-x-2">
						<Checkbox
							id="is_female_only"
							checked={formData.is_female_only}
							onCheckedChange={(checked) =>
								setFormData({
									...formData,
									is_female_only: checked as boolean,
								})
							}
						/>
						<Label
							htmlFor="is_female_only"
							className="font-normal cursor-pointer"
						>
							Female-only pool
						</Label>
					</div>

					<div className="flex gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							className="flex-1"
							disabled={loading}
						>
							Cancel
						</Button>
						<Button
							type="submit"
							className="flex-1"
							disabled={loading}
						>
							{loading ? "Creating..." : "Create Pool"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default CreatePoolModal;
