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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { completeOnboarding } from "@/lib/api";

interface OnboardingModalProps {
	open: boolean;
	onComplete: () => void;
}

const OnboardingModal = ({ open, onComplete }: OnboardingModalProps) => {
	const [phone, setPhone] = useState("");
	const [gender, setGender] = useState<"Male" | "Female">("Male");
	const [loading, setLoading] = useState(false);

	const handleComplete = async () => {
		if (!phone || phone.length < 10) {
			toast.error("Please enter a valid phone number");
			return;
		}

		setLoading(true);
		try {
			await completeOnboarding(phone, gender);
			toast.success("Profile completed! Welcome to Thapargo.");
			onComplete();
		} catch (error: any) {
			const message =
				error.response?.data?.error || "Failed to complete profile";
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open}>
			<DialogContent
				className="max-w-md"
				onInteractOutside={(e) => e.preventDefault()}
			>
				<DialogHeader>
					<DialogTitle>Complete Your Profile</DialogTitle>
					<DialogDescription>
						We need a few more details to get you started
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6 py-4">
					<div className="space-y-2">
						<Label htmlFor="phone">Phone Number</Label>
						<Input
							id="phone"
							type="tel"
							placeholder="+91 98765 43210"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
							maxLength={15}
						/>
					</div>

					<div className="space-y-2">
						<Label>Gender</Label>
						<RadioGroup
							value={gender}
							onValueChange={(value) =>
								setGender(value as "Male" | "Female")
							}
						>
							<div className="flex items-center space-x-2">
								<RadioGroupItem
									value="Male"
									id="male"
								/>
								<Label
									htmlFor="male"
									className="font-normal cursor-pointer"
								>
									Male
								</Label>
							</div>
							<div className="flex items-center space-x-2">
								<RadioGroupItem
									value="Female"
									id="female"
								/>
								<Label
									htmlFor="female"
									className="font-normal cursor-pointer"
								>
									Female
								</Label>
							</div>
						</RadioGroup>
					</div>

					<Button
						onClick={handleComplete}
						className="w-full"
						disabled={loading}
					>
						{loading ? "Completing..." : "Complete Profile"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default OnboardingModal;
