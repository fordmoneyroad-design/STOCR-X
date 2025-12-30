
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"; // Added useQueryClient and useMutation
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Car, Gauge, Fuel, Calendar, MapPin, Shield, 
  TrendingUp, DollarSign, ArrowLeft, ChevronLeft, ChevronRight,
  Heart, Eye // Added Heart and Eye icons
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function CarDetails() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const vehicleId = urlParams.get('id');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient(); // Initialized useQueryClient

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

    // Increment view count
    if (vehicleId) {
      incrementViewCount();
    }
  }, [vehicleId]); // Added vehicleId to dependency array

  const incrementViewCount = async () => {
    try {
      const vehicles = await base44.entities.Vehicle.filter({ id: vehicleId });
      if (vehicles[0]) {
        await base44.entities.Vehicle.update(vehicleId, {
          view_count: (vehicles[0].view_count || 0) + 1
        });
      }
    } catch (err) {
      console.error("Error incrementing view count:", err);
    }
  };

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: async () => {
      const vehicles = await base44.entities.Vehicle.filter({ id: vehicleId });
      return vehicles[0];
    },
    enabled: !!vehicleId
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      // Ensure user and vehicle are loaded
      if (!user || !vehicleId || !vehicle) {
        throw new Error("User, vehicle ID, or vehicle data not available.");
      }
      
      const currentFavorites = user.favorite_vehicles || [];
      const isFavorited = currentFavorites.includes(vehicleId);
      
      // Update user favorites
      const newFavorites = isFavorited
        ? currentFavorites.filter(id => id !== vehicleId)
        : [...currentFavorites, vehicleId];
      
      await base44.auth.updateMe({
        favorite_vehicles: newFavorites
      });

      // Update local user state
      setUser(prevUser => ({
        ...prevUser,
        favorite_vehicles: newFavorites
      }));

      // Update vehicle favorite count
      const newCount = (vehicle.favorite_count || 0) + (isFavorited ? -1 : 1);
      await base44.entities.Vehicle.update(vehicleId, {
        favorite_count: Math.max(0, newCount) // Ensure count doesn't go below 0
      });

      return { isFavorited: !isFavorited };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['vehicle', vehicleId]);
    },
    onError: (error) => {
      console.error("Error toggling favorite:", error);
      // Optionally, revert UI state or show an error message
    }
  });

  if (!vehicleId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Vehicle not found</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-96 w-full rounded-2xl mb-8" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Vehicle not found</p>
      </div>
    );
  }

  const images = vehicle.images || ['https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200'];
  
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleSubscribe = () => {
    if (!user) {
      // Redirect to login with message
      base44.auth.redirectToLogin(createPageUrl("PlanSelection") + `?vehicleId=${vehicle.id}`);
    } else if (!user.onboarding_completed) { // If user is logged in but onboarding is not completed
      navigate(createPageUrl("Onboarding") + `?vehicleId=${vehicle.id}`);
    } else {
      navigate(createPageUrl("PlanSelection") + `?vehicleId=${vehicle.id}`);
    }
  };

  const isFavorited = user?.favorite_vehicles?.includes(vehicleId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("BrowseCars"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Browse
        </Button>

        {/* Image Gallery */}
        <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden mb-8 bg-gray-100 shadow-2xl">
          <img
            src={images[currentImageIndex]}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
          
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          <div className="absolute top-4 left-4">
            <Badge className={`${
              vehicle.status === 'available' ? 'bg-green-500' : 'bg-gray-500'
            } text-white text-lg px-4 py-2`}>
              {vehicle.status}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title with Stats */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h1>
                {user && ( // Show favorite button only if user is logged in
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleFavoriteMutation.mutate()}
                    className={`text-red-500 hover:text-red-600 ${toggleFavoriteMutation.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={toggleFavoriteMutation.isLoading}
                  >
                    <Heart className={`w-8 h-8 ${isFavorited ? 'fill-current' : ''}`} />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{vehicle.location || 'Available for Delivery'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  <span>{vehicle.view_count || 0} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  <span>{vehicle.favorite_count || 0} favorites</span>
                </div>
              </div>
            </div>

            {/* Specs Grid */}
            <Card className="p-6 border-none shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Gauge className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mileage</p>
                    <p className="font-semibold">{vehicle.mileage?.toLocaleString() || 'N/A'} mi</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Car className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Transmission</p>
                    <p className="font-semibold capitalize">{vehicle.transmission || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Fuel className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Fuel Type</p>
                    <p className="font-semibold capitalize">{vehicle.fuel_type || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Year</p>
                    <p className="font-semibold">{vehicle.year}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Insurance</p>
                    <p className="font-semibold">{vehicle.insurance_required ? 'Required' : 'Optional'}</p>
                  </div>
                </div>

                {vehicle.color && (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300" style={{ backgroundColor: vehicle.color.toLowerCase() }} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Color</p>
                      <p className="font-semibold capitalize">{vehicle.color}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <Card className="p-6 border-none shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {vehicle.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Pricing & CTA */}
          <div className="space-y-6">
            <Card className="p-6 border-none shadow-xl sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Subscription Pricing</h2>
              
              {/* Down Payment */}
              <div className="mb-6 pb-6 border-b">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Down Payment</span>
                  <span className="text-sm text-red-600 font-medium">NON-REFUNDABLE</span>
                </div>
                <p className="text-4xl font-bold text-gray-900">
                  ${vehicle.down_payment?.toLocaleString()}
                </p>
              </div>

              {/* Subscription Options */}
              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Weekly</span>
                    <DollarSign className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    ${vehicle.weekly_subscription?.toLocaleString()}/week
                  </p>
                </div>

                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Monthly</span>
                    <DollarSign className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    ${vehicle.monthly_subscription?.toLocaleString()}/month
                  </p>
                </div>
              </div>

              {/* Total Price */}
              <div className="mb-6 pb-6 border-b">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Vehicle Price</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ${vehicle.price?.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Early Buyout */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-gray-900">Early Buyout Discount</span>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {vehicle.early_buyout_discount || 25}% OFF
                </p>
                <p className="text-sm text-gray-600 mt-1">Save when you complete ownership early</p>
              </div>

              {/* CTA Button - Updated */}
              {!user ? (
                <>
                  <Button
                    onClick={handleSubscribe}
                    disabled={vehicle.status !== 'available'}
                    className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {vehicle.status === 'available' ? 'Sign Up to Continue' : 'Not Available'}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-4">
                    Create an account to choose your plan
                  </p>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleSubscribe}
                    disabled={vehicle.status !== 'available'}
                    className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {vehicle.status === 'available' ? 'Choose Plan & Subscribe' : 'Not Available'}
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-4">
                    Next: Select your subscription plan
                  </p>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
