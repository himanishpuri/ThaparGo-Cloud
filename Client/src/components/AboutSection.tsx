import { Target, Heart, Zap } from "lucide-react";

const AboutSection = () => {
	return (
		<section
			id="about"
			className="py-20 px-4 bg-muted/30"
		>
			<div className="container mx-auto max-w-4xl">
				<div className="text-center mb-12 animate-fade-in">
					<h2 className="text-4xl md:text-5xl font-bold mb-4">
						About Thapargo
					</h2>
					<p className="text-xl text-muted-foreground">
						Born from the Thapar spirit, built for the community
					</p>
				</div>

				<div className="space-y-12">
					{/* Story */}
					<div className="prose prose-lg mx-auto text-muted-foreground">
						<p>
							Thapargo was created by students, for students. We
							understand the challenges of commuting to and from campus -
							the costs, the carbon footprint, and sometimes, the
							loneliness of solo travel.
						</p>
						<p>
							Our platform brings together the Thapar community to make
							every journey more affordable, sustainable, and social.
							Whether you're heading home for the weekend, going to
							Chandigarh for shopping, or traveling to Delhi for an
							internship, Thapargo connects you with fellow Thaparites
							going your way.
						</p>
					</div>

					{/* Values */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
						<div className="text-center space-y-3">
							<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
								<Target className="h-8 w-8 text-primary" />
							</div>
							<h3 className="text-xl font-semibold">Our Mission</h3>
							<p className="text-sm text-muted-foreground">
								Make campus travel affordable, safe, and eco-friendly
								for every student
							</p>
						</div>

						<div className="text-center space-y-3">
							<div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto">
								<Heart className="h-8 w-8 text-secondary" />
							</div>
							<h3 className="text-xl font-semibold">Our Values</h3>
							<p className="text-sm text-muted-foreground">
								Community first, safety always, sustainability matters
							</p>
						</div>

						<div className="text-center space-y-3">
							<div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
								<Zap className="h-8 w-8 text-success" />
							</div>
							<h3 className="text-xl font-semibold">Our Vision</h3>
							<p className="text-sm text-muted-foreground">
								Transform how students travel, one shared ride at a time
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default AboutSection;
