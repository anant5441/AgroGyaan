import { 
  Sprout, 
  TrendingUp, 
  Shield, 
  BookOpen, 
  Users, 
  CloudSun, 
  ShoppingCart, 
  Tractor, 
  UserCheck, 
  BarChart3, 
  MessageSquare, 
  Settings 
} from "lucide-react";
import {useNavigate} from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Sprout,
    title: "Crop Recommendation",
    description: "AI-powered suggestions for optimal crop selection based on soil, climate, and market conditions.",
    category: "AI Insights"
  },
  {
    icon: TrendingUp,
    title: "Yield Prediction",
    description: "Predict your harvest yield with advanced machine learning algorithms and historical data analysis.",
    category: "AI Insights"
  },
  {
    icon: Shield,
    title: "Disease Prediction",
    description: "Early detection and prevention of crop diseases using computer vision and expert knowledge.",
    category: "Protection"
  },
  {
    icon: BookOpen,
    title: "Organic Farming Tips",
    description: "Comprehensive educational content and best practices for sustainable organic farming.",
    category: "Education",
    path: "/organic"
  },
  {
    icon: Users,
    title: "Farmer Network",
    description: "Connect with fellow farmers, share experiences, and learn from the agricultural community.",
    category: "Community"
  },
  {
    icon: CloudSun,
    title: "Weather Check",
    description: "Real-time weather updates and forecasts tailored specifically for agricultural planning.",
    category: "Monitoring"
  },
  {
    icon: ShoppingCart,
    title: "Farmer's Crop Listings",
    description: "Sell your produce directly to buyers with wholesale availability options.",
    category: "Marketplace",
    badge: "Wholesale Available"
  },
  {
    icon: Tractor,
    title: "Equipment Seller Listings",
    description: "Browse and sell agricultural equipment, tools, and machinery in our dedicated marketplace.",
    category: "Marketplace"
  },
  {
    icon: UserCheck,
    title: "Buyer Listings",
    description: "Connect with verified buyers looking for quality agricultural products and services.",
    category: "Marketplace"
  },
  {
    icon: BarChart3,
    title: "Market Price Dashboard",
    description: "Real-time mandi prices and market trends to help you make informed selling decisions.",
    category: "Analytics"
  },
  {
    icon: MessageSquare,
    title: "Farmers Community Forum",
    description: "Participate in discussions, ask questions, and share knowledge with the farming community.",
    category: "Community"
  },
  {
    icon: Settings,
    title: "Renting Farming Equipment",
    description: "Rent or lease farming equipment and machinery when you need it, where you need it.",
    category: "Services"
  }
];

const categoryColors = {
  "AI Insights": "bg-primary/10 text-primary",
  "Protection": "bg-destructive/10 text-destructive",
  "Education": "bg-warning/10 text-warning-foreground",
  "Community": "bg-secondary/10 text-secondary-foreground",
  "Monitoring": "bg-soft/20 text-soft-foreground",
  "Marketplace": "bg-accent/20 text-accent-foreground",
  "Analytics": "bg-muted/20 text-muted-foreground",
  "Services": "bg-primary/5 text-primary"
};

export function FeaturesSection() {

  const navigate = useNavigate();
  return (
    <section className="py-20 px-4 bg-gradient-soft">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-6">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground">
            Comprehensive Agricultural{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Solutions
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover our comprehensive suite of tools and features designed to support every aspect of modern farming.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={feature.title}
                onClick={() => feature.path && navigate(feature.path)}
                className="group hover:shadow-hover transition-all duration-300 hover:-translate-y-2 cursor-pointer border-0 shadow-card bg-card/60 backdrop-blur-sm"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-gradient-primary group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${categoryColors[feature.category]}`}
                    >
                      {feature.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                  {feature.badge && (
                    <Badge variant="outline" className="text-warning border-warning/30 bg-warning/5">
                      {feature.badge}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-6">
            Ready to transform your farming experience?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-gradient-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-hover">
              Get Started Today
            </button>
            <button className="px-8 py-3 border border-border rounded-lg font-semibold hover:bg-accent transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}