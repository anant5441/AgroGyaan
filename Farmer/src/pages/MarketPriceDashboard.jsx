import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Search, 
  Filter, 
  Calendar as CalendarIcon, 
  MapPin, 
  Info, 
  AlertCircle, 
  Target, 
  Activity, 
  Zap, 
  Eye, 
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Sparkles,
  PieChart,
  LineChart,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart as RechartsLineChart, Line, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from "framer-motion";
import { statesName } from '@/constants/statesName';
import { format } from 'date-fns';
import { toast } from 'sonner';
// Enhanced mock data
// const mockApiResponse = {
//   total: 936,
//   count: 936,
//   records: [
//     {
//       State: "Punjab",
//       District: "Nawanshahr", 
//       Market: "Nawanshahar",
//       Commodity: "Maize",
//       Variety: "Medium",
//       Grade: "FAQ",
//       Arrival_Date: "05/09/2025",
//       Min_Price: "1435",
//       Max_Price: "2202", 
//       Modal_Price: "2144",
//       Commodity_Code: "4"
//     },
//     {
//       State: "Punjab",
//       District: "Ferozpur",
//       Market: "Zira", 
//       Commodity: "Cauliflower",
//       Variety: "Cauliflower",
//       Grade: "FAQ",
//       Arrival_Date: "05/09/2025", 
//       Min_Price: "3000",
//       Max_Price: "5500",
//       Modal_Price: "4500",
//       Commodity_Code: "34"
//     },
//     {
//       State: "Punjab",
//       District: "Hoshiarpur",
//       Market: "Mukerian",
//       Commodity: "Cauliflower", 
//       Variety: "Cauliflower",
//       Grade: "FAQ",
//       Arrival_Date: "05/09/2025",
//       Min_Price: "3500",
//       Max_Price: "5500", 
//       Modal_Price: "4500", 
//       Commodity_Code: "34"
//     },
//     {
//       State: "Punjab",
//       District: "Mohali",
//       Market: "Kurali",
//       Commodity: "Cauliflower",
//       Variety: "Cauliflower", 
//       Grade: "FAQ",
//       Arrival_Date: "05/09/2025",
//       Min_Price: "4000",
//       Max_Price: "5000",
//       Modal_Price: "4500",
//       Commodity_Code: "34"
//     },
//     {
//       State: "Punjab",
//       District: "Muktsar", 
//       Market: "Muktsar",
//       Commodity: "Cauliflower",
//       Variety: "Cauliflower",
//       Grade: "FAQ",
//       Arrival_Date: "05/09/2025",
//       Min_Price: "3800",
//       Max_Price: "4200",
//       Modal_Price: "4000", 
//       Commodity_Code: "34"
//     },
//     {
//       State: "Punjab",
//       District: "Jalandhar",
//       Market: "Jalandhar",
//       Commodity: "Wheat",
//       Variety: "Local",
//       Grade: "FAQ", 
//       Arrival_Date: "05/09/2025",
//       Min_Price: "2500",
//       Max_Price: "2800",
//       Modal_Price: "2650",
//       Commodity_Code: "1"  
//     },
//     {
//       State: "Punjab",
//       District: "Amritsar",
//       Market: "Amritsar",
//       Commodity: "Rice",
//       Variety: "Basmati",
//       Grade: "A",
//       Arrival_Date: "05/09/2025",
//       Min_Price: "3200", 
//       Max_Price: "3800",
//       Modal_Price: "3500",
//       Commodity_Code: "2"
//     },
//     {
//       State: "Punjab", 
//       District: "Ludhiana",
//       Market: "Ludhiana",
//       Commodity: "Cotton",
//       Variety: "Medium",
//       Grade: "FAQ",
//       Arrival_Date: "05/09/2025",
//       Min_Price: "5500",
//       Max_Price: "6200",
//       Modal_Price: "5850",
//       Commodity_Code: "5"
//     }
//   ]
// };

// Custom hook for enhanced pagination


// Pagination


export function MarketPriceDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const formattedYesterday = format(yesterday, 'dd/MM/yyyy');
  const [filters, setFilters] = useState({
    state: 'Punjab',
    district: 'all', 
    commodity: 'all',
    arrivalDate: formattedYesterday,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(yesterday);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [selectedInsight, setSelectedInsight] = useState(null);

  // const pagination = usePagination(filteredRecords, 12);

  const usePagination = (data, itemsPerPage) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);
  
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);
  
  return {
    currentData,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
    totalItems: data.length,
    limit: itemsPerPage
  };
};

  const filteredRecords = useMemo(() => {
    if (!data || !data.records ) return [];
    
    let records = data.records.filter(record => {
      const matchesDistrict = filters.district === 'all' || record.District === filters.district;
      const matchesCommodity = filters.commodity === 'all' || record.Commodity === filters.commodity;
      const matchesSearch = !searchTerm || 
        record.Market.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.Commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.District.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesDistrict && matchesCommodity && matchesSearch;
    });

    // Apply sorting
    if (sortConfig.key) {
      records.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle numeric values
        if (sortConfig.key.includes('Price')) {
          aValue = parseInt(aValue);
          bValue = parseInt(bValue);
        }
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return records;
  }, [data, filters, searchTerm, sortConfig]);

  const pagination = usePagination(filteredRecords, 12);

  // const pagination = usePagination(filteredRecords, 12);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setApiError(null);
        
        // Build query parameters
        const params = new URLSearchParams({
          state: filters.state,
          // page: pagination.currentPage,
          // limit: pagination.limit
        });
        
        if (filters.district !== 'all') {
          params.append('district', filters.district);
        }
        
        if (filters.commodity !== 'all') {
          params.append('commodity', filters.commodity);
        }
        
        if (filters.arrivalDate) {
          params.append('arrival_date', filters.arrivalDate);
        }
        
        const response = await fetch(
          `http://127.0.0.1:8000/api/market-price?${params.toString()}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.error) {
          setApiError(result.error);
          setData({ total: 0, count: 0, records: [] });
          toast.error(result.error);
        } else {
          setData(result.data);
          toast.success(`Data loaded for ${result.used_date || 'latest available date'}`);
        }
      } catch (error) {
        console.error("Error fetching market price data:", error);
        const errorMsg = "Failed to fetch data. Please try again.";
        setApiError(errorMsg);
        setData({ total: 0, count: 0, records: [] });
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters.state, filters.district, filters.commodity, filters.arrivalDate]);

  // const handleDateSelect = (date) => {
  //   if (date) {
  //     setSelectedDate(date);
  //     const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  //     setFilters(prev => ({ ...prev, arrivalDate: formattedDate }));
  //   }
  //   setIsDatePickerOpen(false);
  // };

  // Enhanced filtering logic
  // const filteredRecords = useMemo(() => {
  //   if (!data || !data.records) return [];
    
  //   return data.records.filter(record => {
  //     const matchesDistrict = filters.district === 'all' || record.District === filters.district;
  //     const matchesCommodity = filters.commodity === 'all' || record.Commodity === filters.commodity;
  //     const matchesSearch = !searchTerm || 
  //       record.Market.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       record.Commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       record.District.toLowerCase().includes(searchTerm.toLowerCase());
      
  //     return matchesDistrict && matchesCommodity && matchesSearch;
  //   });
  // }, [data, filters, searchTerm]);

  


  // Pagination
  // const pagination = usePagination(filteredRecords, 12);

  // Enhanced insights calculation
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

    // Mock price history for trend analysis
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

  // Chart data
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
    const colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--warning))', 'hsl(var(--surface))', 'hsl(var(--muted))'];
    return insights.topDistricts.map((item, index) => ({
      name: item.district,
      value: item.count,
      marketShare: Math.round(item.marketShare),
      color: colors[index % colors.length]
    }));
  }, [insights]);

  // Unique values for filters
  const uniqueDistricts = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.records.map(r => r.District))].sort();
  }, [data]);

  const uniqueCommodities = useMemo(() => {
    if (!data) return [];
    return [...new Set(data.records.map(r => r.Commodity))].sort();
  }, [data]);

  // Date handling
  const handleDateSelect = (date) => {
  if (date) {
    setSelectedDate(date);
    const formattedDate = format(date, 'dd/MM/yyyy');
    setFilters(prev => ({ ...prev, arrivalDate: formattedDate }));
    setIsDatePickerOpen(false);
  }
};

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return 'Select date';
    try {
      const [day, month, year] = dateStr.split('/');
      return format(new Date(parseInt(year), parseInt(month) - 1, parseInt(day)), 'MMM dd, yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  // Loading simulation
  const refreshData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted rounded-xl w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-xl loading-shimmer"></div>
              ))}
            </div>
            <div className="h-96 bg-muted rounded-xl loading-shimmer"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background transition-colors duration-300">
        <div className="container mx-auto p-6 space-y-8">
          {/* Enhanced Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0"
          >
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Market Price Dashboard
                  </h1>
                  <p className="text-muted-foreground text-lg">Real-time agricultural commodity insights</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-surface border">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="font-medium">{filters.state}</span>
              </div>
              
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="space-x-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span>{formatDisplayDate(filters.arrivalDate)}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>

              <Button variant="outline" size="icon" onClick={refreshData}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              
              <DarkModeToggle />
            </div>
          </motion.div>

          {/* Market Insights Banner */}
          {insights && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="lovable-card gradient-surface border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">Today's Market Pulse</h3>
                        <p className="text-muted-foreground">
                          <span className="font-medium text-primary">{insights.totalRecords}</span> active markets • 
                          <span className="font-medium text-secondary ml-1">₹{insights.avgPrice}</span> avg price • 
                          <span className="font-medium text-warning ml-1">{insights.marketVolatility}%</span> volatility
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={insights.marketVolatility < 20 ? "default" : "destructive"}
                      className="text-sm px-4 py-2"
                    >
                      {insights.marketVolatility < 20 ? "Stable Market" : "High Volatility"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Enhanced Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="lovable-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-primary" />
                  <span>Smart Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">State</label>
                    <Select
                      value={filters.state}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, state: value }))}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {statesName.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">District</label>
                    <Select 
                      value={filters.district} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, district: value }))}
                    >
                      <SelectTrigger className="h-11">
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
                    <Select 
                      value={filters.commodity} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, commodity: value }))}
                    >
                      <SelectTrigger className="h-11">
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
                    <label className="text-sm font-medium">Search Markets</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search markets, commodities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Actions</label>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setFilters(prev => ({ ...prev, district: 'all', commodity: 'all' }));
                        setSearchTerm('');
                      }}
                      className="w-full h-11"
                    >
                      Clear All Filters
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
              {[
                { 
                  title: "Average Price", 
                  value: `₹${insights.avgPrice}`, 
                  subtitle: "Per quintal",
                  icon: BarChart3,
                  trend: "neutral",
                  gradient: "gradient-primary"
                },
                { 
                  title: "Highest Price", 
                  value: `₹${insights.maxPrice}`, 
                  subtitle: "Peak value",
                  icon: TrendingUp,
                  trend: "up",
                  gradient: "gradient-accent"
                },
                { 
                  title: "Lowest Price", 
                  value: `₹${insights.minPrice}`, 
                  subtitle: "Floor value",
                  icon: TrendingDown,
                  trend: "down",
                  gradient: "gradient-surface"
                },
                { 
                  title: "Price Range", 
                  value: `₹${insights.priceRange}`, 
                  subtitle: "Variation",
                  icon: Activity,
                  trend: "neutral",
                  gradient: "gradient-primary"
                },
                { 
                  title: "Active Markets", 
                  value: insights.uniqueDistricts, 
                  subtitle: "Districts",
                  icon: Target,
                  trend: "neutral",
                  gradient: "gradient-accent"
                },
                { 
                  title: "Volatility", 
                  value: `${insights.marketVolatility}%`, 
                  subtitle: "Risk level",
                  icon: Zap,
                  trend: insights.marketVolatility > 20 ? "up" : "neutral",
                  gradient: "gradient-surface"
                }
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  whileHover={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.2 }}
                  className="cursor-pointer"
                >
                  <Card className="lovable-card h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-10 h-10 rounded-lg ${stat.gradient} flex items-center justify-center shadow-sm`}>
                          <stat.icon className="w-5 h-5 text-white" />
                        </div>
                        {stat.trend === "up" && <TrendingUp className="w-4 h-4 text-success" />}
                        {stat.trend === "down" && <TrendingDown className="w-4 h-4 text-destructive" />}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold text-foreground mt-1">
                          {stat.value}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {stat.subtitle}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
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
              <Card className="lovable-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <LineChart className="w-5 h-5 text-primary" />
                      <span>Price Trend</span>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>Price Trend Analysis</DialogTitle>
                        </DialogHeader>
                        <div className="h-96">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={insights.priceHistory}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <RechartsTooltip formatter={(value) => [`₹${Math.round(Number(value))}`, 'Price']} />
                              <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" strokeWidth={3} />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={insights.priceHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => [`₹${Math.round(Number(value))}`, 'Price']} />
                      <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lovable-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      <span>Commodity Prices</span>
                    </div>
                    <Badge variant="outline">{chartData.length} items</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} fontSize={10} />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => [`₹${value}`, 'Avg Price']} />
                      <Bar dataKey="price" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lovable-card">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <PieChart className="w-5 h-5 text-primary" />
                      <span>Market Share</span>
                    </div>
                    <Badge variant="outline">{pieData.reduce((sum, item) => sum + item.value, 0)} records</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        dataKey="value"
                        label={({ marketShare }) => `${marketShare}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value, name, props) => [`${props.payload.marketShare}%`, 'Share']} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Enhanced Data Table with Pagination */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="lovable-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <span>Market Data</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {pagination.totalItems} total • Page {pagination.currentPage} of {pagination.totalPages}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>District</TableHead>
                        <TableHead>Market</TableHead>
                        <TableHead>Commodity</TableHead>
                        <TableHead>Variety</TableHead>
                        <TableHead className="text-right">Min Price (₹)</TableHead>
                        <TableHead className="text-right">Max Price (₹)</TableHead>
                        <TableHead className="text-right">Modal Price (₹)</TableHead>
                        <TableHead className="text-right">Volatility</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence mode="wait">
                        {pagination.currentData.map((record, index) => {
                          const priceRange = parseInt(record.Max_Price) - parseInt(record.Min_Price);
                          const priceVariation = (priceRange / parseInt(record.Modal_Price)) * 100;
                          
                          return (
                            <motion.tr
                              key={`${record.Market}-${index}`}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                              className="hover:bg-accent/50 transition-colors cursor-pointer"
                            >
                              <TableCell className="font-medium">{record.District}</TableCell>
                              <TableCell>{record.Market}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-medium">
                                  {record.Commodity}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs">
                                  {record.Variety}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right font-mono">₹{record.Min_Price}</TableCell>
                              <TableCell className="text-right font-mono">₹{record.Max_Price}</TableCell>
                              <TableCell className="text-right font-mono font-bold text-primary">
                                ₹{record.Modal_Price}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge 
                                  variant={priceVariation > 20 ? "destructive" : "secondary"}
                                  className="text-xs"
                                >
                                  {Math.round(priceVariation)}%
                                </Badge>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>

                {/* Enhanced Pagination */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {((pagination.currentPage - 1) * 12) + 1} to {Math.min(pagination.currentPage * 12, pagination.totalItems)} of {pagination.totalItems} results
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={pagination.prevPage}
                      disabled={!pagination.hasPrev}
                      className="space-x-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={pagination.currentPage === pageNum ? "default" : "ghost"}
                            size="sm"
                            onClick={() => pagination.goToPage(pageNum)}
                            className="w-8 h-8"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      {pagination.totalPages > 5 && (
                        <>
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => pagination.goToPage(pagination.totalPages)}
                            className="w-8 h-8"
                          >
                            {pagination.totalPages}
                          </Button>
                        </>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={pagination.nextPage}
                      disabled={!pagination.hasNext}
                      className="space-x-1"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
  );
} 