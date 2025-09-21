import { ArrowLeft, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NavigationMenu as Navigation } from "@/components/ui/navigation-menu";

const SimplePrediction = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <Link 
            to="/crop-prediction" 
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Options
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Simple Crop Analysis</h1>
          <p className="text-muted-foreground">
            Quick recommendations based on basic environmental conditions
          </p>
        </div>

        <Card className="bg-gradient-card border-agro-light shadow-card animate-slide-up">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Leaf className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              We're working on the simplified prediction method. This feature will be available soon.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-6">
              In the meantime, try our scientific analysis method for detailed crop recommendations.
            </p>
            <Link 
              to="/npk-prediction"
              className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
            >
              Try Scientific Analysis
              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SimplePrediction;