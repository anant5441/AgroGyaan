import { useEffect, useState } from "react";

// The lucide-react icons are loaded via a CDN for a self-contained file.
// The icons are provided as a property on the window object by the CDN.
import { ChevronDown, Search } from "lucide-react";

const getCardClasses = (additionalClasses = '') => {
  return `rounded-2xl border bg-card text-card-foreground shadow-sm ${additionalClasses}`;
};

const CropSelector = ({ onCropSelect }) => {
  const [selectedCrop, setSelectedCrop] = useState("");

  const crops = [
    { value: "tomatoes", label: "Tomatoes", season: "Spring/Summer" },
    { value: "lettuce", label: "Lettuce", season: "Spring/Fall" },
    { value: "carrots", label: "Carrots", season: "Spring/Fall" },
    { value: "peppers", label: "Peppers", season: "Summer" },
    { value: "spinach", label: "Spinach", season: "Spring/Fall" },
    { value: "herbs", label: "Herbs (Basil, Oregano)", season: "Year-round" },
    { value: "beans", label: "Green Beans", season: "Summer" },
    { value: "cucumbers", label: "Cucumbers", season: "Summer" },
    { value: "radishes", label: "Radishes", season: "Spring/Fall" },
    { value: "corn", label: "Sweet Corn", season: "Summer" }
  ];

  const handleGetGuide = () => {
    if (selectedCrop) {
      onCropSelect(selectedCrop);
    }
  };

  return (
    <div className={`${getCardClasses()} p-8 bg-gradient-to-br from-green-500 to-lime-600 text-white shadow-lg`}>
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Select Your Crop</h2>
          <p className="text-lg opacity-90">
            Get personalized organic growing advice for your chosen crop
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <div className="relative">
            <select 
              className="w-full h-14 text-lg bg-white text-gray-800 border border-green-300 rounded-lg px-4 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500"
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
            >
              <option value="" disabled>Choose a crop to grow...</option>
              {crops.map((crop) => (
                <option key={crop.value} value={crop.value}>
                  {crop.label} - {crop.season}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
          </div>

          <button
            onClick={handleGetGuide}
            disabled={!selectedCrop}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-green-900 text-lg py-4 rounded-xl shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex justify-center items-center">
              <Search className="mr-2 h-5 w-5" />
              Get Crop-Specific Guide
            </div>
          </button>
        </div>

        {selectedCrop && (
          <div className="mt-6 p-4 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm animate-grow">
            <p className="text-sm opacity-80">
              Selected: <span className="font-semibold">{crops.find(c => c.value === selectedCrop)?.label}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [selectedCrop, setSelectedCrop] = useState('');

  useEffect(() => {
    const scriptId = 'lucide-react-cdn';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://unpkg.com/lucide-react@latest';
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-center text-4xl font-bold mb-8">Crop Selector</h1>
        <CropSelector onCropSelect={setSelectedCrop} />
        {selectedCrop && (
          <div className="mt-8 text-center text-gray-600">
            <p className="text-lg">You selected: <span className="font-semibold">{selectedCrop}</span></p>
            <p className="text-sm">Now you would be redirected to a detailed guide.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const renderApp = () => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
        ReactDOM.createRoot(rootElement).render(<App />);
    }
};

document.addEventListener('DOMContentLoaded', renderApp);

export default CropSelector;