// import React from "react";
// import { Leaf, Recycle, Shield, Droplets } from "lucide-react";
// import { Card } from "@/components/ui/card";
// import farmingProcessImage from "@/assets/farming-process-icons.jpg";

// const PersonalizedGuide = () => {
//   const principles = [
//     {
//       icon: Leaf,
//       title: "Soil Health",
//       description: "Build organic matter through composting and cover crops"
//     },
//     {
//       icon: Recycle,
//       title: "Natural Cycles",
//       description: "Work with nature's rhythms for sustainable growth"
//     },
//     {
//       icon: Shield,
//       title: "Biodiversity",
//       description: "Encourage beneficial insects and crop rotation"
//     },
//     {
//       icon: Droplets,
//       title: "Water Conservation",
//       description: "Efficient irrigation and moisture retention techniques"
//     }
//   ];

//   const process = [
//     { step: 1, title: "Soil Preparation", description: "Test and amend soil with organic matter" },
//     { step: 2, title: "Composting", description: "Create nutrient-rich compost from organic waste" },
//     { step: 3, title: "Planting", description: "Select appropriate crops and companion plants" },
//     { step: 4, title: "Natural Care", description: "Use organic pest control and fertilizers" },
//     { step: 5, title: "Harvesting", description: "Collect crops at optimal ripeness" },
//     { step: 6, title: "Post-Harvest", description: "Prepare soil for next growing cycle" }
//   ];

//   return (
//     <div className="space-y-12">
//       {/* Principles Section */}
//       <Card className="p-8 bg-gradient-organic border-secondary">
//         <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
//           Organic Farming Principles for Your Region
//         </h2>
//         <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//           {principles.map((principle, index) => (
//             <div
//               key={index}
//               className="text-center space-y-4 p-4 rounded-2xl bg-card/50 hover:bg-card/80 transition-all duration-300 animate-grow"
//             >
//               <div className="p-4 bg-primary/10 rounded-full mx-auto w-fit">
//                 <principle.icon className="h-8 w-8 text-primary" />
//               </div>
//               <h3 className="text-lg font-semibold text-foreground">{principle.title}</h3>
//               <p className="text-sm text-muted-foreground">{principle.description}</p>
//             </div>
//           ))}
//         </div>
//       </Card>

//       {/* Process Timeline */}
//       <Card className="p-8 bg-card border-secondary">
//         <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
//           Complete Organic Farming Process
//         </h2>

//         <div className="grid lg:grid-cols-2 gap-8 items-center">
//           <div className="space-y-6">
//             {process.map((item, index) => (
//               <div
//                 key={index}
//                 className="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-300"
//               >
//                 <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
//                   {item.step}
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-foreground mb-1">{item.title}</h3>
//                   <p className="text-muted-foreground">{item.description}</p>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="flex justify-center">
//             <img
//               src={farmingProcessImage}
//               alt="Organic farming process infographic"
//               className="rounded-2xl shadow-warm max-w-full h-auto animate-float"
//             />
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// };

// export default PersonalizedGuide;
  
// import React, { useState, useEffect } from "react";
// import { Leaf, Recycle, Shield, Droplets, Loader2 } from "lucide-react";
// import { Card } from "@/components/ui/card";
// import farmingProcessImage from "@/assets/farming-process-icons.jpg";

// const PersonalizedGuide = ({ location = "Punjab" }) => {
//   const [principles, setPrinciples] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchOrganicGuide = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         const response = await fetch(
//           `http://127.0.0.1:8000/guide-region?location=${encodeURIComponent(location)}`
//         );
        
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
        
//         const data = await response.json();
        
//         if (data.guide && Array.isArray(data.guide)) {
//           setPrinciples(data.guide);
//         } else {
//           throw new Error("Invalid response format");
//         }
//       } catch (err) {
//         setError(err.message);
//         console.error("Error fetching organic guide:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrganicGuide();
//   }, [location]);

//   const process = [
//     { step: 1, title: "Soil Preparation", description: "Test and amend soil with organic matter" },
//     { step: 2, title: "Composting", description: "Create nutrient-rich compost from organic waste" },
//     { step: 3, title: "Planting", description: "Select appropriate crops and companion plants" },
//     { step: 4, title: "Natural Care", description: "Use organic pest control and fertilizers" },
//     { step: 5, title: "Harvesting", description: "Collect crops at optimal ripeness" },
//     { step: 6, title: "Post-Harvest", description: "Prepare soil for next growing cycle" }
//   ];

//   // Function to render emoji icons
//   const renderIcon = (iconEmoji) => {
//     return <span className="text-2xl">{iconEmoji}</span>;
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-64">
//         <div className="text-center space-y-4">
//           <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
//           <p className="text-muted-foreground">Loading organic farming guide for {location}...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center space-y-4 p-8">
//         <div className="p-4 bg-destructive/10 rounded-full mx-auto w-fit">
//           <span className="text-2xl">⚠️</span>
//         </div>
//         <h3 className="text-lg font-semibold">Unable to load guide</h3>
//         <p className="text-muted-foreground">{error}</p>
//         <button
//           onClick={() => window.location.reload()}
//           className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
//         >
//           Try Again
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-12">
//       {/* Principles Section */}
//       <Card className="p-8 bg-gradient-organic border-secondary">
//         <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
//           Organic Farming Principles for {location}
//         </h2>
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//           {principles.map((principle, index) => (
//             <div
//               key={index}
//               className="text-center space-y-4 p-6 rounded-2xl bg-card/50 hover:bg-card/80 transition-all duration-300 animate-grow border"
//             >
//               <div className="p-4 bg-primary/10 rounded-full mx-auto w-fit">
//                 {renderIcon(principle.icon)}
//               </div>
//               <h3 className="text-lg font-semibold text-foreground">{principle.title}</h3>
//               <p className="text-sm text-muted-foreground leading-relaxed">
//                 {principle.description}
//               </p>
//             </div>
//           ))}
//         </div>
//       </Card>

//       {/* Process Timeline */}
//       <Card className="p-8 bg-card border-secondary">
//         <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
//           Complete Organic Farming Process for {location}
//         </h2>

//         <div className="grid lg:grid-cols-2 gap-8 items-center">
//           <div className="space-y-6">
//             {process.map((item, index) => (
//               <div
//                 key={index}
//                 className="flex items-start gap-4 p-6 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-300 border"
//               >
//                 <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
//                   {item.step}
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
//                   <p className="text-muted-foreground">{item.description}</p>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className="flex justify-center">
//             <img
//               src={farmingProcessImage}
//               alt="Organic farming process infographic"
//               className="rounded-2xl shadow-warm max-w-full h-auto animate-float"
//             />
//           </div>
//         </div>
//       </Card>

//       {/* Additional Regional Information */}
//       {/* <Card className="p-8 bg-secondary/20 border-secondary">
//         <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
//           Why Organic Farming in {location}?
//         </h2>
//         <div className="grid md:grid-cols-2 gap-6 text-center">
//           <div className="p-6 rounded-xl bg-card/50">
//             <h4 className="font-semibold text-lg mb-2">🌾 Traditional Strength</h4>
//             <p className="text-muted-foreground">
//               {location} has rich agricultural heritage perfect for transitioning to organic methods
//               while maintaining productivity.
//             </p>
//           </div>
//           <div className="p-6 rounded-xl bg-card/50">
//             <h4 className="font-semibold text-lg mb-2">💧 Water Conservation</h4>
//             <p className="text-muted-foreground">
//               Organic practices help conserve water resources, crucial for sustainable farming in
//               the region.
//             </p>
//           </div>
//         </div>
//       </Card> */}
//     </div>
//   );
// };

// export default PersonalizedGuide;

import React, { useState, useEffect } from "react";
import { Leaf, Recycle, Shield, Droplets, Loader2, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import farmingProcessImage from "@/assets/farming-process-icons.jpg";

const PersonalizedGuide = () => {
  const [principles, setPrinciples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Demo location - will be fetched from database later
  const demoLocation = "Punjab";

  useEffect(() => {
    const fetchOrganicGuide = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `http://127.0.0.1:8000/guide-region?location=${encodeURIComponent(demoLocation)}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.guide && Array.isArray(data.guide)) {
          setPrinciples(data.guide);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching organic guide:", err);
        
        // Fallback demo data in case API fails
        setPrinciples([
          {
            icon: "🌱",
            title: "Soil Health Enhancement",
            description: "Use Farm Yard Manure and vermicompost to improve soil fertility for Punjab's alluvial soils."
          },
          {
            icon: "🔄",
            title: "Crop Diversification",
            description: "Break rice-wheat cycle with pulses and oilseeds for better soil health."
          },
          {
            icon: "🌾",
            title: "Indigenous Varieties",
            description: "Cultivate traditional Punjab crops adapted to local climate."
          },
          {
            icon: "💧",
            title: "Water Management",
            description: "Implement drip irrigation to combat water scarcity in Punjab."
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganicGuide();
  }, []);

  const process = [
    { step: 1, title: "Soil Preparation", description: "Test and amend soil with organic matter" },
    { step: 2, title: "Composting", description: "Create nutrient-rich compost from organic waste" },
    { step: 3, title: "Planting", description: "Select appropriate crops and companion plants" },
    { step: 4, title: "Natural Care", description: "Use organic pest control and fertilizers" },
    { step: 5, title: "Harvesting", description: "Collect crops at optimal ripeness" },
    { step: 6, title: "Post-Harvest", description: "Prepare soil for next growing cycle" }
  ];

  // Function to render emoji icons
  const renderIcon = (iconEmoji) => {
    return <span className="text-2xl">{iconEmoji}</span>;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading organic farming guide for {demoLocation}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Demo Banner */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-center gap-2 text-blue-800">
          <MapPin className="h-5 w-5" />
          <p className="text-sm font-medium">
            Demo Location: <span className="font-bold">{demoLocation}</span> • 
            <span className="ml-2 text-blue-600">Real-time data will come from user profile</span>
          </p>
        </div>
      </Card>

      {/* Principles Section */}
      <Card className="p-8 bg-gradient-organic border-secondary">
        <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
          Organic Farming Principles for {demoLocation}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {principles.map((principle, index) => (
            <div
              key={index}
              className="text-center space-y-4 p-6 rounded-2xl bg-card/50 hover:bg-card/80 transition-all duration-300 animate-grow border"
            >
              <div className="p-4 bg-primary/10 rounded-full mx-auto w-fit">
                {renderIcon(principle.icon)}
              </div>
              <h3 className="text-lg font-semibold text-foreground">{principle.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {principle.description}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Process Timeline */}
      <Card className="p-8 bg-card border-secondary">
        <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
          Complete Organic Farming Process for {demoLocation}
        </h2>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            {process.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all duration-300 border"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
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
  

