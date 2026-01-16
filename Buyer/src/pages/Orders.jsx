import React, { useEffect, useMemo, useState } from "react";
import { ordersAPI } from "@/services/api";
import DashboardLayout from "@/components/DashboardLayout";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Truck, CheckCircle, Clock, RotateCcw, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Orders = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await ordersAPI.getAll();
        setOrders(res.data);
      } catch (err) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Filter
  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    return orders.filter((o) => o.status === activeTab);
  }, [orders, activeTab]);

  // Status UI
  const statusIcon = {
    pending: <Clock className="w-4 h-4" />,
    confirmed: <Package className="w-4 h-4" />,
    delivered: <CheckCircle className="w-4 h-4" />,
    cancelled: <X className="w-4 h-4" />,
  };

  const statusVariant = {
    pending: "outline",
    confirmed: "secondary",
    delivered: "default",
    cancelled: "destructive",
  };

  const updateOrder = async (id, status) => {
    try {
      await ordersAPI.updateStatus(id, status);
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status } : o))
      );
      toast({ title: "Order updated" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleReorder = async (id) => {
    try {
      await ordersAPI.reorder(id);
      toast({ title: "Reorder placed successfully!" });
      // Refresh list
      const res = await ordersAPI.getAll();
      setOrders(res.data);
    } catch (err) {
      toast({ title: "Reorder failed", description: err.message, variant: "destructive" });
    }
  };

  if (loading) return <div className="p-8">Loading…</div>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Orders</h1>

        <Card>
          <CardHeader>
            <CardTitle>Order Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Crop</TableHead>
                      <TableHead>Farmer</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredOrders.map((o) => (
                      <TableRow key={o._id}>
                        <TableCell>{o.displayId || o._id.slice(-6)}</TableCell>
                        <TableCell>{o.crop_id?.crop_name || 'Unknown Crop'}</TableCell>
                        <TableCell>{o.crop_id?.farmer_id?.name || 'Unknown Farmer'}</TableCell>
                        <TableCell>{o.quantity}</TableCell>
                        <TableCell>₹{o.price_total}</TableCell>
                        <TableCell>
                          <Badge
                            variant={statusVariant[o.status]}
                            className="flex gap-1 w-fit"
                          >
                            {statusIcon[o.status]}
                            {o.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="space-x-2">
                          {o.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateOrder(o._id, "confirmed")
                                }
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  updateOrder(o._id, "cancelled")
                                }
                              >
                                Cancel
                              </Button>
                            </>
                          )}

                          {o.status === "confirmed" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                updateOrder(o._id, "delivered")
                              }
                            >
                              Complete
                            </Button>
                          )}

                          {["delivered", "cancelled"].includes(o.status) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReorder(o._id)}
                            >
                              <RotateCcw className="w-4 h-4 mr-1" />
                              Reorder
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
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
