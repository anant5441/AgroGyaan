import React, { useEffect, useState } from 'react';
import { farmerAPI } from '../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    farmerAPI.getOrders().then(res => setOrders(res.data || []));
  }, []);
  const handleStatusChange = async (orderId, newStatus) => {
    await farmerAPI.updateOrderStatus(orderId, newStatus);
    const updated = await farmerAPI.getOrders();
    setOrders(updated.data);
  };
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Received Orders</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Item</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order._id}>
              <TableCell className="font-mono">{order._id.slice(-6)}</TableCell>
              <TableCell>{order.crop_id?.crop_name} (x{order.quantity})</TableCell>
              <TableCell>
                <div>{order.buyer_id?.name || 'Unknown'}</div>
                <div className="text-xs text-gray-500">{order.buyer_id?.phone}</div>
              </TableCell>
              <TableCell>₹{order.price_total}</TableCell>
              <TableCell>
                <Select defaultValue={order.status} onValueChange={(val) => handleStatusChange(order._id, val)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
export default MyOrders;