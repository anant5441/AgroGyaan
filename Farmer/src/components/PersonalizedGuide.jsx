import React from "react";
import { Leaf, Recycle, Shield, Droplets } from "lucide-react";
import { Card } from "@/components/ui/card";
import farmingProcessImage from "@/assets/farming-process-icons.jpg";

const PersonalizedGuide = () => {
  const principles = [
    {
      icon: Leaf,
      title: "Soil Health",
      description: "Build organic matter through composting and cover crops"
    },
    {
      icon: Recycle,
      title: "Natural Cycles",
      description: "Work with nature's rhythms for sustainable growth"
    },
    {
      icon: Shield,
      title: "Biodiversity",
      description: "Encourage beneficial insects and crop rotation"
    },
    {
      icon: Droplets,
      title: "Water Conservation",
      description: "Efficient irrigation and moisture retention techniques"
    }
  ];

  const process = [
    { step: 1, title: "Soil Preparation", description: "Test and amend soil with organic matter" },
    { step: 2, title: "Composting", description: "Create nutrient-rich compost from organic waste" },
    { step: 3, title: "Planting", description: "Select appropriate crops and companion plants" },
    { step: 4, title: "Natural Care", description: "Use organic pest control and fertilizers" },
    { step: 5, title: "Harvesting", description: "Collect crops at optimal ripeness" },
    { step: 6, title: "Post-Harvest", description: "Prepare soil for next growing cycle" }
  ];

  return (
    <div className="space-y-12">
      {/* Principles Section */}
      <Card className="p-8 bg-gradient-organic border-secondary">
        <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
          Organic Farming Principles for Your Region
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {principles.map((principle, index) => (
            <div
              key={index}
              className="text-center space-y-4 p-4 rounded-2xl bg-card/50 hover:bg-card/80 transition-all duration-300 animate-grow"
            >
              <div className="p-4 bg-primary/10 rounded-full mx-auto w-fit">
                <principle.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{principle.title}</h3>
              <p className="text-sm text-muted-foreground">{principle.description}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Process Timeline */}
      <Card className="p-8 bg-card border-secondary">
        <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
          Complete Organic Farming Process
        </h2>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            {process.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-300"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <img
              src={farmingProcessImage}
              alt="Organic farming process infographic"
              className="rounded-2xl shadow-warm max-w-full h-auto animate-float"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PersonalizedGuide;
  