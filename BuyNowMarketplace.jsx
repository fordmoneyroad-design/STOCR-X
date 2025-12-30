import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Clock, MapPin, Zap, TrendingDown, Search } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function BuyNowMarketplace() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: buyNowVehicles, isLoading } = useQuery({
    queryKey: ['buy-now-vehicles'],
    queryFn: async () => {
      // Get vehicles over 5 days on site
      const vehicles = await base44.entities.Vehicle.filter({
        status: "available"
      }, "-created_date", 200);
      
      const now = new Date();
      return vehicles.filter(v => {
        const createdDate = new Date(v.created_date);
        const daysOnSite = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
        return daysOnSite >= 5;
      });
    },
    initialData: []
  });

  const { data: copartListings } = useQuery({
    queryKey: ['copart-listings'],
    queryFn: () => base44.entities.CopartListing.filter({ eligible_for_buy_now: true }),
    initialData: []
  });

  const allVehicles = [...buyNowVehicles, ...copartListings];

  const filteredVehicles = allVehicles.filter(v => {
    const matchesSearch = !searchTerm || 
      v.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.model?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesState = selectedState === "all" || v.location?.includes(selectedState) || v.copart_location_state === selectedState;
    const matchesCategory = selectedCategory === "all" || v.category === selectedCategory;
    
    return matchesSearch && matchesState && matchesCategory;
  });

  const uniqueStates = [...new Set(allVehicles.map(v => v.copart_location_state || v.location).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full text-orange-800 mb-4">
            <Zap className="w-5 h-5" />
            <span className="font-semibold">24-Hour Delivery Available</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Buy Now Marketplace
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Vehicles ready for immediate purchase • 5+ days on site • Fast delivery
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8 border-none shadow-lg">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search vehicles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="all">All States</option>
              {uniqueStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 border rounded-lg"
            >
              <option value="all">All Categories</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV</option>
              <option value="truck">Truck</option>
              <option value="luxury">Luxury</option>
              <option value="sports">Sports</option>
              <option value="van">Van</option>
            </select>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white border-none">
            <Clock className="w-8 h-8 mb-2" />
            <p className="text-3xl font-bold">{filteredVehicles.length}</p>
            <p className="text-orange-100">Vehicles Available</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-none">
            <MapPin className="w-8 h-8 mb-2" />
            <p className="text-3xl font-bold">{uniqueStates.length}</p>
            <p className="text-blue-100">States Covered</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white border-none">
            <Zap className="w-8 h-8 mb-2" />
            <p className="text-3xl font-bold">24hr</p>
            <p className="text-green-100">Fast Delivery</p>
          </Card>
        </div>

        {/* Vehicle Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {isLoading ? (
            <p className="col-span-3 text-center py-12 text-gray-500">Loading vehicles...</p>
          ) : filteredVehicles.length > 0 ? (
            filteredVehicles.map((vehicle) => {
              const daysOnSite = vehicle.days_on_site || Math.floor((new Date() - new Date(vehicle.created_date)) / (1000 * 60 * 60 * 24));
              
              return (
                <Card key={vehicle.id} className="overflow-hidden hover:shadow-2xl transition-all border-none">
                  <div className="relative">
                    {vehicle.images && vehicle.images[0] ? (
                      <img
                        src={vehicle.images[0]}
                        alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <p className="text-gray-500">No Image</p>
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2 bg-orange-600">
                      <Clock className="w-3 h-3 mr-1" />
                      {daysOnSite} days
                    </Badge>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </h3>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span>{vehicle.copart_location_city || vehicle.location}, {vehicle.copart_location_state || 'MI'}</span>
                    </div>

                    {vehicle.category && (
                      <Badge className="mb-4">{vehicle.category}</Badge>
                    )}

                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-3xl font-bold text-green-600">
                        ${(vehicle.buy_now_price || vehicle.price)?.toLocaleString()}
                      </span>
                      {vehicle.estimated_value && (
                        <span className="text-sm text-gray-500 line-through">
                          ${vehicle.estimated_value.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={() => navigate(createPageUrl("BuyNowCheckout") + `?vehicleId=${vehicle.id}&type=${vehicle.copart_lot_number ? 'copart' : 'inventory'}`)}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Buy Now - 24hr Delivery
                    </Button>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="col-span-3 p-12 text-center border-none">
              <TrendingDown className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No vehicles found</h3>
              <p className="text-gray-600">Try adjusting your filters</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}