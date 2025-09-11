import React from "react";
import { MapPin, Clock, Star, Phone, Navigation } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const NearbyShops = () => {
  // Mock data - in real app this would come from location-based API
  const shops = [
    {
      id: 1,
      name: "Green Earth Organics",
      type: "Organic Fertilizers & Compost",
      distance: "2.3 miles",
      rating: 4.8,
      address: "1245 Farm Lane, Berkeley, CA",
      phone: "(510) 555-0123",
      hours: "8 AM - 6 PM",
      specialties: ["Compost", "Organic Fertilizers", "Seeds"],
      verified: true
    },
    {
      id: 2,
      name: "Nature's Bounty Supply",
      type: "Complete Organic Solutions",
      distance: "3.7 miles",
      rating: 4.6,
      address: "892 Organic Way, Oakland, CA",
      phone: "(510) 555-0456",
      hours: "7 AM - 7 PM",
      specialties: ["Tools", "Soil Amendments", "Pest Control"],
      verified: true
    },
    {
      id: 3,
      name: "Sustainable Farms Co-op",
      type: "Local Farming Cooperative",
      distance: "5.1 miles",
      rating: 4.9,
      address: "456 Harvest Street, Fremont, CA",
      phone: "(510) 555-0789",
      hours: "9 AM - 5 PM",
      specialties: ["Bulk Compost", "Mulch", "Organic Seeds"],
      verified: false
    },
    {
      id: 4,
      name: "EcoGrow Garden Center",
      type: "Organic Garden Supplies",
      distance: "6.8 miles",
      rating: 4.4,
      address: "789 Green Avenue, San Leandro, CA",
      phone: "(510) 555-0321",
      hours: "8 AM - 8 PM",
      specialties: ["Fertilizers", "Tools", "Consultation"],
      verified: true
    }
  ];

  return (
    <Card className="p-8 bg-card border-secondary">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">Nearby Organic Suppliers</h2>
          <p className="text-muted-foreground">
            Find organic fertilizers, compost, and farming supplies near you
          </p>
        </div>

        <div className="grid gap-6">
          {shops.map((shop) => (
            <Card
              key={shop.id}
              className="p-6 bg-gradient-to-tr from-farmgreen to-orange-50 border-secondary hover:shadow-warm transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-semibold text-foreground">{shop.name}</h3>
                    {shop.verified && (
                      <Badge
                        variant="secondary"
                        className="bg-primary/10 text-primary border-primary/20"
                      >
                        Verified
                      </Badge>
                    )}
                  </div>

                  <p className="text-accent font-medium">{shop.type}</p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{shop.distance}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-current text-accent" />
                      <span>{shop.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{shop.hours}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{shop.address}</p>

                  <div className="flex flex-wrap gap-2">
                    {shop.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 lg:flex-col">
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    Get Directions
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Call Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center pt-4">
          <p className="text-sm text-muted-foreground">
            Can't find what you need?{" "}
            <button className="text-primary hover:underline">
              Submit a request
            </button>{" "}
            for additional suppliers in your area.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default NearbyShops;
