import { useState } from "react";
import { Leaf } from "lucide-react";
import LocationDisplay from "@/components/LocationDisplay";
import PersonalizedGuide from "@/components/PersonalizedGuide";
import CropSelector from "@/components/CropSelector";
import CropGuide from "@/components/CropGuide";
import NearbyShops from "@/components/NearbyShops";
import heroImage from "@/assets/hero-agriculture.jpg";
import "@/styles/organic.css";

const OrganicFarmingGuide = () => {
  const [selectedCrop, setSelectedCrop] = useState("");

  const handleCropSelect = (crop) => {
    setSelectedCrop(crop);
    // Smooth scroll to crop guide section
    setTimeout(() => {
      const cropGuideElement = document.getElementById("crop-guide");
      if (cropGuideElement) {
        cropGuideElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/95"></div>
        </div>

        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-4 bg-primary/10 rounded-full animate-pulse-organic">
                <Leaf className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold text-foreground">
                Organic Farming Guide
              </h1>
            </div>

            <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Your personalized journey to sustainable agriculture. Get
              location-based guidance, crop-specific advice, and connect with
              local organic suppliers.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 space-y-16 pb-16">
        {/* Location Information */}
        <section>
          <LocationDisplay />
        </section>

        {/* Personalized Guide */}
        <section>
          <PersonalizedGuide />
        </section>

        {/* Crop Selection */}
        <section>
          <CropSelector onCropSelect={handleCropSelect} />
        </section>

        {/* Crop-Specific Guide */}
        {selectedCrop && (
          <section id="crop-guide">
            <CropGuide crop={selectedCrop} />
          </section>
        )}

        {/* Nearby Shops */}
        <section>
          <NearbyShops />
        </section>
      </div>
    </div>
  );
};

export default OrganicFarmingGuide;
