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
import { useToast } from "@/hooks/use-toast";

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

const getCropEmoji = (name) => {
  const n = name.toLowerCase();
  if (n.includes('tomato')) return '🍅';
  if (n.includes('wheat')) return '🌾';
  if (n.includes('potato')) return '🥔';
  if (n.includes('corn') || n.includes('maize')) return '🌽';
  if (n.includes('rice')) return '🍚';
  if (n.includes('lettuce')) return '🥬';
  if (n.includes('apple')) return '🍎';
  if (n.includes('banana')) return '🍌';
  if (n.includes('carrot')) return '🥕';
  if (n.includes('onion')) return '🧅';
  if (n.includes('fruit')) return '🍎'; // Generic fruit
  return '🌱'; // default
};

const CropCard = ({ crop, onRefresh }) => {
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();

  const handleAddToCart = async () => {
    try {
      await cartAPI.add(crop._id, quantity);
      toast({
        title: "Added to cart! 🛒",
        description: `Added ${quantity} ${crop.crop_name}(s) to your cart.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: 'Failed to add to cart: ' + err.message,
        variant: "destructive"
      });
    }
  };

  const handleBuyNow = async () => {
    try {
      await ordersAPI.create({
        crop_id: crop._id,
        quantity: quantity
      });
      toast({
        title: "Order Placed! 🎉",
        description: `Successfully ordered ${quantity} ${crop.crop_name}(s).`,
        className: "bg-green-50 border-green-200 text-green-900"
      });
      onRefresh();
    } catch (err) {
      toast({
        title: "Order Failed",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="group overflow-hidden hover:shadow-glow transition-all duration-300 hover:-translate-y-1 border-2 border-primary/10 hover:border-primary/30">

      {/* Image Section */}
      <div className="relative h-48 w-full bg-muted/20 flex items-center justify-center overflow-hidden">
        {crop.image_url ? (
          <img
            src={crop.image_url}
            alt={crop.crop_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none'; // hide broken image
              e.target.parentElement.querySelector('.fallback-emoji').style.display = 'block'; // show emoji
            }}
          />
        ) : null}

        {/* Fallback Emoji (hidden if image loads) */}
        <span className="fallback-emoji text-6xl animate-bounce-slow" style={{ display: crop.image_url ? 'none' : 'block' }}>
          {getCropEmoji(crop.crop_name)}
        </span>

        {/* Badges Overlay */}
        <div className="absolute top-2 right-2 flex gap-1">
          <Badge className="bg-white/90 text-primary hover:bg-white backdrop-blur-sm shadow-sm">Verified</Badge>
          {crop.organic_certified && (
            <Badge className="bg-green-500/90 hover:bg-green-600 text-white backdrop-blur-sm shadow-sm">Organic</Badge>
          )}
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold text-gray-800">{crop.crop_name}</CardTitle>
          <div className="flex items-center gap-1 text-sm bg-yellow-50 px-2 py-1 rounded-full border border-yellow-100">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="font-medium text-yellow-700">4.8</span>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs font-normal">
            In Stock: {crop.Quantity_available_retail}
          </Badge>
          {crop.variety && <Badge variant="outline" className="text-xs font-normal text-muted-foreground">{crop.variety}</Badge>}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Farmer Info */}
        <div className="space-y-1 pt-2 border-t border-dashed">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">👨‍🌾 {crop.farmer_id?.name || 'Farmer'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span>{crop.farmer_id?.location || 'Local Farm'}</span>
          </div>
        </div>

        {/* Price & Actions */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-primary">₹{crop.price_per_unit_retail}</span>
              <span className="text-sm text-muted-foreground"> /kg</span>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center border rounded-lg bg-background shadow-sm">
              <button
                className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >-</button>
              <span className="px-2 text-sm font-semibold min-w-[1.5rem] text-center">{quantity}</span>
              <button
                className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors"
                onClick={() => setQuantity(Math.min(crop.Quantity_available_retail, quantity + 1))}
              >+</button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleAddToCart}
              variant="outline"
              className="flex-1 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add
            </Button>
            <Button
              onClick={handleBuyNow}
              className="flex-1 bg-gradient-primary text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
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
