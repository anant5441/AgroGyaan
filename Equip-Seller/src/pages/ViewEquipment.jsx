import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Search, Filter, Grid3X3, List, Edit, Eye, MapPin, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../components/ui/alert-dialog';
import { useToast } from '../hooks/use-toast';
import tillingMachine from "../assets/tilling-machine.jpg";
import tractor from "../assets/tractor.jpg";
import harvester from "../assets/harvester.jpg";

const equipmentData = [
  {
    id: 1,
    name: 'Mahindra 575 DI Tractor',
    type: 'Tractor',
    brand: 'Mahindra',
    price: '₹5,50,000',
    listingType: 'sale',
    location: 'Pune, Maharashtra',
    condition: 'Good',
    available: true,
    views: 156,
    image: tractor
  },
  {
    id: 2,
    name: 'John Deere Harvester X9',
    type: 'Harvester',
    brand: 'John Deere',
    price: '₹25,00,000',
    listingType: 'sale',
    location: 'Nagpur, Maharashtra',
    condition: 'New',
    available: true,
    views: 89,
    image: harvester
  },
  {
    id: 3,
    name: 'Kubota Power Tiller',
    type: 'Tiller',
    brand: 'Kubota',
    price: '₹1,500/day',
    listingType: 'rent',
    location: 'Mumbai, Maharashtra',
    condition: 'Good',
    available: false,
    views: 234,
    image: tillingMachine
  }
];

export const ViewEquipment = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [equipment, setEquipment] = useState([]); // Start empty
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch listings on mount
  React.useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await api.equipmentListings.getMyListings();
        // Transform data if needed to match UI expectations (e.g., adding image placeholder if missing)
        const mappedData = data.map(item => ({
          id: item._id,
          name: item.name,
          type: item.type,
          brand: item.brand || 'Unknown', // Backend might not strict require brand
          price: `₹${item.price}`,
          listingType: item.listing_type,
          location: item.city ? `${item.city}, ${item.state}` : 'Unknown Location',
          condition: item.condition || 'Used',
          available: item.availability,
          views: 0, // Backend doesn't track views yet
          image: item.image_url || tractor // Use URL or fallback
        }));
        setEquipment(mappedData);
      } catch (error) {
        console.error("Failed to fetch listings:", error);
        toast({
          title: "Error",
          description: "Failed to load your listings. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [toast]);

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type.toLowerCase() === filterType;
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price':
        const priceA = parseFloat(a.price.replace(/[₹,]/g, ''));
        const priceB = parseFloat(b.price.replace(/[₹,]/g, ''));
        return priceA - priceB;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'views':
        return b.views - a.views;
      default:
        return new Date(b.id).getTime() - new Date(a.id).getTime(); // Sort by ID as proxy for date
    }
  });

  const handleDelete = async (id) => {
    try {
      await api.equipmentListings.delete(id);
      setEquipment(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Equipment deleted",
        description: "The equipment has been successfully removed from your listings.",
      });
    } catch (error) {
      console.error("Failed to delete listing:", error);
      toast({
        title: "Error",
        description: "Failed to delete listing.",
        variant: "destructive"
      });
    }
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterType('all');
    setSortBy('date');
    toast({
      title: "Filters reset",
      description: "All filters have been reset to default values.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Your Equipment Listings</h1>
        <p className="text-muted-foreground">
          Manage and monitor all your agricultural equipment listings
        </p>
      </div>

      {/* Filters and Controls */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search and Filters */}
            <div className="flex-1 flex gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search equipment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="tractor">Tractor</SelectItem>
                  <SelectItem value="harvester">Harvester</SelectItem>
                  <SelectItem value="tiller">Tiller</SelectItem>
                  <SelectItem value="plough">Plough</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date Added</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="views">Views</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredEquipment.length} of {equipmentData.length} equipment
        </p>
        <Button variant="outline" size="sm" onClick={resetFilters}>
          <Filter className="w-4 h-4 mr-2" />
          Reset Filters
        </Button>
      </div>

      {/* Equipment Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((equipment) => (
            <Card key={equipment.id} className="shadow-card hover:shadow-glow transition-smooth">
              <div className="relative">
                <img
                  src={equipment.image}
                  alt={equipment.name}
                  className="w-full h-48 object-cover rounded-t-xl"
                />
                <div className="absolute top-3 right-3">
                  <Badge
                    variant={equipment.available ? 'default' : 'secondary'}
                    className="bg-white/90 text-foreground"
                  >
                    {equipment.available ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
                <div className="absolute top-3 left-3">
                  <Badge variant="outline" className="bg-white/90">
                    {equipment.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{equipment.name}</h3>
                    <p className="text-sm text-muted-foreground">{equipment.brand} • {equipment.condition}</p>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1" />
                    {equipment.location}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">{equipment.price}</span>
                    <span className="text-sm text-muted-foreground">{equipment.views} views</span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive" className="w-full mt-2">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Equipment</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{equipment.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(equipment.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-card">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredEquipment.map((equipment) => (
                <div key={equipment.id} className="p-4 hover:bg-muted/50 transition-smooth">
                  <div className="flex items-center gap-4">
                    <img
                      src={equipment.image}
                      alt={equipment.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{equipment.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {equipment.brand} • {equipment.condition}
                          </p>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            {equipment.location}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{equipment.price}</div>
                          <div className="text-sm text-muted-foreground">{equipment.views} views</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex gap-2">
                          <Badge variant={equipment.available ? 'default' : 'secondary'}>
                            {equipment.available ? 'Available' : 'Unavailable'}
                          </Badge>
                          <Badge variant="outline">
                            {equipment.listingType === 'sale' ? 'For Sale' : 'For Rent'}
                          </Badge>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Equipment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{equipment.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(equipment.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};