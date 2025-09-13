// import { useEffect, useState } from "react";

// // The lucide-react icons are loaded via a CDN for a self-contained file.
// // The icons are provided as a property on the window object by the CDN.
// import { ChevronDown, Search } from "lucide-react";

// const getCardClasses = (additionalClasses = '') => {
//   return `rounded-2xl border bg-card text-card-foreground shadow-sm ${additionalClasses}`;
// };

// const CropSelector = ({ onCropSelect }) => {
//   const [selectedCrop, setSelectedCrop] = useState("");

//   const crops = [
//     { value: "tomatoes", label: "Tomatoes", season: "Spring/Summer" },
//     { value: "lettuce", label: "Lettuce", season: "Spring/Fall" },
//     { value: "carrots", label: "Carrots", season: "Spring/Fall" },
//     { value: "peppers", label: "Peppers", season: "Summer" },
//     { value: "spinach", label: "Spinach", season: "Spring/Fall" },
//     { value: "herbs", label: "Herbs (Basil, Oregano)", season: "Year-round" },
//     { value: "beans", label: "Green Beans", season: "Summer" },
//     { value: "cucumbers", label: "Cucumbers", season: "Summer" },
//     { value: "radishes", label: "Radishes", season: "Spring/Fall" },
//     { value: "corn", label: "Sweet Corn", season: "Summer" }
//   ];

//   const handleGetGuide = () => {
//     if (selectedCrop) {
//       onCropSelect(selectedCrop);
//     }
//   };

//   return (
//     <div className={`${getCardClasses()} p-8 bg-gradient-to-br from-green-500 to-lime-600 text-white shadow-lg`}>
//       <div className="text-center space-y-6">
//         <div className="space-y-2">
//           <h2 className="text-3xl font-bold">Select Your Crop</h2>
//           <p className="text-lg opacity-90">
//             Get personalized organic growing advice for your chosen crop
//           </p>
//         </div>

//         <div className="max-w-md mx-auto space-y-4">
//           <div className="relative">
//             <select 
//               className="w-full h-14 text-lg bg-white text-gray-800 border border-green-300 rounded-lg px-4 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500"
//               value={selectedCrop}
//               onChange={(e) => setSelectedCrop(e.target.value)}
//             >
//               <option value="" disabled>Choose a crop to grow...</option>
//               {crops.map((crop) => (
//                 <option key={crop.value} value={crop.value}>
//                   {crop.label} - {crop.season}
//                 </option>
//               ))}
//             </select>
//             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
//           </div>

//           <button
//             onClick={handleGetGuide}
//             disabled={!selectedCrop}
//             className="w-full bg-yellow-400 hover:bg-yellow-500 text-green-900 text-lg py-4 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <div className="flex justify-center items-center">
//               <Search className="mr-2 h-5 w-5" />
//               Get Crop-Specific Guide
//             </div>
//           </button>
//         </div>

//         {selectedCrop && (
//           <div className="mt-6 p-4 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm animate-grow">
//             <p className="text-sm opacity-80">
//               Selected: <span className="font-semibold">{crops.find(c => c.value === selectedCrop)?.label}</span>
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const App = () => {
//   const [selectedCrop, setSelectedCrop] = useState('');

//   useEffect(() => {
//     const scriptId = 'lucide-react-cdn';
//     if (!document.getElementById(scriptId)) {
//       const script = document.createElement('script');
//       script.id = scriptId;
//       script.src = 'https://unpkg.com/lucide-react@latest';
//       document.body.appendChild(script);
//     }
//   }, []);

//   return (
//     <div className="bg-gray-50 min-h-screen py-12 px-4 md:px-8">
//       <div className="max-w-md mx-auto">
//         <h1 className="text-center text-4xl font-bold mb-8">Crop Selector</h1>
//         <CropSelector onCropSelect={setSelectedCrop} />
//         {selectedCrop && (
//           <div className="mt-8 text-center text-gray-600">
//             <p className="text-lg">You selected: <span className="font-semibold">{selectedCrop}</span></p>
//             <p className="text-sm">Now you would be redirected to a detailed guide.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const renderApp = () => {
//     const rootElement = document.getElementById('root');
//     if (rootElement) {
//         ReactDOM.createRoot(rootElement).render(<App />);
//     }
// };

// document.addEventListener('DOMContentLoaded', renderApp);

// export default CropSelector;

// import { useEffect, useState } from "react";
// import { ChevronDown, Search } from "lucide-react";

// const getCardClasses = (additionalClasses = "") => {
//   return `rounded-2xl border bg-card text-card-foreground shadow-sm ${additionalClasses}`;
// };

// const CropSelector = ({ onCropSelect }) => {
//   const [crops, setCrops] = useState([]);
//   const [search, setSearch] = useState("");
//   const [selectedCrop, setSelectedCrop] = useState("");
//   const [customCrop, setCustomCrop] = useState("");

//   // 🔹 Fetch crops from Fruityvice API
//   useEffect(() => {
//     const fetchCrops = async () => {
//       try {
//         const res = await fetch("https://www.fruityvice.com/api/fruit/all");
//         const data = await res.json();
//         setCrops(data);
//       } catch (err) {
//         console.error("Error fetching crops:", err);
//       }
//     };
//     fetchCrops();
//   }, []);

//   // 🔹 Filter crops based on search
//   const filteredCrops = crops.filter((crop) =>
//     crop.name.toLowerCase().includes(search.toLowerCase())
//   );

//   const handleGetGuide = () => {
//     if (selectedCrop === "other" && customCrop) {
//       onCropSelect(customCrop);
//     } else if (selectedCrop && selectedCrop !== "other") {
//       onCropSelect(selectedCrop);
//     }
//   };

//   return (
//     <div
//       className={`${getCardClasses()} p-8 bg-gradient-to-br from-green-500 to-lime-600 text-white shadow-lg`}
//     >
//       <div className="text-center space-y-6">
//         <div className="space-y-2">
//           <h2 className="text-3xl font-bold">Select Your Crop</h2>
//           <p className="text-lg opacity-90">
//             Get personalized organic growing advice for your chosen crop
//           </p>
//         </div>

//         <div className="max-w-md mx-auto space-y-4">
//           {/* 🔹 Search Box */}
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="Search crops..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full h-12 px-4 rounded-lg border border-green-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
//             />
//           </div>

//           {/* 🔹 Crop Dropdown */}
//           <div className="relative">
//             <select
//               className="w-full h-14 text-lg bg-white text-gray-800 border border-green-300 rounded-lg px-4 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500"
//               value={selectedCrop}
//               onChange={(e) => setSelectedCrop(e.target.value)}
//             >
//               <option value="" disabled>
//                 Choose a crop...
//               </option>
//               {filteredCrops.map((crop) => (
//                 <option key={crop.id} value={crop.name}>
//                   {crop.name}
//                 </option>
//               ))}
//               <option value="other">Other (Not in list)</option>
//             </select>
//             <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
//           </div>

//           {/* 🔹 If "Other" is chosen → Custom Input */}
//           {selectedCrop === "other" && (
//             <input
//               type="text"
//               placeholder="Enter crop name..."
//               value={customCrop}
//               onChange={(e) => setCustomCrop(e.target.value)}
//               className="w-full h-12 px-4 rounded-lg border border-green-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
//             />
//           )}

//           {/* 🔹 Button */}
//           <button
//             onClick={handleGetGuide}
//             disabled={
//               !selectedCrop ||
//               (selectedCrop === "other" && customCrop.trim() === "")
//             }
//             className="w-full bg-yellow-400 hover:bg-yellow-500 text-green-900 text-lg py-4 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <div className="flex justify-center items-center">
//               <Search className="mr-2 h-5 w-5" />
//               Get Crop-Specific Guide
//             </div>
//           </button>
//         </div>

//         {/* 🔹 Preview */}
//         {(selectedCrop || customCrop) && (
//           <div className="mt-6 p-4 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm animate-grow">
//             <p className="text-sm opacity-80">
//               Selected:{" "}
//               <span className="font-semibold">
//                 {selectedCrop === "other" ? customCrop : selectedCrop}
//               </span>
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CropSelector;

import { useEffect, useState, useRef } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cropsData } from "@/constants/crops"; // adjust path

const getCardClasses = (additionalClasses = "") => {
  return `rounded-2xl border bg-card text-card-foreground shadow-sm ${additionalClasses}`;
};

const CropSelector = ({ onCropSelect }) => {
  const [selectedCrop, setSelectedCrop] = useState("");
  const [customCrop, setCustomCrop] = useState("");
  const [crops, setCrops] = useState([]);
  const [filteredCrops, setFilteredCrops] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    processCropsData();
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const processCropsData = () => {
    try {
      const cropList = cropsData.fields.map((field, index) => ({
        id: index + 1,
        name: field.label,
        category: getCategoryFromLabel(field.label),
      }));
      cropList.push({ id: cropList.length + 1, name: "Other", category: "Custom" });
      setCrops(cropList);
      setFilteredCrops(cropList);
    } catch (err) {
      console.error("Error processing crops data:", err);
      useFallbackData();
    }
  };

  const getCategoryFromLabel = (label) => {
    if (label.includes("Food grains") || label.includes("cereals")) return "Cereals";
    if (label.includes("Pulses")) return "Pulses";
    if (label.includes("Oilseeds")) return "Oilseeds";
    if (label.includes("Cotton") || label.includes("Jute") || label.includes("Mesta"))
      return "Fiber Crops";
    if (label.includes("Tea") || label.includes("Coffee")) return "Beverage Crops";
    if (label.includes("Banana") || label.includes("Potato") || label.includes("Ginger"))
      return "Vegetables/Fruits";
    return "Other Crops";
  };

  const handleClickOutside = (e) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      setFilteredCrops(
        crops.filter((crop) =>
          crop.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredCrops(crops);
    }
  }, [searchTerm, crops]);

  const handleSelectCrop = (crop) => {
    setSelectedCrop(crop);
    setDropdownOpen(false);
    setSearchTerm("");
  };

  const handleGetGuide = () => {
    if (selectedCrop && selectedCrop !== "Other") {
      onCropSelect(selectedCrop);
    } else if (customCrop.trim()) {
      onCropSelect(customCrop.trim());
    }
  };

  const useFallbackData = () => {
    const fallbackCrops = [
      { id: 1, name: "Rice", category: "Cereals" },
      { id: 2, name: "Wheat", category: "Cereals" },
      { id: 3, name: "Maize", category: "Cereals" },
      { id: 4, name: "Gram", category: "Pulses" },
      { id: 5, name: "Groundnut", category: "Oilseeds" },
      { id: 6, name: "Cotton", category: "Fiber Crops" },
      { id: 7, name: "Sugarcane", category: "Cash Crops" },
      { id: 8, name: "Tea", category: "Beverage Crops" },
      { id: 9, name: "Coffee", category: "Beverage Crops" },
      { id: 10, name: "Potato", category: "Vegetables" },
      { id: 11, name: "Other", category: "Custom" },
    ];
    setCrops(fallbackCrops);
    setFilteredCrops(fallbackCrops);
  };

  return (
    <div
      className={`${getCardClasses()} p-8 bg-gradient-to-br from-green-500 to-lime-600 text-white shadow-lg`}
    >
      <div className="text-center space-y-6">
        <h2 className="text-3xl font-bold">Select Your Crop</h2>
        <p className="text-lg opacity-90">
          Get personalized organic growing advice for your chosen crop
        </p>

        <div className="max-w-md mx-auto space-y-4" ref={dropdownRef}>
          {/* Custom Dropdown */}
          <div className="relative">
            <button
              className="w-full h-14 text-lg bg-white text-gray-800 border border-green-300 rounded-lg px-4 flex justify-between items-center focus:outline-none"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {selectedCrop || "Choose a crop from the list..."}
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </button>

            {dropdownOpen && (
              <div className="absolute mt-2 w-full bg-white border border-green-300 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
                {/* Search inside dropdown */}
                <div className="sticky top-0 bg-white border-b">
                  <div className="flex items-center px-3 py-2">
                    <Search className="h-5 w-5 text-gray-500 mr-2" />
                    <input
                      type="text"
                      placeholder="Search crops..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full text-sm text-gray-800 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Options */}
                {filteredCrops.map((crop) => (
                  <div
                    key={crop.id}
                    className="px-4 py-2 cursor-pointer hover:bg-green-100 text-gray-800"
                    onClick={() => handleSelectCrop(crop.name)}
                  >
                    {crop.name} {crop.category && `(${crop.category})`}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Custom Crop Input (only if Other is selected) */}
          {selectedCrop === "Other" && (
            <input
              type="text"
              placeholder="Enter custom crop name..."
              value={customCrop}
              onChange={(e) => setCustomCrop(e.target.value)}
              className="w-full h-12 text-lg bg-white text-gray-800 border border-green-300 rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          )}

          <button
            onClick={handleGetGuide}
            disabled={!selectedCrop && !customCrop.trim()}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-green-900 text-lg py-4 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex justify-center items-center">
              <Search className="mr-2 h-5 w-5" />
              Get Crop-Specific Guide
            </div>
          </button>
        </div>

        {(selectedCrop || customCrop) && (
          <div className="mt-6 p-4 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm animate-grow">
            <p className="text-sm opacity-80">
              Selected:{" "}
              <span className="font-semibold">{selectedCrop || customCrop}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropSelector;
