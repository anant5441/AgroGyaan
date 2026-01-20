import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { farmerAPI } from '../services/api';

const AddCropModal = ({ isOpen, onClose, onSuccess, listingToEdit = null }) => {
    const initialFormState = {
        crop_name: '',
        variety: '',
        price_per_unit_retail: '',
        Quantity_available_retail: '',
        unit_retail: 'kg',
        sale_type: 'retail',
        image_url: '',
        organic_certified: false
    };

    const [formData, setFormData] = useState(initialFormState);

    // Effect to populate form when editing
    useEffect(() => {
        if (isOpen) {
            if (listingToEdit) {
                setFormData({
                    crop_name: listingToEdit.crop_name || '',
                    variety: listingToEdit.variety || '',
                    price_per_unit_retail: listingToEdit.price_per_unit_retail || '',
                    Quantity_available_retail: listingToEdit.Quantity_available_retail || '',
                    unit_retail: listingToEdit.unit_retail || 'kg',
                    sale_type: listingToEdit.sale_type || 'retail',
                    image_url: listingToEdit.image_url || '',
                    organic_certified: listingToEdit.organic_certified || false
                });
            } else {
                setFormData(initialFormState);
            }
        }
    }, [isOpen, listingToEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                // Ensure numbers are numbers
                price_per_unit_retail: Number(formData.price_per_unit_retail),
                Quantity_available_retail: Number(formData.Quantity_available_retail),
                // keep status active if creating, or preserve/update if we were to support status editing here
                // For now, let's just assume we keep it active or don't change it implicitly unless needed
                listing_status: 'active'
            };

            if (listingToEdit) {
                await farmerAPI.updateListing(listingToEdit._id, payload);
            } else {
                await farmerAPI.createListing(payload);
            }

            onSuccess();
            onClose();
            setFormData(initialFormState);
        } catch (err) {
            alert(`Error ${listingToEdit ? 'updating' : 'creating'} listing: ` + err.message);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{listingToEdit ? 'Edit Crop Listing' : 'Add New Crop Listing'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="crop_name">Crop Name</Label>
                        <Input
                            id="crop_name"
                            placeholder="e.g. Tomato"
                            value={formData.crop_name}
                            onChange={e => setFormData({ ...formData, crop_name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="variety">Variety</Label>
                        <Input
                            id="variety"
                            placeholder="e.g. Cherry (Optional)"
                            value={formData.variety}
                            onChange={e => setFormData({ ...formData, variety: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="price">Price (₹)</Label>
                            <Input
                                id="price"
                                type="number"
                                placeholder="20"
                                value={formData.price_per_unit_retail}
                                onChange={e => setFormData({ ...formData, price_per_unit_retail: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="unit">Unit</Label>
                            <Select
                                value={formData.unit_retail}
                                onValueChange={val => setFormData({ ...formData, unit_retail: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="kg">kg</SelectItem>
                                    <SelectItem value="quintal">quintal</SelectItem>
                                    <SelectItem value="ton">ton</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="quantity">Quantity Available</Label>
                        <Input
                            id="quantity"
                            type="number"
                            placeholder="100"
                            value={formData.Quantity_available_retail}
                            onChange={e => setFormData({ ...formData, Quantity_available_retail: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="sale_type">Sale Type</Label>
                        <Select
                            value={formData.sale_type}
                            onValueChange={val => setFormData({ ...formData, sale_type: val })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select sale type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="retail">Retail Only</SelectItem>
                                <SelectItem value="wholesale">Wholesale Only</SelectItem>
                                <SelectItem value="both">Both</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="image">Image URL</Label>
                        <Input
                            id="image"
                            placeholder="https://source.unsplash.com/..."
                            value={formData.image_url}
                            onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center space-x-2 border p-3 rounded-md">
                        <Checkbox
                            id="organic"
                            checked={formData.organic_certified}
                            onCheckedChange={(checked) => setFormData({ ...formData, organic_certified: checked })}
                        />
                        <label
                            htmlFor="organic"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Organic Certified?
                        </label>
                    </div>

                    <Button type="submit" className="w-full">
                        {listingToEdit ? 'Update Listing' : 'Create Listing'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddCropModal;