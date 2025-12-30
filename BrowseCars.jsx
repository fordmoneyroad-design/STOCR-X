
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, Car, ArrowLeft, Shield, Building2, AlertCircle, Clock } from "lucide-react";
import VehicleCard from "../components/vehicles/VehicleCard";
import { createPageUrl } from "@/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BrowseCars() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState({
    make: "",
    minPrice: "",
    maxPrice: "",
    year: "",
    transmission: "",
    condition: "",
    category: "",
    status: "available" // Show available by default
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
        }
      } catch (err) {
        // Not authenticated
      }
    };
    checkAuth();
  }, []);

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['vehicles', filters, user],
    queryFn: async () => {
      let query = { status: filters.status || "available" };
      
      if (filters.make) query.make = filters.make;
      if (filters.minPrice || filters.maxPrice) {
        query.price = {};
        if (filters.minPrice) query.price.$gte = parseFloat(filters.minPrice);
        if (filters.maxPrice) query.price.$lte = parseFloat(filters.maxPrice);
      }
      if (filters.year) query.year = parseInt(filters.year);
      if (filters.transmission) query.transmission = filters.transmission;
      if (filters.condition) query.condition = filters.condition;
      if (filters.category) query.category = filters.category;

      const results = await base44.entities.Vehicle.filter(query, "-created_date", 200);
      
      // Filter by subscription tier
      if (user) {
        const userTier = user.subscription_tier || 'free';
        const tierHierarchy = {
          'free': ['free'],
          'standard': ['free', 'standard'],
          'premium': ['free', 'standard', 'premium'],
          'military': ['free', 'standard', 'premium', 'military'],
          'travelers': ['free', 'standard', 'premium', 'military', 'travelers'],
          'high_end': ['free', 'standard', 'premium', 'military', 'travelers', 'high_end'],
          'lifetime': ['free', 'standard', 'premium', 'military', 'travelers', 'high_end', 'lifetime']
        };
        
        return results.filter(v => {
          if (!v.requires_tier) return true;
          return tierHierarchy[userTier]?.includes(v.requires_tier);
        });
      }
      
      return results.filter(v => !v.requires_tier || v.requires_tier === 'free');
    },
    initialData: []
  });

  // Track search
  useEffect(() => {
    if (user && (searchTerm || filters.minPrice || filters.maxPrice)) {
      const trackSearch = async () => {
        try {
          await base44.entities.SearchTracking.create({
            user_email: user.email,
            search_query: searchTerm,
            price_range_min: filters.minPrice ? parseFloat(filters.minPrice) : null,
            price_range_max: filters.maxPrice ? parseFloat(filters.maxPrice) : null,
            filters_applied: filters,
            results_count: filteredVehicles.length,
            user_subscription_tier: user.subscription_tier || 'free',
            zip_code: user.zip_code
          });
        } catch (err) {
          console.error("Search tracking error:", err);
        }
      };
      
      const timeoutId = setTimeout(trackSearch, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, filters, user]);

  const filteredVehicles = vehicles.filter(vehicle => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      vehicle.make?.toLowerCase().includes(search) ||
      vehicle.model?.toLowerCase().includes(search) ||
      vehicle.year?.toString().includes(search)
    );
  });

  const comingSoonVehicles = filteredVehicles.filter(v => v.status === "reserved");
  const availableVehicles = filteredVehicles.filter(v => v.status === "available");

  const clearFilters = () => {
    setFilters({
      make: "",
      minPrice: "",
      maxPrice: "",
      year: "",
      transmission: "",
      condition: "",
      category: "",
      status: "available"
    });
    setSearchTerm("");
  };

  const handleVehicleClick = async (vehicleId) => {
    if (user && !user.onboarding_completed) {
      navigate(createPageUrl("Onboarding") + `?returnTo=${createPageUrl("CarDetails")}?id=${vehicleId}`);
      return;
    }
    
    navigate(createPageUrl("CarDetails") + `?id=${vehicleId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Home"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* User Badges */}
        {user && (
          <div className="flex gap-3 mb-6">
            {user.military_badge_earned && (
              <Badge className="bg-green-700 text-white px-4 py-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Military VIP
              </Badge>
            )}
            {user.high_end_company_badge && (
              <Badge className="bg-yellow-600 text-white px-4 py-2 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                High-End Business
              </Badge>
            )}
            {user.is_lifetime_member && (
              <Badge className="bg-purple-700 text-white px-4 py-2">
                Lifetime Member
              </Badge>
            )}
          </div>
        )}

        {/* Important Notice */}
        <Alert className="mb-8 bg-orange-50 border-orange-200">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>USED CARS ONLY - AS-IS:</strong> All vehicles are sold in current condition. Inspect before purchase. Drive as-is.
          </AlertDescription>
        </Alert>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Browse Our Fleet
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {user ? `Showing vehicles for ${user.subscription_tier || 'free'} tier` : 'Sign up to unlock more vehicles'}
          </p>
        </div>

        {/* Status Toggle */}
        <div className="flex gap-3 mb-6 justify-center">
          <Button
            onClick={() => setFilters({...filters, status: "available"})}
            className={filters.status === "available" ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-300 text-gray-700 hover:bg-gray-400"}
          >
            Available Now ({availableVehicles.length})
          </Button>
          <Button
            onClick={() => setFilters({...filters, status: "reserved"})}
            className={filters.status === "reserved" ? "bg-orange-600 text-white hover:bg-orange-700" : "bg-gray-300 text-gray-700 hover:bg-gray-400"}
          >
            <Clock className="w-4 h-4 mr-2" />
            Coming Soon ({comingSoonVehicles.length})
          </Button>
        </div>

        <div className="mb-8 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by make, model, or year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="h-12"
          >
            <SlidersHorizontal className="w-5 h-5 mr-2" />
            Filters
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {showFilters && (
            <div className="lg:col-span-1">
              <Card className="p-6 sticky top-24">
                <h3 className="font-bold text-lg mb-4">Filters</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Price Range</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Min"
                        type="number"
                        value={filters.minPrice}
                        onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                      />
                      <Input
                        placeholder="Max"
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Make</label>
                    <select
                      value={filters.make}
                      onChange={(e) => setFilters({...filters, make: e.target.value})}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">All Makes</option>
                      <option value="Toyota">Toyota</option>
                      <option value="Honda">Honda</option>
                      <option value="Ford">Ford</option>
                      <option value="Chevrolet">Chevrolet</option>
                      <option value="BMW">BMW</option>
                      <option value="Mercedes-Benz">Mercedes-Benz</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({...filters, category: e.target.value})}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">All Categories</option>
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="truck">Truck</option>
                      <option value="luxury">Luxury</option>
                      <option value="sports">Sports</option>
                      <option value="van">Van</option>
                      <option value="auction">Auction</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Condition</label>
                    <select
                      value={filters.condition}
                      onChange={(e) => setFilters({...filters, condition: e.target.value})}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">All Conditions</option>
                      <option value="runs_drives">Runs & Drives</option>
                      <option value="runs_only">Runs Only</option>
                      <option value="does_not_run">Does Not Run</option>
                      <option value="parts_only">Parts Only</option>
                    </select>
                  </div>

                  <Button onClick={clearFilters} variant="outline" className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </Card>
            </div>
          )}

          <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="h-96 animate-pulse bg-gray-200" />
                ))}
              </div>
            ) : filteredVehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map((vehicle) => (
                  <div key={vehicle.id} onClick={() => handleVehicleClick(vehicle.id)} className="cursor-pointer">
                    <VehicleCard vehicle={vehicle} />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Car className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No vehicles found</h3>
                <p className="text-gray-600 mb-6">
                  {user ? 'Try adjusting your filters or upgrade your tier' : 'Sign up to see more vehicles'}
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
