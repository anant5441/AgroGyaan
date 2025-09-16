import React, { useState } from 'react';
import { Upload, MapPin, Save, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';

const equipmentTypes = [
  'Tractor', 'Harvester', 'Tiller', 'Plough', 'Seeder', 'Sprayer', 'Thresher', 'Cultivator'
];

const conditions = ['New', 'Good', 'Used'];

export const AddEquipment = () => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    brand: '',
    model: '',
    year: '',
    price: '',
    listingType: 'sale',
    city: '',
    state: '',
    condition: '',
    available: true,
    description: ''
  });

  const [images, setImages] = useState([]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    if (e.target.files) {
      setImages(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', { formData, images });
    // Handle form submission
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">List New Equipment</h1>
        <p className="text-muted-foreground">
          Add your agricultural equipment to reach farmers in your area
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Essential details about your equipment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Equipment Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Mahindra 575 DI Tractor"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Equipment Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment type" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipmentTypes.map(type => (
                      <SelectItem key={type} value={type.toLowerCase()}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="e.g., Mahindra"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="e.g., 575 DI"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year">Manufacturing Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', e.target.value)}
                  placeholder="2023"
                  min="1950"
                  max="2025"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Listing */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Pricing & Listing Type</CardTitle>
            <CardDescription>Set your price and listing preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="500000"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Listing Type</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="listingType"
                      value="sale"
                      checked={formData.listingType === 'sale'}
                      onChange={(e) => handleInputChange('listingType', e.target.value)}
                      className="text-primary"
                    />
                    <span>Sale</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="listingType"
                      value="rent"
                      checked={formData.listingType === 'rent'}
                      onChange={(e) => handleInputChange('listingType', e.target.value)}
                      className="text-primary"
                    />
                    <span>Rent</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select value={formData.condition} onValueChange={(value) => handleInputChange('condition', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map(condition => (
                      <SelectItem key={condition} value={condition.toLowerCase()}>
                        {condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="available">Availability</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="available"
                    checked={formData.available}
                    onCheckedChange={(checked) => handleInputChange('available', checked)}
                  />
                  <span className="text-sm">
                    {formData.available ? 'Available' : 'Not Available'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Location</span>
            </CardTitle>
            <CardDescription>Where is your equipment located?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="e.g., Pune"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="e.g., Maharashtra"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description & Images */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Description & Images</CardTitle>
            <CardDescription>Provide detailed information and photos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your equipment's features, condition, and any additional details..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Equipment Images</Label>
              <div className="border-2 border-dashed border-border/50 rounded-xl p-6 text-center hover:border-primary/50 transition-smooth">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop your images here, or click to browse
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Button variant="outline" asChild>
                  <label htmlFor="image-upload" className="cursor-pointer">
                    Choose Files
                  </label>
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG up to 10MB each
                </p>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline">
            Cancel
          </Button>
          <Button type="submit" className="btn-hero">
            <Save className="w-4 h-4 mr-2" />
            List Equipment
          </Button>
        </div>
      </form>
    </div>
  );
};