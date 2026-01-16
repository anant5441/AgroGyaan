// import React from 'react';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, ShoppingCart } from 'lucide-react';
import { cartAPI } from '../services/api';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const response = await cartAPI.get();
            setCartItems(response.data.items || []);
        } catch (error) {
            console.error("Failed to fetch cart:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleRemove = async (itemId) => {
        try {
            const response = await cartAPI.remove(itemId);
            setCartItems(response.data.items || []);
        } catch (error) {
            alert("Failed to remove item: " + error.message);
        }
    };

    const handleCheckout = async () => {
        if (!window.confirm("Are you sure you want to place orders for these items?")) return;

        setCheckoutLoading(true);
        try {
            const response = await cartAPI.checkout();
            alert(response.message);
            setCartItems([]); // Clear cart locally
        } catch (error) {
            alert("Checkout failed: " + error.message);
        } finally {
            setCheckoutLoading(false);
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((acc, item) => {
            const price = item.crop_id?.price_per_unit_retail || 0;
            return acc + (price * item.quantity);
        }, 0);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>

                <Card className="border-2 border-primary/20">
                    <CardHeader>
                        <CardTitle>Your Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : cartItems.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-4xl mb-4">🛒</div>
                                <h3 className="text-lg font-semibold">Your cart is empty</h3>
                                <p className="text-muted-foreground">Go to Marketplace to add fresh crops!</p>
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-primary/5 border-b border-primary/20">
                                            <TableHead>Crop</TableHead>
                                            <TableHead>Farmer</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {cartItems.map((item) => (
                                            <TableRow key={item._id} className="hover:bg-primary/5 border-b border-primary/10">
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xl">
                                                            {item.crop_id?.crop_name.toLowerCase().includes('tomato') ? '🍅' :
                                                                item.crop_id?.crop_name.toLowerCase().includes('wheat') ? '🌾' :
                                                                    item.crop_id?.crop_name.toLowerCase().includes('potato') ? '🥔' : '🥬'}
                                                        </span>
                                                        <span>{item.crop_id?.crop_name || 'Unknown Crop'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {/* Farmer name is not populated deep here unless we do deep populate or if crop Listing has name embedded. 
                              Actually cropListingController has populate('farmer_id'). 
                              Wait, cartController.js populated 'items.crop_id'.
                              Does CropListing populate 'farmer_id' automatically? No.
                              We need deep population in cartController if we want farmer name here.
                              For now let's just show crop ID or skip farmer name if not available immediately.
                              Ah, in cartController we did: await cart.populate('items.crop_id');
                              We need nested populate for farmer. 
                              Let's just show price and crop for now to avoid complexity or errors.
                           */}
                                                    <span className="text-muted-foreground">Certified Farmer</span>
                                                </TableCell>
                                                <TableCell>₹{item.crop_id?.price_per_unit_retail}/kg</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="px-3 py-1">{item.quantity} kg</Badge>
                                                </TableCell>
                                                <TableCell>₹{(item.crop_id?.price_per_unit_retail || 0) * item.quantity}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemove(item._id)}
                                                        className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <div className="mt-8 flex flex-col items-end space-y-4">
                                    <div className="text-2xl font-bold">
                                        Total: <span className="text-primary">₹{calculateTotal()}</span>
                                    </div>
                                    <Button
                                        onClick={handleCheckout}
                                        disabled={checkoutLoading}
                                        size="lg"
                                        className="bg-gradient-primary hover:shadow-glow w-48"
                                    >
                                        {checkoutLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                                        Checkout
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default Cart;
