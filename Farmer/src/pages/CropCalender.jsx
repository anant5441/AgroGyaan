import React, { useState } from "react";
import { Card } from "@/components/ui/card";

import CropCalendarHeader from "@/components/crop-calender-Header";
import CropCalendarLegend from "@/components/crop-calander-legend";
import CropCalendarFilters from "@/components/crop-calender-Filter";
import CropCalendarStats from "@/components/crop-calender-stats";
import CropRow from "@/components/crop-calender-row";
import "@/styles/calender.css";

const crops = [
    { crop: "Wheat", sowing: 11, harvesting: 3, type: "rabi" },
    { crop: "Rice", sowing: 6, harvesting: 10, type: "kharif" },
    { crop: "Maize", sowing: 5, harvesting: 9, type: "kharif" },
    { crop: "Barley", sowing: 11, harvesting: 4, type: "rabi" },
    { crop: "Sugarcane", sowing: 2, harvesting: 12, type: "perennial" },
    { crop: "Cotton", sowing: 6, harvesting: 11, type: "kharif" },
    { crop: "Groundnut", sowing: 6, harvesting: 10, type: "kharif" },
    { crop: "Soybean", sowing: 6, harvesting: 9, type: "kharif" },
    { crop: "Pulses", sowing: 10, harvesting: 3, type: "rabi" },
    { crop: "Mustard", sowing: 10, harvesting: 2, type: "rabi" },
    { crop: "Sunflower", sowing: 1, harvesting: 4, type: "rabi" },
    { crop: "Jute", sowing: 3, harvesting: 7, type: "kharif" }
];

const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const CropCalendar = () => {
    const [selectedCrop, setSelectedCrop] = useState("all");
    const [selectedType, setSelectedType] = useState("all");

    const filteredCrops = crops.filter(crop => {
        const cropMatch = selectedCrop === "all" || crop.crop === selectedCrop;
        const typeMatch = selectedType === "all" || crop.type === selectedType;
        return cropMatch && typeMatch;
    });

    return (
        <div 
            className="min-h-screen"
            style={{ backgroundColor: "hsl(var(--background))" }}
        >
            <CropCalendarHeader />
            <CropCalendarLegend />
            <CropCalendarFilters 
                selectedCrop={selectedCrop}
                setSelectedCrop={setSelectedCrop}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                crops={crops}
            />

            {/* Calendar */}
            <div className="container mx-auto px-6 pb-8">
                <Card 
                    className="p-6"
                    style={{
                        boxShadow: "var(--shadow-card)",
                        backgroundColor: "hsl(var(--card))",
                        color: "hsl(var(--card-foreground))"
                    }}
                >
                    <div className="space-y-4">
                        {filteredCrops.map((crop) => (
                            <CropRow
                                key={crop.crop} 
                                crop={crop} 
                                months={months}
                            />
                        ))}
                    </div>
                </Card>
            </div>

            <CropCalendarStats crops={crops} />
        </div>
    );
};

export default CropCalendar;