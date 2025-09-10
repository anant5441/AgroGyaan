import ReactDOM from 'react-dom/client';
import{ useEffect, useState } from 'react';

// Using a CDN for lucide-react icons
// Note: In a real app, you'd install these via npm. For a single-file example, a CDN is necessary.
// This is a common practice for single-file demos.
// The icons are provided as a property on the window object by the CDN.
const { Calendar, Thermometer, Droplets, Bug, AlertCircle } = window.LucideReact;

// Utility function to generate classes for a badge-like appearance
const getBadgeClasses = (isSecondary) => {
  return `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
    isSecondary ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80' : 'bg-primary text-primary-foreground hover:bg-primary/80'
  }`;
};

// Utility function to generate classes for a card-like appearance
const getCardClasses = (additionalClasses = '') => {
  return `rounded-2xl border bg-card text-card-foreground shadow-sm ${additionalClasses}`;
};

const CropGuide = ({ crop }) => {
  // Mock data - in real app this would come from backend API
  const cropData = {
    tomatoes: {
      name: "Tomatoes",
      difficulty: "Intermediate",
      timeToHarvest: "70-80 days",
      spacing: "18-24 inches apart",
      practices: {
        planting: {
          title: "Planting",
          tips: [
            "Start seeds indoors 6-8 weeks before last frost",
            "Transplant after soil temperature reaches 60°F",
            "Plant deep, burying 2/3 of the stem"
          ]
        },
        soil: {
          title: "Soil Preparation",
          tips: [
            "Well-draining, nutrient-rich soil with pH 6.0-6.8",
            "Add compost and aged manure before planting",
            "Ensure good air circulation"
          ]
        },
        care: {
          title: "Organic Care",
          tips: [
            "Mulch around plants to retain moisture",
            "Use companion planting with basil and marigolds",
            "Apply liquid kelp fertilizer bi-weekly"
          ]
        },
        pest: {
          title: "Natural Pest Control",
          tips: [
            "Use beneficial insects like ladybugs",
            "Spray neem oil for aphids and whiteflies",
            "Handpick hornworms and dispose of them"
          ]
        }
      }
    },
    lettuce: {
      name: "Lettuce",
      difficulty: "Beginner",
      timeToHarvest: "45-65 days",
      spacing: "6-8 inches apart",
      practices: {
        planting: {
          title: "Planting",
          tips: [
            "Direct sow seeds in early spring or fall",
            "Plant in partial shade during hot weather",
            "Succession plant every 2 weeks for continuous harvest"
          ]
        },
        soil: {
          title: "Soil Preparation",
          tips: [
            "Light, well-draining soil with pH 6.0-7.0",
            "Rich in organic matter and nitrogen",
            "Keep soil consistently moist but not waterlogged"
          ]
        },
        care: {
          title: "Organic Care",
          tips: [
            "Water gently to avoid disturbing shallow roots",
            "Use row covers during temperature extremes",
            "Apply compost tea monthly"
          ]
        },
        pest: {
          title: "Natural Pest Control",
          tips: [
            "Use copper tape around beds to deter slugs",
            "Encourage birds to control aphids",
            "Spray diluted soap solution for soft-bodied insects"
          ]
        }
      }
    }
  };

  const currentCrop = cropData[crop] || cropData.tomatoes;

  const icons = {
    planting: Calendar,
    soil: Thermometer,
    care: Droplets,
    pest: Bug
  };

  return (
    <div className="space-y-8 p-4 md:p-8 animate-grow font-sans">
      {/* Header */}
      <div className={`${getCardClasses()} p-8 bg-gradient-to-br from-lime-50 to-emerald-100 border-green-200`}>
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-bold text-gray-800">{currentCrop.name}</h2>
              <div className={getBadgeClasses(true)}>
                {currentCrop.difficulty}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="text-gray-500">Harvest: {currentCrop.timeToHarvest}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="text-gray-500">Spacing: {currentCrop.spacing}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center">
            <img
              src="https://placehold.co/600x400/A8E6CF/3D9970?text=Organic+Crops"
              alt="Organic crops"
              className="rounded-2xl shadow-lg shadow-gray-400 max-w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="grid md:grid-cols-2 gap-6">
        {Object.entries(currentCrop.practices).map(([key, practice], ) => {
          const IconComponent = icons[key];
          return (
            <div key={key} className={`${getCardClasses()} p-6 border-green-200 hover:shadow-xl transition-all duration-300`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-full">
                  {IconComponent && <IconComponent className="h-6 w-6 text-green-600" />}
                </div>
                <h3 className="text-xl font-semibold text-gray-800">{practice.title}</h3>
              </div>
              <ul className="space-y-3">
                {practice.tips.map((tip, tipIndex) => (
                  <li key={tipIndex} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-500">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Main App component to handle state and render the guide
const App = () => {
    const [selectedCrop, setSelectedCrop] = useState('tomatoes');

    // This useEffect hook handles loading the Lucide-React CDN script
    useEffect(() => {
        const scriptId = 'lucide-react-cdn';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://unpkg.com/lucide-react@latest';
            document.body.appendChild(script);
        }
    }, []);

    const handleSelectCrop = (crop) => {
        setSelectedCrop(crop);
    };

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-center text-4xl font-bold mb-8">Organic Crop Guide</h1>
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={() => handleSelectCrop('tomatoes')}
                        className={`px-6 py-2 rounded-full font-semibold transition-colors duration-200 ${selectedCrop === 'tomatoes' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                    >
                        Tomatoes
                    </button>
                    <button
                        onClick={() => handleSelectCrop('lettuce')}
                        className={`px-6 py-2 rounded-full font-semibold transition-colors duration-200 ${selectedCrop === 'lettuce' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                    >
                        Lettuce
                    </button>
                </div>
                <CropGuide crop={selectedCrop} />
            </div>
        </div>
    );
};

// Main render function
const renderApp = () => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
        ReactDOM.createRoot(rootElement).render(<App />);
    }
};

// Listen for the DOM to be fully loaded before rendering
document.addEventListener('DOMContentLoaded', renderApp);
export default CropGuide;
