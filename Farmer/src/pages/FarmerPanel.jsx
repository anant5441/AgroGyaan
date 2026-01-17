import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, BarChart, TrendingUp } from "lucide-react";

import MyListings from './MyListings';
import MyOrders from './MyOrders';

const FarmerPanel = () => {
    return (
        <div className="container mx-auto py-10 px-4 min-h-screen">
            <div className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                    Farmer's Dashboard
                </h1>
                <p className="text-muted-foreground">
                    Manage your crops, orders, and track your business growth.
                </p>
            </div>

            <Tabs defaultValue="listings" className="w-full space-y-6">
                <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
                    <TabsTrigger value="listings">My Listings</TabsTrigger>
                    <TabsTrigger value="orders">Orders</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="listings" className="space-y-4">
                    <MyListings />
                </TabsContent>

                <TabsContent value="orders" className="space-y-4">
                    <MyOrders />
                </TabsContent>

                <TabsContent value="analytics">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                                <span className="text-2xl">₹</span>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">₹45,231.89</div>
                                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                                <BarChart className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+12</div>
                                <p className="text-xs text-muted-foreground">+2 since last hour</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Top Selling</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Tomatoes</div>
                                <p className="text-xs text-muted-foreground">500kg sold this week</p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg bg-muted/20">
                        <AreaChart className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-muted-foreground">Detailed Analytics Coming Soon</h3>
                        <p className="text-sm text-muted-foreground/80 text-center max-w-md mt-2">
                            We are building advanced charts to help you visualize your sales trends and crop performance over time.
                        </p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default FarmerPanel;
