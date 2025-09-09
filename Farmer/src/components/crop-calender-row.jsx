import React from "react";
import { Badge } from "./ui/badge";

const CropRow = ({ crop, months }) => {
    const getCropRow = () => {
        const row = Array(12).fill("");
        const start = crop.sowing;
        const end = crop.harvesting < start ? crop.harvesting + 12 : crop.harvesting;

        for (let i = start; i <= end; i++) {
            const monthIndex = i > 12 ? i - 12 : i;
            const actualIndex = monthIndex - 1;
            
            if (i === start) {
                row[actualIndex] = "sowing";
            } else if (i === end) {
                row[actualIndex] = "harvesting";
            } else {
                row[actualIndex] = "growing";
            }
        }
        return row;
    };

    const getCellStyle = (cellType) => {
        switch (cellType) {
            case "sowing":
                return {
                    background: "var(--gradient-sowing)",
                    color: "hsl(var(--agricultural-primary))",
                    fontWeight: "600"
                };
            case "harvesting":
                return {
                    background: "var(--gradient-harvest)",
                    color: "white",
                    fontWeight: "600"
                };
            case "growing":
                return {
                    backgroundColor: "hsl(var(--agricultural-growing))",
                    color: "white"
                };
            default:
                return {
                    backgroundColor: "rgba(0, 0, 0, 0.05)",
                };
        }
    };

    const getCellContent = (cellType) => {
        switch (cellType) {
            case "sowing":
                return "🌱";
            case "harvesting":
                return "🌾";
            case "growing":
                return "🟢";
            default:
                return "";
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case "kharif":
                return { backgroundColor: "hsl(var(--agricultural-growing))" };
            case "rabi":
                return { backgroundColor: "hsl(var(--agricultural-harvest))" };
            case "perennial":
                return { backgroundColor: "hsl(var(--agricultural-accent))" };
            default:
                return { backgroundColor: "hsl(var(--muted))" };
        }
    };

    const cropRow = getCropRow();

    return (
        <div className="mb-6">
            {/* Crop Name Header */}
            <div className="mb-3">
                <div 
                    className="flex items-center gap-3 p-4 border rounded-lg"
                    style={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "",
                    }}
                >
                    <span 
                        className="font-bold text-lg"
                        style={{ color: "hsl(var(--card-foreground))" }}
                    >
                        {crop.crop}
                    </span>
                    <Badge 
                        className="text-xs text-white"
                        variant="secondary"
                        style={getTypeColor(crop.type)}
                    >
                        {crop.type}
                    </Badge>
                </div>
            </div>

            {/* Month Bars */}
            <div className="grid grid-cols-12 gap-2">
                {cropRow.map((cellType, monthIndex) => (
                    <div
                        key={monthIndex}
                        className="relative min-h-[80px] rounded-lg transition-all duration-200 hover:scale-105"
                        style={getCellStyle(cellType)}
                    >
                        {/* Month Name */}
                        <div className="absolute top-1 left-0 right-0 text-center">
                            <span 
                                className="text-xs font-medium opacity-75"
                                style={{ color: cellType ? "inherit" : "hsl(var(--muted-foreground))" }}
                            >
                                {months[monthIndex]}
                            </span>
                        </div>
                        
                        {/* Content */}
                        <div className="flex items-center justify-center h-full">
                            <div className="text-2xl">
                                {getCellContent(cellType)}
                            </div>
                        </div>
                        
                        {/* Activity Label */}
                        {cellType && (
                            <div className="absolute bottom-1 left-0 right-0 text-center">
                                <span className="text-xs font-medium opacity-90">
                                    {cellType === "sowing" ? "Sow" : cellType === "harvesting" ? "Harvest" : "Grow"}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CropRow;