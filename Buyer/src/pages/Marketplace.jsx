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
import { cropsAPI, ordersAPI, cartAPI } from '../services/api';

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [crops, setCrops] = useState([]); // Real data
  const [loading, setLoading] = useState(true);

  // Import API
  // Note: I will assume imports are added at the top, if not I will add them in a separate block or here if I can import inside component (I can't). 
  // Wait, I need to add imports at the top. I'll do this in two steps or use multi_replace.
  // actually, I'll rewrite the component part first.

  // Fetch Crops Effect
  React.useEffect(() => {
    const fetchCrops = async () => {
      setLoading(true);
      try {
        const filters = {
          search: searchTerm,
          organic: selectedFilter === 'organic'
        };
        const data = await cropsAPI.getAll(filters);
        setCrops(data);
      } catch (error) {
        console.error("Failed to fetch crops:", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchCrops();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedFilter]);

  const refreshCrops = async () => {
    // Refresh crops to show updated stock
    const filters = {
      search: searchTerm,
      organic: selectedFilter === 'organic'
    };
    const data = await cropsAPI.getAll(filters);
    setCrops(data);
  };

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
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between mb-4">
          <p className="text-muted-foreground">
            Showing {crops.length} result{crops.length !== 1 ? 's' : ''}
          </p>
          {selectedFilter === 'organic' && (
            <Badge className="bg-success text-success-foreground">
              🌱 Organic Filter Active
            </Badge>
          )}
        </div>

        {/* Crops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">Loading fresh crops...</div>
          ) : crops.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">No crops found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            crops.map((crop) => (
              <CropCard key={crop._id} crop={crop} onRefresh={refreshCrops} />
            ))
          )}
        </div>
      </div>
      <Footer />
    </DashboardLayout>
  );
};

const CropCard = ({ crop, onRefresh }) => {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    try {
      await cartAPI.add(crop._id, quantity);
      alert(`Added ${quantity} ${crop.crop_name}(s) to cart! 🛒`);
    } catch (err) {
      alert('Failed to add to cart: ' + err.message);
    }
  };

  const handleBuyNow = async () => {
    try {
      await ordersAPI.create({
        crop_id: crop._id,
        quantity: quantity
      });
      alert(`Order placed successfully for ${quantity} ${crop.crop_name}(s)!`);
      onRefresh();
    } catch (err) {
      alert('Failed to place order: ' + err.message);
    }
  };

  return (
    <Card className="group hover:shadow-glow transition-all duration-300 hover:-translate-y-1 border-2 border-primary/10 hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="text-4xl mb-2">
            {crop.crop_name.toLowerCase().includes('tomato') ? '🍅' :
              crop.crop_name.toLowerCase().includes('wheat') ? '🌾' :
                crop.crop_name.toLowerCase().includes('potato') ? '🥔' : '🥬'}
          </div>
          <div className="flex gap-2">
            <Badge className="bg-gradient-primary text-primary-foreground">Verified</Badge>
            {crop.organic_certified && (
              <Badge className="bg-success text-success-foreground">🌱 Organic</Badge>
            )}
          </div>
        </div>
        <CardTitle className="text-lg">{crop.crop_name}</CardTitle>
        <Badge variant="secondary" className="w-fit text-xs">
          In Stock: {crop.Quantity_available_retail}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">👨‍🌾 {crop.farmer_id?.name || 'Unknown Farmer'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{crop.farmer_id?.phone ? 'Available' : 'Unavailable'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">4.8</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">₹{crop.price_per_unit_retail}/kg</span>

            {/* Quantity Selector */}
            <div className="flex items-center border rounded-md">
              <button
                className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >-</button>
              <span className="px-2 text-sm font-medium">{quantity}</span>
              <button
                className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                onClick={() => setQuantity(Math.min(crop.Quantity_available_retail, quantity + 1))}
              >+</button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleAddToCart}
              variant="secondary"
              className="flex-1 bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add
            </Button>
            <Button
              onClick={handleBuyNow}
              className="flex-1 bg-gradient-primary hover:shadow-glow"
            >
              Buy Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Marketplace;
