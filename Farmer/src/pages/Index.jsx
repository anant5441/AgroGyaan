import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { Footer } from "@/components/footer";
import { AIAssistant } from "@/components/ai-assistant";
import { useRef } from "react";

const Index = () => {
    const featuresRef = useRef(null);
    return (
        <div className="min-h-screen bg-background">
        {/* <Navbar /> */}
        <main>
            <HeroSection featuresRef={featuresRef} />
            <FeaturesSection ref={featuresRef} />
        </main>
        <Footer />
        <AIAssistant />
        </div>
    );
};

export default Index;