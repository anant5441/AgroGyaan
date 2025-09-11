import React from "react";
import { MapPin, Cloud, Mountain } from "lucide-react";
import { Card } from "@/components/ui/card";

const LocationDisplay = () => {
  // Mock data - in real app this would come from geolocation API
  const locationData = {
    region: "Northern California",
    weather: "Mediterranean Climate - Dry summers, mild winters",
    soilType: "Clay Loam - Well-draining, fertile soil",
    temperature: "22°C",
    humidity: "65%",
    coordinates: "37.7749° N, 122.4194° W"
  };

  return (
    <div className="w-full mt-4 bg-gradient-to-tr from-farmgreen to-farmpink p-8 rounded-3xl shadow-earth">
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-secondary hover:shadow-organic transition-all duration-300 animate-grow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Location</h3>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-primary">{locationData.region}</p>
            <p className="text-sm text-muted-foreground">{locationData.coordinates}</p>
          </div>
        </Card>

        <Card className="p-6 bg-card/80 backdrop-blur-sm border-secondary hover:shadow-organic transition-all duration-300 animate-grow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-accent/10 rounded-full">
              <Cloud className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Weather</h3>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-accent">{locationData.weather}</p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Temp: {locationData.temperature}</span>
              <span>Humidity: {locationData.humidity}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card/80 backdrop-blur-sm border-secondary hover:shadow-organic transition-all duration-300 animate-grow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-lime/10 rounded-full">
              <Mountain className="h-6 w-6 text-lime" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Soil Type</h3>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-lime">{locationData.soilType}</p>
            <p className="text-sm text-muted-foreground">pH: 6.5-7.0 (Ideal for most crops)</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LocationDisplay;

