import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { Footer } from "@/components/footer";
import { AIAssistant } from "@/components/ai-assistant";

const Index = () => {
    return (
        <div className="min-h-screen bg-background">
        {/* <Navbar /> */}
        <main>
            <HeroSection />
            <FeaturesSection />
        </main>
        <Footer />
        <AIAssistant />
        </div>
    );
};

export default Index;