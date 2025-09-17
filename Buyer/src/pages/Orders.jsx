// import React from 'react';
import React, { useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Package, Truck, CheckCircle, Clock, RotateCcw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Truck, CheckCircle, Clock, RotateCcw, X } from 'lucide-react';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const Orders = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([
    {
      id: "ORD-2024-001",
      crop: "Fresh Tomatoes",
      farmer: "Ramesh Patel",
      quantity: "25 kg",
      price: "₹1,125",
      status: "Delivered",
      date: "2024-01-15"
    },
    {
      id: "ORD-2024-002", 
      crop: "Organic Wheat",
      farmer: "Priya Sharma",
      quantity: "50 kg",
      price: "₹1,400",
      status: "In Transit",
      date: "2024-01-14"
    },
    {
      id: "ORD-2024-003",
      crop: "Fresh Potatoes", 
      farmer: "Kumar Singh",
      quantity: "30 kg",
      price: "₹1,050",
      status: "Pending",
      date: "2024-01-13"
    },
    {
      id: "ORD-2024-004",
      crop: "Organic Apples",
      farmer: "Sita Sharma",
      quantity: "15 kg",
      price: "₹900",
      status: "Confirmed",
      date: "2024-01-12"
    },
    {
      id: "ORD-2024-005",
      crop: "Fresh Onions",
      farmer: "Ravi Kumar",
      quantity: "40 kg",
      price: "₹800",
      status: "Cancelled",
      date: "2024-01-11"
    }
  ]);

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orders;
    return orders.filter(order => {
      switch (activeTab) {
        case 'pending': return order.status === 'Pending';
        case 'confirmed': return order.status === 'Confirmed';
        case 'completed': return order.status === 'Delivered';
        case 'cancelled': return order.status === 'Cancelled';
        default: return true;
      }
    });
  }, [orders, activeTab]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <CheckCircle className="w-4 h-4" />;
      case 'In Transit': return <Truck className="w-4 h-4" />;
      case 'Confirmed': return <Package className="w-4 h-4" />;
      case 'Pending': return <Clock className="w-4 h-4" />;
      case 'Cancelled': return <X className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'In Transit': return 'secondary';
      case 'Confirmed': return 'outline';
      case 'Pending': return 'outline';
      case 'Cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const handleOrderAction = (orderId, action) => {
    setOrders(prevOrders => 
      prevOrders.map(order => {
        if (order.id === orderId) {
          switch (action) {
            case 'confirm':
              toast({
                title: "Order Confirmed",
                description: `Order ${orderId} has been confirmed.`,
              });
              return { ...order, status: 'Confirmed' };
            case 'cancel':
              toast({
                title: "Order Cancelled",
                description: `Order ${orderId} has been cancelled.`,
              });
              return { ...order, status: 'Cancelled' };
            case 'complete':
              toast({
                title: "Order Completed",
                description: `Order ${orderId} has been marked as completed.`,
              });
              return { ...order, status: 'Delivered' };
            case 'reorder':
              toast({
                title: "Reorder Placed",
                description: `A new order has been placed for ${order.crop}.`,
              });
              return order;
            default:
              return order;
          }
        }
        return order;
      })
    );
  };

  const getOrderActions = (order) => {
    switch (order.status) {
      case 'Pending':
        return (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              onClick={() => handleOrderAction(order.id, 'confirm')}
              className="bg-gradient-primary hover:shadow-glow"
            >
              Confirm
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => handleOrderAction(order.id, 'cancel')}
            >
              Cancel
            </Button>
          </div>
        );
      case 'Confirmed':
        return (
          <Button 
            size="sm" 
            onClick={() => handleOrderAction(order.id, 'complete')}
            className="bg-gradient-primary hover:shadow-glow"
          >
            Mark Completed
          </Button>
        );
      case 'Delivered':
      case 'Cancelled':
        return (
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleOrderAction(order.id, 'reorder')}
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reorder
          </Button>
        );
      default:
        return (
          <Button size="sm" variant="outline">
            Track
          </Button>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
            <p className="text-muted-foreground">Track your purchases and order history</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-primary rounded-2xl">
                  <Package className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-accent rounded-2xl">
                  <Truck className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-sm text-muted-foreground">In Transit</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-primary rounded-2xl">
                  <CheckCircle className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">9</p>
                  <p className="text-sm text-muted-foreground">Delivered</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Order Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All Orders</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                <div className="mb-4">
                  <p className="text-muted-foreground">
                    Showing {filteredOrders.length} orders
                  </p>
                </div>
                
                <Table>
              <TableHeader>
                <TableRow>
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
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No orders found in this category</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.crop}</TableCell>
                    <TableCell>{order.farmer}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell className="font-semibold">{order.price}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)} className="flex items-center gap-1 w-fit">
                        {getStatusIcon(order.status)}
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {/* <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Track
                        </Button>
                        <Button size="sm" variant="ghost">
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Reorder
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table> */}
             {getOrderActions(order)}
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </DashboardLayout>
  );
};

export default Orders;
