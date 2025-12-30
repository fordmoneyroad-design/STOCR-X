import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Search, Car, DollarSign, Heart, Filter } from "lucide-react";
import SuperAdminQuickActions from "../components/admin/SuperAdminQuickActions";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function CopartLocator() {
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState({
    state: "",
    city: "",
    make: "",
    model: "",
    yearMin: "",
    yearMax: "",
    mileageMin: "",
    mileageMax: "",
    condition: "",
    damageType: ""
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.email !== SUPER_ADMIN_EMAIL && currentUser.role !== 'admin') {
          window.location.href = '/';
          return;
        }
        setUser(currentUser);
      } catch (err) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  const { data: listings, refetch } = useQuery({
    queryKey: ['copart-listings-search', filters],
    queryFn: async () => {
      let query = {};
      
      if (filters.state) query.copart_location_state = filters.state;
      if (filters.city) query.copart_location_city = filters.city;
      if (filters.make) query.make = filters.make;
      if (filters.model) query.model = filters.model;
      if (filters.condition) query.condition = filters.condition;
      
      if (filters.yearMin || filters.yearMax) {
        query.year = {};
        if (filters.yearMin) query.year.$gte = parseInt(filters.yearMin);
        if (filters.yearMax) query.year.$lte = parseInt(filters.yearMax);
      }
      
      if (filters.mileageMin || filters.mileageMax) {
        query.odometer = {};
        if (filters.mileageMin) query.odometer.$gte = parseFloat(filters.mileageMin);
        if (filters.mileageMax) query.odometer.$lte = parseFloat(filters.mileageMax);
      }
      
      if (Object.keys(query).length === 0) return [];
      
      return await base44.entities.CopartListing.filter(query, "-created_date", 200);
    },
    enabled: false,
    initialData: []
  });

  const { data: favorites } = useQuery({
    queryKey: ['user-favorites', user?.email],
    queryFn: () => base44.entities.VehicleFavorite.filter({ user_email: user.email }),
    enabled: !!user,
    initialData: []
  });

  const addFavoriteMutation = useMutation({
    mutationFn: (vehicleId) => base44.entities.VehicleFavorite.create({
      user_email: user.email,
      vehicle_id: vehicleId
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-favorites']);
    }
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: (favoriteId) => base44.entities.VehicleFavorite.delete(favoriteId),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-favorites']);
    }
  });

  const handleSearch = () => {
    refetch();
  };

  const clearFilters = () => {
    setFilters({
      state: "",
      city: "",
      make: "",
      model: "",
      yearMin: "",
      yearMax: "",
      mileageMin: "",
      mileageMax: "",
      condition: "",
      damageType: ""
    });
  };

  const isFavorited = (vehicleId) => {
    return favorites.some(f => f.vehicle_id === vehicleId);
  };

  const toggleFavorite = (vehicleId) => {
    const favorite = favorites.find(f => f.vehicle_id === vehicleId);
    if (favorite) {
      removeFavoriteMutation.mutate(favorite.id);
    } else {
      addFavoriteMutation.mutate(vehicleId);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Header with Logo */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fedac268a06fe88d74977e/0f2d8e915_IMG_3409.png"
              alt="STOCRX"
              className="h-16 w-auto"
            />
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <MapPin className="w-10 h-10 text-blue-400" />
                Vehicle Locator
              </h1>
              <p className="text-gray-400">Find vehicles by location with advanced filters</p>
            </div>
          </div>
        </div>

        {/* Advanced Search Filters */}
        <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Filter className="w-6 h-6 text-blue-400" />
              Advanced Search
            </h2>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-gray-300 text-sm mb-2 block">State</label>
              <Input
                value={filters.state}
                onChange={(e) => setFilters({...filters, state: e.target.value})}
                placeholder="Michigan"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm mb-2 block">City</label>
              <Input
                value={filters.city}
                onChange={(e) => setFilters({...filters, city: e.target.value})}
                placeholder="Detroit"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Make</label>
              <Input
                value={filters.make}
                onChange={(e) => setFilters({...filters, make: e.target.value})}
                placeholder="Toyota"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Model</label>
              <Input
                value={filters.model}
                onChange={(e) => setFilters({...filters, model: e.target.value})}
                placeholder="Camry"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Year Min</label>
              <Input
                type="number"
                value={filters.yearMin}
                onChange={(e) => setFilters({...filters, yearMin: e.target.value})}
                placeholder="2015"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Year Max</label>
              <Input
                type="number"
                value={filters.yearMax}
                onChange={(e) => setFilters({...filters, yearMax: e.target.value})}
                placeholder="2023"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Mileage Min</label>
              <Input
                type="number"
                value={filters.mileageMin}
                onChange={(e) => setFilters({...filters, mileageMin: e.target.value})}
                placeholder="0"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Mileage Max</label>
              <Input
                type="number"
                value={filters.mileageMax}
                onChange={(e) => setFilters({...filters, mileageMax: e.target.value})}
                placeholder="100000"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Condition</label>
              <select
                value={filters.condition}
                onChange={(e) => setFilters({...filters, condition: e.target.value})}
                className="w-full p-3 rounded-lg bg-gray-700 border-gray-600 text-white"
              >
                <option value="">All Conditions</option>
                <option value="runs_drives">Runs & Drives</option>
                <option value="runs_only">Runs Only</option>
                <option value="does_not_run">Does Not Run</option>
                <option value="parts_only">Parts Only</option>
              </select>
            </div>
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Damage Type</label>
              <select
                value={filters.damageType}
                onChange={(e) => setFilters({...filters, damageType: e.target.value})}
                className="w-full p-3 rounded-lg bg-gray-700 border-gray-600 text-white"
              >
                <option value="">All Damage Types</option>
                <option value="none">No Damage</option>
                <option value="hail">Hail Damage</option>
                <option value="front_end">Front End Damage</option>
                <option value="back_end">Back End Damage</option>
                <option value="normal_wear">Normal Wear & Tear</option>
                <option value="minor_dents_scratches">Minor Dents/Scratches</option>
                <option value="major_damage">Major Damage</option>
              </select>
            </div>
          </div>

          <Button
            onClick={handleSearch}
            className="w-full bg-blue-600 hover:bg-blue-700 h-12"
          >
            <Search className="w-5 h-5 mr-2" />
            Search Vehicles
          </Button>
        </Card>

        {/* Results */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">
            Found {listings.length} Vehicles
          </h2>
          
          {listings.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">Use filters above to search for vehicles</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Card key={listing.id} className="p-4 bg-gray-700 border-gray-600">
                  {listing.images && listing.images[0] && (
                    <img
                      src={listing.images[0]}
                      alt={`${listing.year} ${listing.make}`}
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                  )}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-white">
                      {listing.year} {listing.make} {listing.model}
                    </h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleFavorite(listing.id)}
                      className="p-1"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          isFavorited(listing.id)
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-400'
                        }`}
                      />
                    </Button>
                  </div>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">
                        {listing.copart_location_city}, {listing.copart_location_state}
                      </span>
                    </div>
                    {listing.odometer && (
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">
                          {listing.odometer.toLocaleString()} miles
                        </span>
                      </div>
                    )}
                    {listing.buy_now_price && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">
                          ${listing.buy_now_price.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      <Badge className="bg-orange-600 text-xs">
                        {listing.condition || 'Unknown'}
                      </Badge>
                      <Badge className="bg-purple-600 text-xs">
                        {listing.copart_facility_name || 'Copart'}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        <SuperAdminQuickActions />
      </div>
    </div>
  );
}