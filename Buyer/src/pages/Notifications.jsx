import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Package, MessageCircle, CreditCard, Settings, CheckCircle, X } from 'lucide-react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Order Delivered',
      message: 'Your order #ORD-2024-001 of Fresh Tomatoes has been delivered successfully.',
      category: 'orders',
      date: '2024-01-15 10:30 AM',
      isRead: false
    },
    {
      id: '2',
      title: 'New Message from Ramesh Patel',
      message: 'Farmer has sent you a message regarding bulk pricing for organic wheat.',
      category: 'messages',
      date: '2024-01-15 09:15 AM',
      isRead: false
    },
    {
      id: '3',
      title: 'Payment Successful',
      message: 'Payment of ₹1,125 for order #ORD-2024-001 processed successfully.',
      category: 'payments',
      date: '2024-01-14 06:45 PM',
      isRead: true
    },
    {
      id: '4',
      title: 'Price Alert',
      message: 'Price for Organic Wheat has dropped by 15% in your area.',
      category: 'system',
      date: '2024-01-14 02:20 PM',
      isRead: false
    },
    {
      id: '5',
      title: 'Order Confirmed',
      message: 'Your order #ORD-2024-003 of Fresh Potatoes has been confirmed by Kumar Singh.',
      category: 'orders',
      date: '2024-01-13 11:00 AM',
      isRead: true
    }
  ]);

  const [activeTab, setActiveTab] = useState('all');

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'orders': return <Package className="w-4 h-4" />;
      case 'messages': return <MessageCircle className="w-4 h-4" />;
      case 'payments': return <CreditCard className="w-4 h-4" />;
      case 'system': return <Settings className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'orders': return 'bg-primary/10 text-primary';
      case 'messages': return 'bg-accent/10 text-accent';
      case 'payments': return 'bg-success/10 text-success';
      case 'system': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.isRead;
    return notification.category === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated with your orders, messages, and alerts
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={markAllAsRead}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
            <Button variant="destructive" onClick={clearAll}>
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              All Notifications
              {unreadCount > 0 && (
                <Badge className="bg-accent text-accent-foreground">
                  {unreadCount} unread
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="system">System</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-4 mt-6">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications found</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <Card 
                      key={notification.id} 
                      className={`border-2 transition-all duration-200 hover:shadow-soft ${
                        notification.isRead 
                          ? 'border-border bg-card' 
                          : 'border-primary/20 bg-primary/5'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`p-2 rounded-lg ${getCategoryColor(notification.category)}`}>
                              {getCategoryIcon(notification.category)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground">
                                  {notification.title}
                                </h3>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                                )}
                              </div>
                              <p className="text-muted-foreground text-sm mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline" 
                                  className="text-xs capitalize"
                                >
                                  {notification.category}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {notification.date}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!notification.isRead && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </DashboardLayout>
  );
};

export default Notifications;
