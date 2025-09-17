import React from 'react';
import { Package, ShoppingCart, TrendingUp, Users, Plus, Eye } from 'lucide-react';
import heroImage from '../assets/image.png';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Link } from "react-router-dom";

const statsCards = [
  {
    title: 'Total Equipment Listed',
    value: '24',
    change: '+3 this month',
    icon: Package,
    gradient: 'gradient-hero'
  },
  {
    title: 'Active Orders',
    value: '12',
    change: '+2 pending',
    icon: ShoppingCart,
    gradient: 'gradient-accent'
  },
  {
    title: 'Monthly Revenue',
    value: '₹2,45,000',
    change: '+18% from last month',
    icon: TrendingUp,
    gradient: 'gradient-primary'
  },
  {
    title: 'Total Customers',
    value: '156',
    change: '+12 new this month',
    icon: Users,
    gradient: 'gradient-hero'
  }
];

const recentActivity = [
  { type: 'order', message: 'New order for Mahindra Tractor 575', time: '2 hours ago', status: 'pending' },
  { type: 'listing', message: 'John Deere Harvester listing viewed 15 times', time: '4 hours ago', status: 'active' },
  { type: 'message', message: 'New message from Farmer Raj Kumar', time: '6 hours ago', status: 'unread' },
  { type: 'payment', message: 'Payment received for Kubota Tiller', time: '1 day ago', status: 'completed' },
];

export const DashboardOverview = () => {
  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl shadow-card">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-lime-green/90 to-primary/90"></div>
        </div>
        
        <div className="relative z-10 p-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome to AgroGyaan
          </h1>
          <p className="text-white/90 text-lg mb-6 max-w-2xl">
            Manage your equipment listings and connect with farmers across the region. 
            Your one-stop platform for agricultural equipment trading.
          </p>
          <div className="flex gap-4">
            <Link to="/add-equipment" >
                <Button className="btn-accent hover:scale-105 transition-smooth">
                  <Plus className="w-4 h-4 mr-2" />
                  List New Equipment
                </Button>
            </Link>
            <Link to='/equipment'>
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm">
                <Eye className="w-4 h-4 mr-2" />
                View All Listings
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden shadow-card hover:shadow-glow transition-smooth">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-xl ${stat.gradient} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {stat.change}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 shadow-card">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Stay updated with your latest business activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-muted/50 transition-smooth">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'order' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'listing' ? 'bg-green-100 text-green-600' :
                    activity.type === 'message' ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {activity.type === 'order' && <ShoppingCart className="w-4 h-4" />}
                    {activity.type === 'listing' && <Package className="w-4 h-4" />}
                    {activity.type === 'message' && <Users className="w-4 h-4" />}
                    {activity.type === 'payment' && <TrendingUp className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Badge 
                    variant={activity.status === 'completed' ? 'default' : 
                            activity.status === 'pending' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/add-equipment" className="w-full">
              <Button className="w-full justify-start btn-hero">
                <Plus className="w-4 h-4 mr-2" />
                Add New Equipment
              </Button>
            </Link>
            <Button variant="outline" className="w-full justify-start">
              <Package className="w-4 h-4 mr-2" />
              Manage Inventory
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Process Orders
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="w-4 h-4 mr-2" />
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};