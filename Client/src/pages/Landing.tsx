import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import WhyThapargoSection from "@/components/WhyThapargoSection";
import AboutSection from "@/components/AboutSection";
import FAQSection from "@/components/FAQSection";

const Landing = () => {
	return (
		<div className="min-h-screen">
			<Navbar />
			<HeroSection />
			<WhyThapargoSection />
			<AboutSection />
			<FAQSection />
			<Footer />
		</div>
	);
};

export default Landing;
