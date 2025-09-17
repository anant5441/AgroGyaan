import React, { useState } from 'react';
import { Download, Filter, Eye, Check, X, Clock, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

// Initial orders data
const initialOrdersData = [
  {
    id: 'ORD-001',
    buyerName: 'Raj Kumar Sharma',
    equipmentName: 'Mahindra 575 DI Tractor',
    status: 'pending',
    paymentStatus: 'pending',
    amount: '₹5,50,000',
    date: '2024-01-15',
    location: 'Pune, Maharashtra'
  },
  {
    id: 'ORD-002',
    buyerName: 'Priya Patel',
    equipmentName: 'Kubota Power Tiller',
    status: 'confirmed',
    paymentStatus: 'completed',
    amount: '₹1,500/day',
    date: '2024-01-14',
    location: 'Mumbai, Maharashtra'
  },
  {
    id: 'ORD-003',
    buyerName: 'Amit Singh',
    equipmentName: 'John Deere Harvester X9',
    status: 'completed',
    paymentStatus: 'completed',
    amount: '₹25,00,000',
    date: '2024-01-12',
    location: 'Nagpur, Maharashtra'
  },
  {
    id: 'ORD-004',
    buyerName: 'Sunita Devi',
    equipmentName: 'Case IH Plough',
    status: 'cancelled',
    paymentStatus: 'refunded',
    amount: '₹85,000',
    date: '2024-01-10',
    location: 'Aurangabad, Maharashtra'
  }
];

export const Orders = () => {
  const [orders, setOrders] = useState(initialOrdersData);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  // Calculate summary data based on current orders
  const summaryData = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      confirmed: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      completed: 'bg-green-500/10 text-green-600 border-green-500/20',
      cancelled: 'bg-red-500/10 text-red-600 border-red-500/20'
    };
    return variants[status] || variants.pending;
  };

  const getPaymentStatusBadge = (status) => {
    const variants = {
      pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
      completed: 'bg-green-500/10 text-green-600 border-green-500/20',
      refunded: 'bg-red-500/10 text-red-600 border-red-500/20'
    };
    return variants[status] || variants.pending;
  };

  // Function to update order status
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: newStatus,
              // Update payment status based on order status
              paymentStatus: newStatus === 'cancelled' ? 'refunded' : 
                            newStatus === 'completed' ? 'completed' : 
                            order.paymentStatus
            } 
          : order
      )
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.buyerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || order.status === activeTab;
    
    // Date filter logic
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.date);
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      switch (dateFilter) {
        case 'today':
          if (orderDate < todayStart) return false;
          break;
        case 'week':
          const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (orderDate < weekStart) return false;
          break;
        case 'month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          if (orderDate < monthStart) return false;
          break;
      }
    }
    
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Orders & Sales</h1>
        <p className="text-muted-foreground">
          Track and manage all your equipment orders and transactions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{summaryData.total}</div>
            <div className="text-sm text-muted-foreground">Total Orders</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{summaryData.pending}</div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{summaryData.confirmed}</div>
            <div className="text-sm text-muted-foreground">Confirmed</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{summaryData.completed}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{summaryData.cancelled}</div>
            <div className="text-sm text-muted-foreground">Cancelled</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Export */}
      <Card className="shadow-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 flex gap-4 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Tabs and Table */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>View and manage all your equipment orders</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="border border-border rounded-xl p-4 hover:bg-muted/50 transition-smooth">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-sm font-medium">{order.id}</span>
                          <Badge className={getStatusBadge(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                          <Badge variant="outline" className={getPaymentStatusBadge(order.paymentStatus)}>
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </Badge>
                        </div>
                        
                        <h3 className="font-semibold text-lg">{order.equipmentName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Buyer: {order.buyerName} • {order.location}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Order Date: {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">{order.amount}</div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          
                          {order.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => updateOrderStatus(order.id, 'confirmed')}
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Confirm
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => updateOrderStatus(order.id, 'cancelled')}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                              </Button>
                            </>
                          )}
                          
                          {order.status === 'confirmed' && (
                            <Button 
                              size="sm" 
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredOrders.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-muted-foreground">
                      No orders found matching your criteria
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};