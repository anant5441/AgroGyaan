import React from "react";

const CropCalendarHeader = () => {
    return (
        <header 
            className="w-full"
            style={{ 
                background: "var(--gradient-agricultural)",
                boxShadow: "var(--shadow-agricultural)"
            }}
        >
            <div className="container mx-auto px-6 py-8">
                <div className="text-center">
                    <h1 
                        className="text-4xl md:text-5xl font-bold mb-4"
                        style={{ color: "white" }}
                    >
                        🌾 Interactive Crop Calendar
                    </h1>
                    <p 
                        className="text-xl max-w-2xl mx-auto"
                        style={{ color: "rgba(255, 255, 255, 0.9)" }}
                    >
                        Plan your agricultural seasons with our comprehensive crop calendar
                    </p>
                </div>
            </div>
        </header>
    );
};

export default CropCalendarHeader;