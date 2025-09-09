import React from "react";
import { Card } from "@/components/ui/card";

const CropCalendarLegend = () => {
    return (
        <div className="container mx-auto px-6 py-6 w-9xl">
        <Card 
            className="p-6" 
            style={{ 
            boxShadow: "var(--shadow-card)",
            backgroundColor: "hsl(var(--card))",
            color: "hsl(var(--card-foreground))"
            }}
        >
            <h3 className="text-lg font-semibold text-left">Legend</h3>
            <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
                <div 
                className="w-6 h-6 rounded-md"
                style={{ background: "var(--gradient-sowing)" }}
                ></div>
                <span className="text-sm">🌱 Sowing Season</span>
            </div>
            <div className="flex items-center gap-2">
                <div 
                className="w-6 h-6 rounded-md"
                style={{ backgroundColor: "hsl(var(--agricultural-growing))" }}
                ></div>
                <span className="text-sm">🟢 Growing Period</span>
            </div>
            <div className="flex items-center gap-2">
                <div 
                className="w-6 h-6 rounded-md"
                style={{ background: "var(--gradient-harvest)" }}
                ></div>
                <span className="text-sm">🌾 Harvesting Season</span>
            </div>
            </div>
        </Card>
        </div>
    );
};

export default CropCalendarLegend;