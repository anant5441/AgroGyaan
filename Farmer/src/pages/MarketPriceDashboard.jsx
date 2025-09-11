import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, BarChart3, Search, Filter, Calendar as CalendarIcon, MapPin, Info, AlertCircle, Target, Activity, Zap, Eye, ChevronUp, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { motion } from "framer-motion";


/**
 * @typedef {Object} MarketRecord
 * @property {string} State
 * @property {string} District
 * @property {string} Market
 * @property {string} Commodity
 * @property {string} Variety
 * @property {string} Grade
 * @property {string} Arrival_Date
 * @property {string} Min_Price
 * @property {string} Max_Price
 * @property {string} Modal_Price
 * @property {string} Commodity_Code
 */

/**
 * @typedef {Object} ApiResponse
 * @property {number} total
 * @property {number} count
 * @property {MarketRecord[]} records
 */

// Enhanced mock data for demonstration
const mockApiResponse = {
  total: 936,
  count: 936,
  records: [
    {
      State: "Punjab",
      District: "Nawanshahr",
      Market: "Nawanshahar",
      Commodity: "Maize",
      Variety: "Medium",
      Grade: "FAQ",
      Arrival_Date: "05/09/2025",
      Min_Price: "1435",
      Max_Price: "2202",
      Modal_Price: "2144",
      Commodity_Code: "4"
    },
    {
      State: "Punjab",
      District: "Ferozpur",
      Market: "Zira",
      Commodity: "Cauliflower",
      Variety: "Cauliflower",
      Grade: "FAQ",
      Arrival_Date: "05/09/2025",
      Min_Price: "3000",
      Max_Price: "5500",
      Modal_Price: "4500",
      Commodity_Code: "34"
    },
    {
      State: "Punjab",
      District: "Hoshiarpur",
      Market: "Mukerian",
      Commodity: "Cauliflower",
      Variety: "Cauliflower",
      Grade: "FAQ",
      Arrival_Date: "05/09/2025",
      Min_Price: "3500",
      Max_Price: "5500",
      Modal_Price: "4500",
      Commodity_Code: "34"
    },
    {
      State: "Punjab",
      District: "Mohali",
      Market: "Kurali",
      Commodity: "Cauliflower",
      Variety: "Cauliflower",
      Grade: "FAQ",
      Arrival_Date: "05/09/2025",
      Min_Price: "4000",
      Max_Price: "5000",
      Modal_Price: "4500",
      Commodity_Code: "34"
    },
    {
      State: "Punjab",
      District: "Muktsar",
      Market: "Muktsar",
      Commodity: "Cauliflower",
      Variety: "Cauliflower",
      Grade: "FAQ",
      Arrival_Date: "05/09/2025",
      Min_Price: "3800",
      Max_Price: "4200",
      Modal_Price: "4000",
      Commodity_Code: "34"
    },
    {
      State: "Punjab",
      District: "Jalandhar",
      Market: "Jalandhar",
      Commodity: "Wheat",
      Variety: "Local",
      Grade: "FAQ",
      Arrival_Date: "05/09/2025",
      Min_Price: "2500",
      Max_Price: "2800",
      Modal_Price: "2650",
      Commodity_Code: "1"
    },
    {
      State: "Punjab",
      District: "Amritsar",
      Market: "Amritsar",
      Commodity: "Rice",
      Variety: "Basmati",
      Grade: "A",
      Arrival_Date: "05/09/2025",
      Min_Price: "3200",
      Max_Price: "3800",
      Modal_Price: "3500",
      Commodity_Code: "2"
    },
    {
      State: "Punjab",
      District: "Ludhiana",
      Market: "Ludhiana",
      Commodity: "Cotton",
      Variety: "Medium",
      Grade: "FAQ",
      Arrival_Date: "05/09/2025",
      Min_Price: "5500",
      Max_Price: "6200",
      Modal_Price: "5850",
      Commodity_Code: "5"
    },
    {
      State: "Punjab",
      District: "Patiala",
      Market: "Patiala",
      Commodity: "Sugarcane",
      Variety: "Local",
      Grade: "FAQ",
      Arrival_Date: "04/09/2025",
      Min_Price: "3800",
      Max_Price: "4200",
      Modal_Price: "4000",
      Commodity_Code: "6"
    },
    {
      State: "Punjab",
      District: "Bathinda",
      Market: "Bathinda",
      Commodity: "Mustard",
      Variety: "Local",
      Grade: "FAQ",
      Arrival_Date: "04/09/2025",
      Min_Price: "4500",
      Max_Price: "5200",
      Modal_Price: "4850",
      Commodity_Code: "7"
    },
    {
      State: "Punjab",
      District: "Moga",
      Market: "Moga",
      Commodity: "Potato",
      Variety: "Red",
      Grade: "A",
      Arrival_Date: "03/09/2025",
      Min_Price: "1800",
      Max_Price: "2500",
      Modal_Price: "2200",
      Commodity_Code: "8"
    },
    {
      State: "Punjab",
      District: "Kapurthala",
      Market: "Kapurthala",
      Commodity: "Onion",
      Variety: "Red",
      Grade: "A",
      Arrival_Date: "03/09/2025",
      Min_Price: "2200",
      Max_Price: "3000",
      Modal_Price: "2600",
      Commodity_Code: "9"
    }
  ]
};

const customColors = {
  primary: '#8FA31E',
  secondary: '#C6D870',
  accent1: '#CADCAE',
  accent2: '#E1E9C9',
  accent3: '#EDA35A',
  accent4: '#FEE8D9'
};

export function MarketPriceDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    state: 'Punjab',
    district: 'all',
    commodity: 'all',
    arrivalDate: '04/09/2025' // One week before Sep 11, 2025
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 8, 4));

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
const [hoveredCard, setHoveredCard] = useState(null);


  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      setLoading(true);
      // In real implementation: 
      // const response = await fetch(`http://127.0.0.1:8000/api/market-price?state=${filters.state}&arrival_date=${filters.arrivalDate}`);
      // const result = await response.json();
      
      // Using mock data for now
      setTimeout(() => {
        setData(mockApiResponse);
        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, [filters.state, filters.arrivalDate]);

  const handleDateSelect = (date) => {
    if (date) {
      setSelectedDate(date);
      const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
      setFilters(prev => ({ ...prev, arrivalDate: formattedDate }));
    }
    setIsDatePickerOpen(false);
  };

  const filteredRecords = useMemo(() => {
    if (!data) return [];
    
    return data.records.filter(record => {
      const matchesDistrict = filters.district === 'all' || record.District === filters.district;
      const matchesCommodity = filters.commodity === 'all' || record.Commodity === filters.commodity;
      const matchesSearch = !searchTerm || 
        record.Market.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.Commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.District.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesDistrict && matchesCommodity && matchesSearch;
    });
  }, [data, filters, searchTerm]);

  const insights = useMemo(() => {
    if (!filteredRecords.length) return null;

    const prices = filteredRecords.map(r => parseInt(r.Modal_Price));
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const priceRange = maxPrice - minPrice;
    const priceVariation = (priceRange / avgPrice) * 100;
    
    const commodityPrices = filteredRecords.reduce((acc, record) => {
      const commodity = record.Commodity;
      if (!acc[commodity]) {
        acc[commodity] = [];
      }
      acc[commodity].push(parseInt(record.Modal_Price));
      return acc;
    }, {});

    const commodityAvgPrices = Object.entries(commodityPrices).map(([commodity, prices]) => ({
      commodity,
      avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
      count: prices.length,
      volatility: (Math.max(...prices) - Math.min(...prices)) / (prices.reduce((a, b) => a + b, 0) / prices.length) * 100
    }));

    const districtData = filteredRecords.reduce((acc, record) => {
      const district = record.District;
      if (!acc[district]) {
        acc[district] = { count: 0, totalPrice: 0, prices: [] };
      }
      acc[district].count += 1;
      acc[district].totalPrice += parseInt(record.Modal_Price);
      acc[district].prices.push(parseInt(record.Modal_Price));
      return acc;
    }, {});

    const topDistricts = Object.entries(districtData)
      .map(([district, data]) => ({
        district,
        avgPrice: data.totalPrice / data.count,
        count: data.count,
        marketShare: (data.count / filteredRecords.length) * 100
      }))
      .sort((a, b) => b.avgPrice - a.avgPrice)
      .slice(0, 6);

    // Price trend analysis (mock data for demonstration)
    const priceHistory = [
      { date: '01/09', price: avgPrice * 0.95 },
      { date: '02/09', price: avgPrice * 0.98 },
      { date: '03/09', price: avgPrice * 1.02 },
      { date: '04/09', price: avgPrice },
      { date: '05/09', price: avgPrice * 1.03 }
    ];

    return {
      avgPrice: Math.round(avgPrice),
      maxPrice,
      minPrice,
      priceRange,
      priceVariation: Math.round(priceVariation),
      totalRecords: filteredRecords.length,
      uniqueCommodities: commodityAvgPrices.length,
      uniqueDistricts: topDistricts.length,
      commodityAvgPrices,
      topDistricts,
      priceHistory,
      marketVolatility: Math.round(priceVariation > 20 ? priceVariation : 15)
    };
  }, [filteredRecords]);

  // Additional computed data for more insights
  const marketInsights = useMemo(() => {
    if (!insights) return null;

    const mostVolatileCommodity = insights.commodityAvgPrices.reduce((prev, current) => 
      prev.volatility > current.volatility ? prev : current
    );

    const leastVolatileCommodity = insights.commodityAvgPrices.reduce((prev, current) => 
      prev.volatility < current.volatility ? prev : current
    );

    const topPerformingDistrict = insights.topDistricts[0];
    const marketLeader = insights.commodityAvgPrices.reduce((prev, current) => 
      prev.count > current.count ? prev : current
    );

    return {
      mostVolatileCommodity,
      leastVolatileCommodity,
      topPerformingDistrict,
      marketLeader,
      priceStability: insights.priceVariation < 20 ? 'Stable' : insights.priceVariation < 40 ? 'Moderate' : 'Volatile'
    };
  }, [insights]);

  const uniqueDistricts = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.records.map(r => r.District))].sort();
  }, [data]);

  const uniqueCommodities = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.records.map(r => r.Commodity))].sort();
  }, [data]);

  const chartData = useMemo(() => {
    if (!insights) return [];
    return insights.commodityAvgPrices.map(item => ({
      name: item.commodity,
      price: Math.round(item.avgPrice),
      count: item.count,
      volatility: Math.round(item.volatility)
    }));
  }, [insights]);

  const pieData = useMemo(() => {
    if (!insights) return [];
    return insights.topDistricts.map((item, index) => ({
      name: item.district,
      value: item.count,
      marketShare: Math.round(item.marketShare),
      color: [customColors.primary, customColors.secondary, customColors.accent1, customColors.accent3, customColors.accent2, customColors.accent4][index % 6]
    }));
  }, [insights]);

  const priceHistoryData = useMemo(() => {
    if (!insights) return [];
    return insights.priceHistory.map(item => ({
      date: item.date,
      price: Math.round(item.price)
    }));
  }, [insights]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen p-6 space-y-6" style={{ backgroundColor: customColors.accent4 }}>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: customColors.primary }}>
                Market Price Dashboard
              </h1>
              <p className="text-gray-600">Real-time agricultural commodity prices and insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{filters.state}</span>
              </div>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{filters.arrivalDate}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </motion.div>

        {/* Market Insights Alert */}
        {marketInsights && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card style={{ backgroundColor: customColors.accent1, borderColor: customColors.primary }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-full" style={{ backgroundColor: customColors.primary }}>
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium">Market Insights</h3>
                      <p className="text-sm text-gray-600">
                        Market Leader: <span className="font-medium">{marketInsights.marketLeader.commodity}</span> • 
                        Price Stability: <span className="font-medium">{marketInsights.priceStability}</span> • 
                        Top District: <span className="font-medium">{marketInsights.topPerformingDistrict.district}</span>
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={marketInsights.priceStability === 'Stable' ? 'default' : 'destructive'}
                    style={{ backgroundColor: marketInsights.priceStability === 'Stable' ? customColors.secondary : customColors.accent3 }}
                  >
                    {marketInsights.priceStability}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card style={{ backgroundColor: customColors.accent2, borderColor: customColors.accent1 }}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Filters & Search</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">State</label>
                  <Select value={filters.state} onValueChange={(value) => setFilters(prev => ({ ...prev, state: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Punjab">Punjab</SelectItem>
                      <SelectItem value="Haryana">Haryana</SelectItem>
                      <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">District</label>
                  <Select value={filters.district} onValueChange={(value) => setFilters(prev => ({ ...prev, district: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Districts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Districts</SelectItem>
                      {uniqueDistricts.map(district => (
                        <SelectItem key={district} value={district}>{district}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Commodity</label>
                  <Select value={filters.commodity} onValueChange={(value) => setFilters(prev => ({ ...prev, commodity: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Commodities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Commodities</SelectItem>
                      {uniqueCommodities.map(commodity => (
                        <SelectItem key={commodity} value={commodity}>{commodity}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search markets, commodities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Quick Actions</label>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setFilters(prev => ({ ...prev, district: 'all', commodity: 'all' }));
                      setSearchTerm('');
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Enhanced Statistics Cards */}
        {insights && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              onHoverStart={() => setHoveredCard('avg')}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <Card style={{ backgroundColor: customColors.accent1, borderColor: customColors.primary }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Average Price</p>
                      <p className="text-lg font-bold" style={{ color: customColors.primary }}>
                        ₹{insights.avgPrice}
                      </p>
                      <p className="text-xs text-gray-500">Per quintal</p>
                    </div>
                    <BarChart3 className="w-6 h-6" style={{ color: customColors.primary }} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }}>
              <Card style={{ backgroundColor: customColors.accent2, borderColor: customColors.secondary }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Highest Price</p>
                      <p className="text-lg font-bold" style={{ color: customColors.primary }}>
                        ₹{insights.maxPrice}
                      </p>
                      <p className="text-xs text-gray-500">Peak value</p>
                    </div>
                    <TrendingUp className="w-6 h-6" style={{ color: customColors.accent3 }} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }}>
              <Card style={{ backgroundColor: customColors.accent1, borderColor: customColors.secondary }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Lowest Price</p>
                      <p className="text-lg font-bold" style={{ color: customColors.primary }}>
                        ₹{insights.minPrice}
                      </p>
                      <p className="text-xs text-gray-500">Floor value</p>
                    </div>
                    <TrendingDown className="w-6 h-6" style={{ color: customColors.accent3 }} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }}>
              <Card style={{ backgroundColor: customColors.accent2, borderColor: customColors.primary }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Price Range</p>
                      <p className="text-lg font-bold" style={{ color: customColors.primary }}>
                        ₹{insights.priceRange}
                      </p>
                      <p className="text-xs text-gray-500">Variation</p>
                    </div>
                    <Activity className="w-6 h-6" style={{ color: customColors.accent3 }} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }}>
              <Card style={{ backgroundColor: customColors.accent1, borderColor: customColors.secondary }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Markets</p>
                      <p className="text-lg font-bold" style={{ color: customColors.primary }}>
                        {insights.uniqueDistricts}
                      </p>
                      <p className="text-xs text-gray-500">Active districts</p>
                    </div>
                    <Target className="w-6 h-6" style={{ color: customColors.primary }} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }}>
              <Card style={{ backgroundColor: customColors.accent2, borderColor: customColors.accent3 }}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Volatility</p>
                      <p className="text-lg font-bold" style={{ color: customColors.primary }}>
                        {insights.marketVolatility}%
                      </p>
                      <p className="text-xs text-gray-500">Market risk</p>
                    </div>
                    <Zap className="w-6 h-6" style={{ color: customColors.accent3 }} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Enhanced Charts Section */}
        {insights && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Price Trend</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>5-day price movement analysis</p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={priceHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => [`₹${value}`, 'Price']} />
                    <Area type="monotone" dataKey="price" stroke={customColors.primary} fill={customColors.accent1} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Commodity Prices</span>
                  <Badge variant="outline">{chartData.length} items</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <RechartsTooltip 
                      formatter={(value, name) => [
                        name === 'price' ? `₹${value}` : `${value}%`,
                        name === 'price' ? 'Avg Price' : 'Volatility'
                      ]} 
                    />
                    <Bar dataKey="price" fill={customColors.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Market Share</span>
                  <Badge variant="outline">{pieData.reduce((sum, item) => sum + item.value, 0)} records</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      dataKey="value"
                      label={({ name, marketShare }) => `${name}: ${marketShare}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value, name, props) => [`${props.payload.marketShare}%`, 'Market Share']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Market Analysis Cards */}
        {marketInsights && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <Card style={{ backgroundColor: customColors.accent1 }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Most Volatile</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{marketInsights.mostVolatileCommodity.commodity}</p>
                <p className="text-sm text-gray-600">{Math.round(marketInsights.mostVolatileCommodity.volatility)}% variation</p>
                <Progress value={marketInsights.mostVolatileCommodity.volatility} className="mt-2" />
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: customColors.accent2 }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Most Stable</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{marketInsights.leastVolatileCommodity.commodity}</p>
                <p className="text-sm text-gray-600">{Math.round(marketInsights.leastVolatileCommodity.volatility)}% variation</p>
                <Progress value={marketInsights.leastVolatileCommodity.volatility} className="mt-2" />
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: customColors.accent1 }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Top Performing</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{marketInsights.topPerformingDistrict.district}</p>
                <p className="text-sm text-gray-600">₹{Math.round(marketInsights.topPerformingDistrict.avgPrice)} avg price</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-gray-500">{Math.round(marketInsights.topPerformingDistrict.marketShare)}% market share</span>
                </div>
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: customColors.accent2 }}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Market Leader</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{marketInsights.marketLeader.commodity}</p>
                <p className="text-sm text-gray-600">{marketInsights.marketLeader.count} records</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-gray-500">₹{Math.round(marketInsights.marketLeader.avgPrice)} avg price</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Enhanced Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Market Price Details</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{filteredRecords.length} records</Badge>
                  {filters.district !== 'all' && <Badge style={{ backgroundColor: customColors.accent3 }}>{filters.district}</Badge>}
                  {filters.commodity !== 'all' && <Badge style={{ backgroundColor: customColors.secondary }}>{filters.commodity}</Badge>}
                  {searchTerm && <Badge variant="outline">"{searchTerm}"</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <div className="flex items-center space-x-1">
                          <span>District</span>
                          <ChevronUp className="w-3 h-3 text-gray-400" />
                        </div>
                      </TableHead>
                      <TableHead>Market</TableHead>
                      <TableHead>Commodity</TableHead>
                      <TableHead>Variety</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead className="text-right">Min Price (₹)</TableHead>
                      <TableHead className="text-right">Max Price (₹)</TableHead>
                      <TableHead className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <span>Modal Price (₹)</span>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="w-3 h-3 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Most frequently traded price</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Price Range</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.slice(0, 15).map((record, index) => {
                      const priceRange = parseInt(record.Max_Price) - parseInt(record.Min_Price);
                      const priceVariation = (priceRange / parseInt(record.Modal_Price)) * 100;
                      
                      return (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <TableCell className="font-medium">{record.District}</TableCell>
                          <TableCell>{record.Market}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-medium">
                              {record.Commodity}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.Variety}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {record.Grade}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono">₹{record.Min_Price}</TableCell>
                          <TableCell className="text-right font-mono">₹{record.Max_Price}</TableCell>
                          <TableCell className="text-right font-mono font-medium" style={{ color: customColors.primary }}>
                            ₹{record.Modal_Price}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end">
                              <span className="font-mono text-sm">₹{priceRange}</span>
                              <Badge 
                                variant={priceVariation > 20 ? "destructive" : "secondary"}
                                className="text-xs"
                              >
                                {Math.round(priceVariation)}%
                              </Badge>
                            </div>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </TableBody>
                </Table>
                {filteredRecords.length > 15 && (
                  <div className="mt-4 text-center">
                    <Badge variant="outline">
                      Showing first 15 of {filteredRecords.length} records
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </TooltipProvider>
  );
}