import React from 'react';
import { 
  ShoppingCart, 
  Wheat, 
  Bell, 
  Heart,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Eye,
  RotateCcw,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import buyer from '@/assets/buyer.jpg';

const DashboardOverview = () => {
  const stats = [
    {
      title: 'Orders Placed',
      value: '24',
      change: '+3 this week',
      icon: ShoppingCart,
      trend: 'up',
      bgGradient: 'bg-gradient-primary'
    },
    {
      title: 'Crops Available',
      value: '156',
      change: '+12 new today',
      icon: Wheat,
      trend: 'up',
      bgGradient: 'bg-gradient-accent'
    },
    {
      title: 'Active Price Alerts',
      value: '8',
      change: '2 triggered',
      icon: Bell,
      trend: 'neutral',
      bgGradient: 'bg-gradient-primary'
    },
    {
      title: 'Local Impact',
      value: '₹45,200',
      change: 'Supporting 12 farmers',
      icon: Heart,
      trend: 'up',
      bgGradient: 'bg-gradient-accent'
    }
  ];

  const recentOrders = [
    {
      id: '#AGY001',
      crop: 'Organic Tomatoes',
      farmer: 'Suresh Patil',
      quantity: '25 kg',
      price: '₹750',
      status: 'Delivered',
      location: 'Pune, MH'
    },
    {
      id: '#AGY002',
      crop: 'Fresh Onions',
      farmer: 'Ramesh Singh',
      quantity: '50 kg',
      price: '₹800',
      status: 'In Transit',
      location: 'Nashik, MH'
    },
    {
      id: '#AGY003',
      crop: 'Organic Potatoes',
      farmer: 'Kavita Sharma',
      quantity: '30 kg',
      price: '₹450',
      status: 'Processing',
      location: 'Indore, MP'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
  {/* Welcome Section */}
  <div className="relative bg-gradient-primary rounded-3xl p-12 text-primary-foreground overflow-hidden">
    {/* Background Image with Gradient Overlay */}
    <div
      className="absolute inset-0 z-0"
      style={{
        backgroundImage: `url(${buyer})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-background/10 via-background/20 to-background/30"></div>
    </div>

    {/* Foreground Content */}
    <div className="relative z-10">
      <h1 className="text-2xl font-bold mb-2">Welcome back, Rajesh! 🌾</h1>
      <p className="text-primary-foreground/90">
        Fresh produce from 45+ verified farmers is available today. Check out
        the seasonal specials!
      </p>
    </div>
</div>


  {/* Stats Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-card hover:shadow-glow transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgGradient} rounded-2xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                {stat.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : stat.trend === 'down' ? (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                ) : null}
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-xs text-success mt-2">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders Table */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Recent Orders</CardTitle>
            <Button variant="outline" className="border-primary/20 hover:bg-primary/5">
              View All Orders
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead>Order ID</TableHead>
                <TableHead>Crop</TableHead>
                <TableHead>Farmer</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order, index) => (
                <TableRow key={index} className="border-border/50 hover:bg-card-hover transition-colors">
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.crop}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {order.location}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                        <span className="text-xs text-primary-foreground font-bold">
                          {order.farmer.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">{order.farmer}</div>
                        <Badge variant="secondary" className="text-xs">Verified</Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell className="font-semibold">{order.price}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        order.status === 'Delivered' ? 'default' :
                        order.status === 'In Transit' ? 'secondary' : 'outline'
                      }
                      className={
                        order.status === 'Delivered' ? 'bg-success text-success-foreground' :
                        order.status === 'In Transit' ? 'bg-accent text-accent-foreground' : ''
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="hover:bg-primary/5">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="hover:bg-accent/20">
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="font-bold text-lg mb-2">Browse Marketplace</h3>
            <p className="text-muted-foreground text-sm">Discover fresh produce from verified farmers</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-accent rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-8 h-8 text-accent-foreground" />
            </div>
            <h3 className="font-bold text-lg mb-2">Price Tracker</h3>
            <p className="text-muted-foreground text-sm">Monitor crop prices and set alerts</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <MapPin className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="font-bold text-lg mb-2">Track Orders</h3>
            <p className="text-muted-foreground text-sm">Follow your orders from farm to table</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;
