import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, Truck, CheckCircle, Clock, RotateCcw } from 'lucide-react';

const Orders = () => {
  const orders = [
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
      status: "Processing",
      date: "2024-01-13"
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <CheckCircle className="w-4 h-4" />;
      case 'In Transit': return <Truck className="w-4 h-4" />;
      case 'Processing': return <Package className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Delivered': return 'default';
      case 'In Transit': return 'secondary';
      case 'Processing': return 'outline';
      default: return 'outline';
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
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
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
                {orders.map((order) => (
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
                      <div className="flex gap-2">
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
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Orders;
