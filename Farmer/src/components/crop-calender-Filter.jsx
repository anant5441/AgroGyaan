    import React from "react";
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
    import { Card } from "./ui/card";

    const CropCalendarFilters = ({ 
        selectedCrop, 
        setSelectedCrop, 
        selectedType, 
        setSelectedType, 
        crops 
    }) => {
        return (
            <div className="container mx-auto px-6 pb-4">
                <Card 
                    className="p-4" 
                    style={{ 
                        boxShadow: "var(--shadow-card)",
                        backgroundColor: "hsl(var(--card))",
                        color: "hsl(var(--card-foreground))"
                    }}
                >
                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        {/* Filter by Crop */}
                        <div className="flex-1">
                            <div className="flex items-center  gap-3">
                                <label 
                                    className="text-sm font-medium whitespace-nowrap"
                                    style={{ color: "hsl(var(--foreground))" }}
                                >
                                    Filter by Crop
                                </label>
                                <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                                    <SelectTrigger 
                                        className="w-[250px]"
                                        style={{ 
                                            backgroundColor: "hsl(var(--background))",
                                            borderColor: "hsl(var(--border))",
                                            color: "hsl(var(--foreground))"
                                        }}
                                    >
                                        <SelectValue placeholder="All Crops" />
                                    </SelectTrigger>
                                    <SelectContent 
                                        style={{ 
                                            backgroundColor: "white",
                                            borderColor: "hsl(var(--border))",
                                            color: "green"
                                        }}
                                    >
                                        <SelectItem value="all">All Crops</SelectItem>
                                        {crops.map((crop) => (
                                            <SelectItem 
                                                key={crop.crop} 
                                                value={crop.crop}
                                                
                                            >
                                                {crop.crop}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Filter by Season Type */}
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <label 
                                    className="text-sm font-medium whitespace-nowrap"
                                    style={{ color: "hsl(var(--foreground))" }}
                                >
                                    Filter by Season Type
                                </label>
                                <Select value={selectedType} onValueChange={setSelectedType}>
                                    <SelectTrigger
                                        className="w-[250px]"
                                        style={{ 
                                            backgroundColor: "#hsl(var(--background))",
                                            borderColor: "hsl(var(--border))",
                                            color: "hsl(var(--foreground))"
                                        }}
                                    >
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent
                                        style={{ 
                                            backgroundColor: "white",
                                            borderColor: "hsl(var(--border))",
                                            color: "green"
                                        }}
                                    >
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="kharif">Kharif (Monsoon)</SelectItem>
                                        <SelectItem value="rabi">Rabi (Winter)</SelectItem>
                                        <SelectItem value="perennial">Perennial</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        );
    };

    export default CropCalendarFilters;