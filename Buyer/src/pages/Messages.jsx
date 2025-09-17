import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Send, Search, MoreVertical, MessageCircle } from 'lucide-react';

const Messages = () => {
  const [selectedFarmer, setSelectedFarmer] = useState(0);
  
  const farmers = [
    {
      id: 1,
      name: "Ramesh Patel",
      location: "Gujarat",
      verified: true,
      online: true,
      lastMessage: "Thank you for your order!",
      time: "2 min ago",
      unread: 2
    },
    {
      id: 2,
      name: "Priya Sharma", 
      location: "Punjab",
      verified: true,
      online: false,
      lastMessage: "The wheat harvest is ready",
      time: "1 hour ago",
      unread: 0
    },
    {
      id: 3,
      name: "Kumar Singh",
      location: "Uttar Pradesh", 
      verified: true,
      online: true,
      lastMessage: "Can arrange delivery by tomorrow",
      time: "3 hours ago",
      unread: 1
    }
  ];

  const messages = [
    {
      id: 1,
      sender: "farmer",
      content: "Hello! Thank you for showing interest in our fresh tomatoes. They were harvested just yesterday.",
      time: "10:30 AM"
    },
    {
      id: 2,
      sender: "buyer",
      content: "Hi Ramesh! That's great. Can you tell me more about the organic certification?",
      time: "10:32 AM"
    },
    {
      id: 3,
      sender: "farmer", 
      content: "Absolutely! We have been certified organic for 5 years. I can share the certificate with you. Also, we use only natural fertilizers and pesticides.",
      time: "10:35 AM"
    },
    {
      id: 4,
      sender: "buyer",
      content: "Perfect! I'd like to place an order for 25kg. When can you deliver?",
      time: "10:40 AM"
    },
    {
      id: 5,
      sender: "farmer",
      content: "Thank you for your order! I can deliver tomorrow morning between 8-10 AM. Is that convenient for you?",
      time: "10:42 AM"
    }
  ];

  const quickTemplates = [
    "Request bulk quote",
    "Schedule delivery", 
    "Ask about organic certification",
    "Negotiate price"
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Messages</h1>
            <p className="text-muted-foreground">Connect directly with farmers</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
          {/* Farmers List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <CardTitle className="text-lg">Farmers</CardTitle>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input placeholder="Search farmers..." className="pl-10" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {farmers.map((farmer, index) => (
                  <div
                    key={farmer.id}
                    onClick={() => setSelectedFarmer(index)}
                    className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedFarmer === index ? 'bg-muted border-r-2 border-primary' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-lg">
                          👨‍🌾
                        </div>
                        {farmer.online && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-sm truncate">{farmer.name}</span>
                          {farmer.verified && (
                            <Badge className="text-xs px-1 py-0">✓</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{farmer.location}</p>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {farmer.lastMessage}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">{farmer.time}</span>
                          {farmer.unread > 0 && (
                            <Badge className="text-xs w-5 h-5 p-0 flex items-center justify-center bg-accent">
                              {farmer.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-3 flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-lg">
                      👨‍🌾
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{farmers[selectedFarmer].name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Online • {farmers[selectedFarmer].location}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <Separator />
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.sender === 'buyer'
                          ? 'bg-gradient-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'buyer' 
                          ? 'text-primary-foreground/70' 
                          : 'text-muted-foreground'
                      }`}>
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              {/* Quick Templates */}
              <div className="p-4 border-b">
                <p className="text-sm font-medium mb-2">Quick replies:</p>
                <div className="flex flex-wrap gap-2">
                  {quickTemplates.map((template, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {template}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Message Input */}
              <div className="p-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    className="resize-none min-h-0 h-10"
                  />
                  <Button className="bg-gradient-primary hover:shadow-glow">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </DashboardLayout>
  );
};

export default Messages;
