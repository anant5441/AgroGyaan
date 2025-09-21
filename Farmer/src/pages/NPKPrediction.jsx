import { useState } from "react";
import axios from "axios";
import { ArrowLeft, Loader2, CheckCircle, AlertCircle, Leaf, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { NavigationMenu as Navigation } from "@/components/ui/navigation-menu";
//import { useToast } from "@/hooks/use-toast";

const NPKPrediction = () => {
  const [formData, setFormData] = useState({
    N: "",
    P: "",
    K: "",
    temperature: "",
    humidity: "",
    ph: "",
    rainfall: "",
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  // const { toast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/predict", formData);
      setPrediction(response.data);
    //   toast({
    //     title: "Prediction Complete",
    //     description: `Recommended crop: ${response.data.predicted_crop}`,
    //     duration: 3000,
    //   });
    } catch (error) {
      console.error("Prediction error:", error);
    //   toast({
    //     title: "Prediction Failed",
    //     description: "Unable to get crop recommendation. Please try again.",
    //     variant: "destructive",
    //     duration: 3000,
    //   });
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence > 0.8) return "bg-green-500";
    if (confidence > 0.6) return "bg-yellow-500";
    if (confidence > 0.4) return "bg-orange-500";
    return "bg-red-500";
  };

  const getSuitabilityBadge = (suitability) => {
    const variants = {
      SUITABLE: "bg-green-100 text-green-800 border-green-200",
      MODERATELY_SUITABLE: "bg-yellow-100 text-yellow-800 border-yellow-200",
      MARGINALLY_SUITABLE: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return variants[suitability] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formFields = [
    { label: "Nitrogen (N)", name: "N", placeholder: "e.g., 90", unit: "kg/ha" },
    { label: "Phosphorus (P)", name: "P", placeholder: "e.g., 42", unit: "kg/ha" },
    { label: "Potassium (K)", name: "K", placeholder: "e.g., 43", unit: "kg/ha" },
    { label: "Temperature", name: "temperature", placeholder: "e.g., 25", unit: "°C" },
    { label: "Humidity", name: "humidity", placeholder: "e.g., 80", unit: "%" },
    { label: "pH Level", name: "ph", placeholder: "e.g., 6.5", unit: "pH" },
    { label: "Rainfall", name: "rainfall", placeholder: "e.g., 200", unit: "mm" },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link 
            to="/crop-prediction" 
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Options
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Scientific Crop Analysis</h1>
          <p className="text-muted-foreground">
            Enter your soil and environmental data for precise crop recommendations
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="bg-gradient-card border-agro-light shadow-card animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Leaf className="w-5 h-5 text-primary" />
                <span>Input Parameters</span>
              </CardTitle>
              <CardDescription>
                Provide accurate measurements for the best recommendations
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4">
                  {formFields.map((field) => (
                    <div key={field.name} className="space-y-2">
                      <Label htmlFor={field.name} className="text-sm font-medium text-foreground">
                        {field.label}
                        <span className="text-muted-foreground ml-1">({field.unit})</span>
                      </Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        step="0.01"
                        placeholder={field.placeholder}
                        value={formData[field.name]}
                        onChange={handleChange}
                        className="border-agro-light focus:border-primary focus:ring-primary/20"
                        required
                      />
                    </div>
                  ))}
                </div>
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-primary hover:bg-primary/90 shadow-soft transition-all duration-300"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Get Recommendation
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <Card className="bg-gradient-card border-agro-light shadow-card animate-slide-up [animation-delay:200ms]">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span>Prediction Results</span>
              </CardTitle>
              <CardDescription>
                AI-powered crop recommendations based on your data
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {loading && (
                <div className="text-center py-12">
                  <div className="animate-spin mx-auto mb-4">
                    <Leaf className="w-12 h-12 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Analyzing soil conditions...</p>
                </div>
              )}

              {prediction && !loading && (
                <div className="space-y-6 animate-fade-in">
                  {/* Main Prediction */}
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <span className="text-sm font-medium text-primary">Recommended Crop</span>
                      </div>
                      <Badge 
                        className={`${getConfidenceColor(prediction.confidence)} text-white border-0`}
                      >
                        {(prediction.confidence * 100).toFixed(1)}% confidence
                      </Badge>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-foreground capitalize mb-2">
                      {prediction.predicted_crop}
                    </h3>
                    
                    <Progress 
                      value={prediction.confidence * 100} 
                      className="mb-2"
                    />
                    
                    <p className="text-sm text-muted-foreground">
                      Recommendation Level: {prediction.recommendation_level.replace('_', ' ')}
                    </p>
                  </div>

                  {/* Alternative Options */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-4">Alternative Options</h4>
                    <div className="space-y-3">
                      {prediction.recommendations.slice(0, 4).map((crop, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span className="capitalize font-medium text-foreground">{crop.crop}</span>
                            <Badge 
                              variant="outline"
                              className={getSuitabilityBadge(crop.suitability)}
                            >
                              {crop.suitability.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <span className="text-sm font-medium text-primary">
                            {(crop.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Model Info */}
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Model: {prediction.model_type}
                    </p>
                  </div>
                </div>
              )}

              {!prediction && !loading && (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Fill in the form to get your crop recommendations
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NPKPrediction;