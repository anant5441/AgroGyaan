import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Sprout, 
  Scissors, 
  Package, 
  Truck, 
  CheckCircle, 
  QrCode,
  Download,
  Search
} from 'lucide-react';

const Traceability = () => {
  const traceabilitySteps = [
    {
      icon: Sprout,
      title: "Planting",
      date: "Dec 1, 2023",
      location: "Farm: Ramesh Patel, Gujarat",
      status: "completed",
      description: "Organic tomato seeds planted in certified organic soil"
    },
    {
      icon: Scissors,
      title: "Harvest",
      date: "Jan 10, 2024", 
      location: "Farm: Ramesh Patel, Gujarat",
      status: "completed",
      description: "Fresh tomatoes harvested at optimal ripeness"
    },
    {
      icon: Package,
      title: "Packaging",
      date: "Jan 10, 2024",
      location: "Processing Center, Gujarat",
      status: "completed", 
      description: "Sorted, cleaned and packaged in food-grade containers"
    },
    {
      icon: Truck,
      title: "Shipment",
      date: "Jan 11, 2024",
      location: "En route to distribution center",
      status: "completed",
      description: "Temperature-controlled transport maintaining cold chain"
    },
    {
      icon: CheckCircle,
      title: "Delivered",
      date: "Jan 12, 2024",
      location: "Your Location",
      status: "completed",
      description: "Successfully delivered to customer location"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Traceability</h1>
            <p className="text-muted-foreground">Track your produce from farm to table</p>
          </div>
          <Button className="bg-gradient-primary hover:shadow-glow">
            <QrCode className="w-4 h-4 mr-2" />
            Scan QR Code
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <Input 
              placeholder="Enter batch ID or scan QR code..." 
              className="w-full"
            />
          </div>
          <Button variant="outline">
            <Search className="w-4 h-4 mr-2" />
            Track
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Farm-to-Table Journey</CardTitle>
                  <Badge className="bg-gradient-primary">Batch: TOM-2024-001</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Fresh Tomatoes - 25kg</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {traceabilitySteps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`p-3 rounded-full ${
                        step.status === 'completed' 
                          ? 'bg-gradient-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      {index < traceabilitySteps.length - 1 && (
                        <div className="w-px h-12 bg-border mt-2" />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{step.title}</h3>
                        <span className="text-sm text-muted-foreground">{step.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{step.location}</p>
                      <p className="text-sm">{step.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Certification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Badge className="bg-green-100 text-green-700">Organic Certified</Badge>
                  <Badge className="bg-blue-100 text-blue-700">Quality Verified</Badge>
                  <Badge className="bg-purple-100 text-purple-700">Farmer Verified</Badge>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="font-medium">Quality Metrics</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Freshness Score</span>
                      <span className="font-medium">9.5/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Organic Rating</span>
                      <span className="font-medium">100%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transit Time</span>
                      <span className="font-medium">2 days</span>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Certificate
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Farmer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-2xl">
                    👨‍🌾
                  </div>
                  <div>
                    <h4 className="font-medium">Ramesh Patel</h4>
                    <p className="text-sm text-muted-foreground">Verified Farmer</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Farm Location</span>
                    <span>Gujarat, India</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Farming Experience</span>
                    <span>15 years</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Organic Certified</span>
                    <span>✅ Yes</span>
                  </div>
                </div>
                
                <Button variant="outline" size="sm" className="w-full">
                  Contact Farmer
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </DashboardLayout>
  );
};

export default Traceability;
