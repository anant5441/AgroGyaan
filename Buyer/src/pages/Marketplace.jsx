// import React from 'react';
import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { Filter, MapPin, Star, ShoppingCart } from 'lucide-react';
import { Filter, MapPin, Star, ShoppingCart, Search } from 'lucide-react';
import Footer from '@/components/Footer';

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
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
      verified: true,
      organic: false
    },
    {
      id: 4,
      name: "Organic Carrots",
      farmer: "Meera Devi",
      location: "Rajasthan, 20km away",
      price: "₹55/kg",
      rating: 4.9,
      image: "🥕",
      freshness: "Harvested Today",
      verified: true,
      organic: true
    },
    {
      id: 5,
      name: "Organic Spinach",
      farmer: "Arjun Singh",
      location: "Haryana, 18km away",
      price: "₹40/kg",
      rating: 4.6,
      image: "🥬",
      freshness: "Yesterday",
      verified: true,
      organic: true
    }
  ];

  const filteredCrops = useMemo(() => {
    let filtered = crops;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(crop =>
        crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.farmer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedFilter === 'organic') {
      filtered = filtered.filter(crop => crop.organic);
    }

    return filtered;
  }, [searchTerm, selectedFilter]);

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
        <div className="flex gap-4 flex-wrap items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search crops or farmers..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant={selectedFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedFilter('all')}
            className={selectedFilter === 'all' ? 'bg-gradient-primary hover:shadow-glow' : ''}
          >
            All Crops
          </Button>
          <Button
            variant={selectedFilter === 'organic' ? 'default' : 'outline'}
            onClick={() => setSelectedFilter('organic')}
            className={selectedFilter === 'organic' ? 'bg-gradient-primary hover:shadow-glow' : ''}
          >
            Organic Only
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>

        {showFilters && (
          <Card className="border-2 border-primary/20">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Price Range</label>
                  <select className="w-full p-2 border rounded-lg">
                    <option>All Prices</option>
                    <option>₹0 - ₹30</option>
                    <option>₹31 - ₹50</option>
                    <option>₹51+</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Location</label>
                  <select className="w-full p-2 border rounded-lg">
                    <option>All Locations</option>
                    <option>Within 10km</option>
                    <option>Within 25km</option>
                    <option>Within 50km</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Crop Type</label>
                  <select className="w-full p-2 border rounded-lg">
                    <option>All Types</option>
                    <option>Vegetables</option>
                    <option>Fruits</option>
                    <option>Grains</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Rating</label>
                  <select className="w-full p-2 border rounded-lg">
                    <option>All Ratings</option>
                    <option>4.5+ Stars</option>
                    <option>4.0+ Stars</option>
                    <option>3.5+ Stars</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground">
            Showing {filteredCrops.length} of {crops.length} crops
          </p>
          {selectedFilter === 'organic' && (
            <Badge className="bg-success text-success-foreground">
              🌱 Organic Filter Active
            </Badge>
          )}
        </div>

        {/* Crops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">No crops found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredCrops.map((crop) => (
              <Card
                key={crop.id}
                className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-1 border-2 border-primary/10 hover:border-primary/30"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="text-4xl mb-2">{crop.image}</div>
                    <div className="flex gap-2">
                      {crop.verified && (
                        <Badge className="bg-gradient-primary text-primary-foreground">Verified</Badge>
                      )}
                      {crop.organic && (
                        <Badge className="bg-success text-success-foreground">🌱 Organic</Badge>
                      )}
                    </div>
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
            ))
          )}
        </div>
      </div>
      <Footer />
    </DashboardLayout>
  );
};

export default Marketplace;
