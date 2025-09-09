import React from "react";
import { Card } from "@/components/ui/card";

const CropCalendarStats = ({ crops }) => {
    return (
        <div className="container mx-auto px-6 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card 
                    className="p-6 text-center"
                    style={{
                        boxShadow: "var(--shadow-card)",
                        backgroundColor: "hsl(var(--card))",
                        color: "hsl(var(--card-foreground))"
                    }}
                >
                    <div 
                        className="text-2xl font-bold mb-2"
                        style={{ color: "hsl(var(--agricultural-primary))" }}
                    >
                        {crops.filter(c => c.type === 'kharif').length}
                    </div>
                    <div style={{ color: "hsl(var(--muted-foreground))" }}>
                        Kharif Crops
                    </div>
                </Card>
                <Card 
                    className="p-6 text-center"
                    style={{
                        boxShadow: "var(--shadow-card)",
                        backgroundColor: "hsl(var(--card))",
                        color: "hsl(var(--card-foreground))"
                    }}
                >
                    <div 
                        className="text-2xl font-bold mb-2"
                        style={{ color: "hsl(var(--agricultural-harvest))" }}
                    >
                        {crops.filter(c => c.type === 'rabi').length}
                    </div>
                    <div style={{ color: "hsl(var(--muted-foreground))" }}>
                        Rabi Crops
                    </div>
                </Card>
                <Card 
                    className="p-6 text-center"
                    style={{
                        boxShadow: "var(--shadow-card)",
                        backgroundColor: "hsl(var(--card))",
                        color: "hsl(var(--card-foreground))"
                    }}
                >
                    <div 
                        className="text-2xl font-bold mb-2"
                        style={{ color: "hsl(var(--agricultural-accent))" }}
                    >
                        {crops.filter(c => c.type === 'perennial').length}
                    </div>
                    <div style={{ color: "hsl(var(--muted-foreground))" }}>
                        Perennial Crops
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CropCalendarStats;