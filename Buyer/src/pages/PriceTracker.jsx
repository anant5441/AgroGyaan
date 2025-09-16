import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Bell, AlertTriangle } from 'lucide-react';

const PriceTracker = () => {
  const priceData = [
    { date: 'Jan 10', tomatoes: 42, wheat: 25, potatoes: 32 },
    { date: 'Jan 11', tomatoes: 45, wheat: 26, potatoes: 34 },
    { date: 'Jan 12', tomatoes: 44, wheat: 28, potatoes: 35 },
    { date: 'Jan 13', tomatoes: 47, wheat: 27, potatoes: 33 },
    { date: 'Jan 14', tomatoes: 45, wheat: 29, potatoes: 35 },
    { date: 'Jan 15', tomatoes: 48, wheat: 28, potatoes: 36 },
  ];

  const priceAlerts = [
    {
      crop: "Tomatoes",
      currentPrice: "₹48/kg",
      change: "+6.7%",
      trend: "up",
      reason: "High demand due to festival season"
    },
    {
      crop: "Wheat", 
      currentPrice: "₹28/kg",
      change: "+3.7%",
      trend: "up",
      reason: "Export demand increase"
    },
    {
      crop: "Potatoes",
      currentPrice: "₹36/kg", 
      change: "+2.9%",
      trend: "up",
      reason: "Supply chain disruption"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Price Tracker</h1>
            <p className="text-muted-foreground">Monitor crop prices and market trends</p>
          </div>
          <Button className="bg-gradient-primary hover:shadow-glow">
            <Bell className="w-4 h-4 mr-2" />
            Set Alert
          </Button>
        </div>

        <Card className="bg-gradient-accent border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-primary-foreground" />
              <span className="font-semibold text-primary-foreground">Price Alert</span>
            </div>
            <p className="text-primary-foreground/90">
              Tomato prices have increased by 6.7% in the last 24 hours. Consider buying now before further increase.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Price Trends (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="tomatoes" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    name="Tomatoes (₹/kg)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="wheat" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={3}
                    name="Wheat (₹/kg)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="potatoes" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={3}
                    name="Potatoes (₹/kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {priceAlerts.map((alert, index) => (
            <Card key={index} className="border-2 border-primary/20 hover:shadow-glow transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{alert.crop}</h3>
                  <Badge className={`flex items-center gap-1 ${
                    alert.trend === 'up' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {alert.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {alert.change}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-primary">{alert.currentPrice}</div>
                  <p className="text-sm text-muted-foreground">{alert.reason}</p>
                </div>
                
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PriceTracker;
