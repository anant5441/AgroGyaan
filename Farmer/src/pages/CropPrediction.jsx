import { Link } from "react-router-dom";
import { Leaf, FlaskConical, Sprout, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NavigationMenu as Navigation } from "@/components/ui/navigation-menu";
import heroImage from "@/assets/hero-agriculture.jpg";
import npkImage from "@/assets/npk-analysis.jpg";
import traditionalImage from "@/assets/traditional-farming.jpg";
import "@/styles/CropPrediction.css";

const CropPrediction = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Agricultural landscape" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-hero opacity-80"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-full mb-6 animate-float">
              <Sprout className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Smart Crop Prediction
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Choose your preferred method to get AI-powered crop recommendations tailored to your farming needs
            </p>
          </div>
        </div>
      </section>

      {/* Options Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* NPK Method Card */}
            <Card className="group hover:shadow-elevated transition-all duration-500 animate-slide-up bg-gradient-card border-agro-light">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                  <img 
                    src={npkImage} 
                    alt="NPK Analysis" 
                    className="w-16 h-16 object-cover rounded-full"
                  />
                </div>
                <CardTitle className="text-2xl text-foreground group-hover:text-primary transition-colors duration-300">
                  Scientific Analysis
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Advanced prediction using soil nutrients and environmental data
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <FlaskConical className="w-5 h-5 text-primary" />
                    <span className="text-sm text-foreground">NPK (Nitrogen, Phosphorus, Potassium) levels</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Leaf className="w-5 h-5 text-primary" />
                    <span className="text-sm text-foreground">Temperature, humidity & pH analysis</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Sprout className="w-5 h-5 text-primary" />
                    <span className="text-sm text-foreground">Rainfall pattern consideration</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Link to="/npk-prediction">
                    <Button className="w-full bg-gradient-primary hover:bg-primary/90 group-hover:shadow-soft transition-all duration-300">
                      Start Scientific Analysis
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Traditional Method Card */}
            <Card className="group hover:shadow-elevated transition-all duration-500 animate-slide-up [animation-delay:200ms] bg-gradient-card border-agro-light">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors duration-300">
                  <img 
                    src={traditionalImage} 
                    alt="Traditional Farming" 
                    className="w-16 h-16 object-cover rounded-full"
                  />
                </div>
                <CardTitle className="text-2xl text-foreground group-hover:text-primary transition-colors duration-300">
                  Simplified Method
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Quick prediction based on basic environmental conditions
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Leaf className="w-5 h-5 text-accent" />
                    <span className="text-sm text-foreground">Location-based recommendations</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FlaskConical className="w-5 h-5 text-accent" />
                    <span className="text-sm text-foreground">Basic climate data input</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Sprout className="w-5 h-5 text-accent" />
                    <span className="text-sm text-foreground">Traditional farming wisdom</span>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Link to="/simple-prediction">
                    <Button 
                      variant="outline" 
                      className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground group-hover:shadow-soft transition-all duration-300"
                    >
                      Start Simple Analysis
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Highlights */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-semibold text-foreground mb-8">Why Choose AgroYaan?</h3>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="animate-fade-in [animation-delay:300ms]">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FlaskConical className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">AI-Powered Accuracy</h4>
                <p className="text-sm text-muted-foreground">Advanced machine learning models for precise predictions</p>
              </div>
              
              <div className="animate-fade-in [animation-delay:400ms]">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="w-8 h-8 text-accent" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Sustainable Farming</h4>
                <p className="text-sm text-muted-foreground">Recommendations focused on environmental sustainability</p>
              </div>
              
              <div className="animate-fade-in [animation-delay:500ms]">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sprout className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">Easy to Use</h4>
                <p className="text-sm text-muted-foreground">Intuitive interface designed for farmers of all levels</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CropPrediction;