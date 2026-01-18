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
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

const DashboardOverview = () => {

  // Fetch Stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: dashboardAPI.getStats
  });

  // Fetch Recent Orders
  const { data: recentOrdersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['recentOrders'],
    queryFn: dashboardAPI.getRecentOrders
  });

  const stats = [
    {
      title: 'Orders Placed',
      value: statsData?.ordersPlaced || 0,
      change: '+3 this week', // Dynamic calculation requires improved backend logic or comparison
      icon: ShoppingCart,
      trend: 'up',
      bgGradient: 'bg-gradient-primary',
      path: '/orders'
    },
    {
      title: 'Crops Available',
      value: statsData?.cropsAvailable || 0,
      change: '+12 new today',
      icon: Wheat,
      trend: 'up',
      bgGradient: 'bg-gradient-accent',
      path: '/marketplace'
    },
    {
      title: 'Active Price Alerts',
      value: statsData?.activeAlerts || 0,
      change: '2 triggered',
      icon: Bell,
      trend: 'neutral',
      bgGradient: 'bg-gradient-primary',
      path: '/price-tracker'
    },
    {
      title: 'Local Impact',
      value: `₹${statsData?.localImpact?.toLocaleString() || 0}`,
      change: 'Supporting farmers',
      icon: Heart,
      trend: 'up',
      bgGradient: 'bg-gradient-accent'
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
        {statsLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))
        ) : (
          stats.map((stat, index) => {
            const CardComponent = (
              <Card className="border-0 shadow-card hover:shadow-glow transition-all duration-300 hover:scale-105 cursor-pointer h-full">
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
            );

            return stat.path ? (
              <Link key={index} to={stat.path} className="contents block h-full">
                {CardComponent}
              </Link>
            ) : (
              <div key={index} className="contents block h-full">
                {CardComponent}
              </div>
            );
          })
        )}
      </div>

      {/* Recent Orders Table */}
      <Card className="border-0 shadow-card">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold">Recent Orders</CardTitle>
            <Link to="/orders">
              <Button variant="outline" className="border-primary/20 hover:bg-primary/5">
                View All Orders
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
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
                {recentOrdersData && recentOrdersData.length > 0 ? (
                  recentOrdersData.map((order, index) => (
                    <TableRow key={index} className="border-border/50 hover:bg-card-hover transition-colors">
                      <TableCell className="font-medium">{order.displayId || order.id}</TableCell>
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
                              {(order.farmer || 'U').split(' ').map(n => n[0]).join('').slice(0, 2)}
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
                          {/* <Button size="sm" variant="ghost" className="hover:bg-accent/20">
                                    <RotateCcw className="w-4 h-4" />
                                </Button> */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      No recent orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/marketplace" className="contents">
          <Card className="border-0 shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-2">Browse Marketplace</h3>
              <p className="text-muted-foreground text-sm">Discover fresh produce from verified farmers</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/price-tracker" className="contents">
          <Card className="border-0 shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-accent rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-2">Price Tracker</h3>
              <p className="text-muted-foreground text-sm">Monitor crop prices and set alerts</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/orders" className="contents">
          <Card className="border-0 shadow-card hover:shadow-glow transition-all duration-300 cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-lg mb-2">Track Orders</h3>
              <p className="text-muted-foreground text-sm">Follow your orders from farm to table</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default DashboardOverview;
