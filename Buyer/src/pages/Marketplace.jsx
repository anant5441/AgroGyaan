import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Filter, MapPin, Star, ShoppingCart } from 'lucide-react';

const Marketplace = () => {
  const crops = [
    {
      id: 1,
      name: "Fresh Tomatoes",
      farmer: "Ramesh Patel",
      location: "Gujarat, 15km away",
      price: "₹45/kg",
      rating: 4.8,
      image: "🍅",
      freshness: "Harvested Today",
      verified: true
    },
    {
      id: 2,
      name: "Organic Wheat",
      farmer: "Priya Sharma",
      location: "Punjab, 25km away", 
      price: "₹28/kg",
      rating: 4.9,
      image: "🌾",
      freshness: "2 days ago",
      verified: true
    },
    {
      id: 3,
      name: "Fresh Potatoes",
      farmer: "Kumar Singh",
      location: "Uttar Pradesh, 30km away",
      price: "₹35/kg", 
      rating: 4.7,
      image: "🥔",
      freshness: "Yesterday",
      verified: true
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Marketplace</h1>
            <p className="text-muted-foreground">Discover fresh produce from verified farmers</p>
          </div>
          <Button className="bg-gradient-primary hover:shadow-glow">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-4 flex-wrap">
          <Input placeholder="Search crops..." className="max-w-md" />
          <Button variant="outline">All Crops</Button>
          <Button variant="outline">Organic Only</Button>
          <Button variant="outline">Local First</Button>
        </div>

        {/* Crops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {crops.map((crop) => (
            <Card
              key={crop.id}
              className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-1 border-2 border-primary/10 hover:border-primary/30"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="text-4xl mb-2">{crop.image}</div>
                  {crop.verified && (
                    <Badge className="bg-gradient-primary text-primary-foreground">Verified</Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{crop.name}</CardTitle>
                <Badge variant="secondary" className="w-fit text-xs">
                  {crop.freshness}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">👨‍🌾 {crop.farmer}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{crop.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{crop.rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">{crop.price}</span>
                  <Button className="bg-gradient-primary hover:shadow-glow">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Buy Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Marketplace;
