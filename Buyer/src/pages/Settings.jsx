import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Bell, 
  Globe, 
  Shield, 
  CreditCard, 
  Moon, 
  MapPin,
  Phone,
  Mail,
  Building
} from 'lucide-react';

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your account preferences</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Settings */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <CardTitle>Profile Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center text-2xl text-primary-foreground">
                  RK
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">Rajesh Kumar</h3>
                  <Badge variant="secondary">Retail Buyer</Badge>
                  <p className="text-sm text-muted-foreground">Member since January 2024</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" defaultValue="Rajesh Kumar" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="rajesh.kumar@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue="+91 98765 43210" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buyerType">Buyer Type</Label>
                  <Input id="buyerType" defaultValue="Retail Buyer" disabled />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea 
                  id="address" 
                  defaultValue="123 Green Street, Eco City, Maharashtra, India - 411001"
                  className="resize-none"
                />
              </div>
              
              <Button className="bg-gradient-primary hover:shadow-glow">
                Update Profile
              </Button>
            </CardContent>
          </Card>

          {/* Quick Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  <CardTitle className="text-lg">Notifications</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Price Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified of price changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Order Updates</p>
                    <p className="text-sm text-muted-foreground">Track your order status</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Crops</p>
                    <p className="text-sm text-muted-foreground">Discover fresh arrivals</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  <CardTitle className="text-lg">Preferences</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Input defaultValue="English" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-sm text-muted-foreground">Switch to dark theme</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Local First</p>
                    <p className="text-sm text-muted-foreground">Prioritize local farmers</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Business Information (if business buyer) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              <CardTitle>Business Information</CardTitle>
              <Badge variant="outline">Optional</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" placeholder="Enter company name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input id="gstNumber" placeholder="Enter GST number" />
              </div>
            </div>
            <Button variant="outline">Save Business Details</Button>
          </CardContent>
        </Card>

        {/* Security & Privacy */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <CardTitle>Security & Privacy</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline">Change Password</Button>
              <Button variant="outline">Two-Factor Authentication</Button>
              <Button variant="outline">Privacy Settings</Button>
              <Button variant="outline">Download Data</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
