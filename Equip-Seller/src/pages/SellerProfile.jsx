import React, { useState } from 'react';
import { Camera, Edit, Mail, Phone, MapPin, Calendar, Star, Building, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useToast } from '../hooks/use-toast';

const profileData = {
  name: 'John Farmer',
  email: 'john.farmer@email.com',
  phone: '+91 9876543210',
  avatar: '',
  bio: 'Experienced agricultural equipment dealer with 15+ years in the farming industry. Specializing in tractors and modern farming equipment.',
  businessName: 'Green Valley Agricultural Equipment',
  licenseNumber: 'AGR-LIC-2024-001',
  businessAddress: '123 Farm Road, Pune, Maharashtra 411001',
  businessDescription: 'Leading supplier of quality agricultural equipment serving farmers across Maharashtra. We offer both new and used equipment with warranty support.',
  joinDate: '2019-03-15',
  verified: true,
  rating: 4.8,
  reviewsCount: 245,
  stats: {
    equipmentListed: 48,
    completedDeals: 127,
    customerRating: 4.8,
    reviewsCount: 245
  }
};

export const SellerProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profileData);
  const { toast } = useToast();

  const handleSave = () => {
    // Simulate API call
    setTimeout(() => {
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    }, 1000);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Seller Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile information and business details
        </p>
      </div>

      {/* Profile Header */}
      <Card className="shadow-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={formData.avatar} />
                <AvatarFallback className="text-xl font-semibold bg-primary/10">
                  {getInitials(formData.name)}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                onClick={() => {/* Handle image upload */}}
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">{formData.name}</h2>
                {formData.verified && (
                  <Badge className="bg-blue-100 text-blue-800">
                    Verified
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  {renderStars(formData.rating)}
                  <span className="ml-2 font-medium">{formData.rating}</span>
                  <span className="text-muted-foreground">({formData.reviewsCount} reviews)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(formData.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>

              <p className="text-muted-foreground">{formData.bio}</p>
            </div>

            <div className="flex gap-2">
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                      Update your profile information and business details
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 py-4">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={formData.bio}
                          onChange={(e) => handleInputChange('bio', e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Business Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Business Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="businessName">Business Name</Label>
                          <Input
                            id="businessName"
                            value={formData.businessName}
                            onChange={(e) => handleInputChange('businessName', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="licenseNumber">License Number</Label>
                          <Input
                            id="licenseNumber"
                            value={formData.licenseNumber}
                            onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="businessAddress">Business Address</Label>
                        <Textarea
                          id="businessAddress"
                          value={formData.businessAddress}
                          onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor="businessDescription">Business Description</Label>
                        <Textarea
                          id="businessDescription"
                          value={formData.businessDescription}
                          onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{formData.stats.equipmentListed}</div>
            <div className="text-sm text-muted-foreground">Equipment Listed</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{formData.stats.completedDeals}</div>
            <div className="text-sm text-muted-foreground">Completed Deals</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{formData.stats.customerRating}</div>
            <div className="text-sm text-muted-foreground">Customer Rating</div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{formData.stats.reviewsCount}</div>
            <div className="text-sm text-muted-foreground">Reviews Count</div>
          </CardContent>
        </Card>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Email</div>
                <div className="font-medium">{formData.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Phone</div>
                <div className="font-medium">{formData.phone}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Member Since</div>
                <div className="font-medium">{new Date(formData.joinDate).toLocaleDateString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Business Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Building className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Business Name</div>
                <div className="font-medium">{formData.businessName}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">License Number</div>
                <div className="font-medium">{formData.licenseNumber}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Business Address</div>
                <div className="font-medium">{formData.businessAddress}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Description */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Business Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            {formData.businessDescription}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};