import React, { useEffect, useState } from 'react';
import { farmerAPI } from '../services/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit } from "lucide-react";
import AddCropModal from '../components/AddCropModal';

const MyListings = () => {
    const [listings, setListings] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchListings = async () => {
        try {
            const data = await farmerAPI.getMyListings();
            setListings(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => { fetchListings(); }, []);

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this listing?")) return;
        try {
            await farmerAPI.deleteListing(id);
            fetchListings();
        } catch (err) {
            console.error(err);
            alert("Failed to delete: " + err.message);
        }
    };


    const getCropEmoji = (name) => {
        const n = name.toLowerCase();
        if (n.includes('tomato')) return '🍅';
        if (n.includes('wheat')) return '🌾';
        if (n.includes('potato')) return '🥔';
        if (n.includes('corn') || n.includes('maize')) return '🌽';
        if (n.includes('rice')) return '🍚';
        if (n.includes('lettuce')) return '🥬';
        if (n.includes('apple')) return '🍎';
        if (n.includes('banana')) return '🍌';
        if (n.includes('carrot')) return '🥕';
        if (n.includes('onion')) return '🧅';
        return '🌱'; // default
    };

    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">My Crop Listings</h1>
                    <p className="text-muted-foreground mt-1">Manage what you sell to the world</p>
                </div>

                <Button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto bg-gradient-primary">
                    <Plus className="mr-2 h-4 w-4" /> Add New Crop
                </Button>
            </div>

            {listings.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 rounded-lg border-2 border-dashed">
                    <h3 className="text-xl font-medium text-muted-foreground">No listings yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">Start by adding your first crop!</p>
                    <Button onClick={() => setIsModalOpen(true)} variant="outline">
                        <Plus className="mr-2 h-4 w-4" /> Add Crop
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map(crop => (
                        <Card key={crop._id} className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-primary/10">
                            <div className="relative h-48 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                {crop.image_url ? (
                                    <img
                                        src={crop.image_url}
                                        alt={crop.crop_name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://via.placeholder.com/400x200?text=No+Image";
                                            e.target.style.display = 'none'; // hide broken image to show fallback if we had one, but strict replace is easier
                                            e.target.parentElement.innerHTML = `<span class="text-6xl">${getCropEmoji(crop.crop_name)}</span>`;
                                        }}
                                    />
                                ) : (
                                    <span className="text-6xl animate-bounce-slow">{getCropEmoji(crop.crop_name)}</span>
                                )}

                                <div className="absolute top-2 right-2 flex gap-1">
                                    <Badge variant={crop.listing_status === 'active' ? "default" : "secondary"}>
                                        {crop.listing_status}
                                    </Badge>
                                    {crop.organic_certified && (
                                        <Badge className="bg-green-500 hover:bg-green-600">Organic</Badge>
                                    )}
                                </div>
                            </div>

                            <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">{crop.crop_name}</h3>
                                        {crop.variety && <p className="text-sm text-gray-500">{crop.variety}</p>}
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-bold text-primary">₹{crop.price_per_unit_retail}</span>
                                        <span className="text-xs text-muted-foreground block">/{crop.unit_retail}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4 bg-muted/30 p-2 rounded">
                                    <span>Available Stock:</span>
                                    <span className="font-semibold text-gray-800">{crop.Quantity_available_retail} {crop.unit_retail}</span>
                                </div>

                                <div className="flex gap-2 pt-2 border-t">
                                    {/* Placeholder for Edit - separate task */}
                                    <Button variant="outline" size="sm" className="flex-1">
                                        <Edit className="w-4 h-4 mr-2" /> Edit
                                    </Button>
                                    <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleDelete(crop._id)}>
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <AddCropModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchListings}
            />
        </div>
    );
};

export default MyListings;