import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plane, MapPin, DollarSign, Clock, ArrowLeft, TrendingUp } from "lucide-react";
import VehicleCard from "../components/vehicles/VehicleCard";

export default function TravelerDeliveryEstimate() {
  const [user, setUser] = useState(null);
  const [zipCode, setZipCode] = useState("");
  const [deliveryEstimate, setDeliveryEstimate] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
          if (currentUser.zip_code) {
            setZipCode(currentUser.zip_code);
          }
        }
      } catch (err) {
        // Not authenticated
      }
    };
    checkAuth();
  }, []);

  const { data: vehicles } = useQuery({
    queryKey: ['traveler-vehicles'],
    queryFn: () => base44.entities.Vehicle.filter({ 
      status: "available",
      price: { $gte: 5000 }
    }),
    initialData: []
  });

  const calculateDelivery = () => {
    // Mock delivery calculation (in production, use real API)
    const baseDeliveryFee = 199;
    const insuranceFee = 50;
    const processingDays = 3;
    const shippingDays = 5;
    
    setDeliveryEstimate({
      deliveryFee: baseDeliveryFee,
      insuranceFee: insuranceFee,
      totalCost: baseDeliveryFee + insuranceFee,
      processingDays: processingDays,
      shippingDays: shippingDays,
      totalDays: processingDays + shippingDays,
      estimatedArrival: new Date(Date.now() + (processingDays + shippingDays) * 24 * 60 * 60 * 1000).toLocaleDateString()
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="text-blue-200 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-12">
          <Plane className="w-16 h-16 mx-auto mb-4 text-blue-300" />
          <h1 className="text-4xl font-bold text-white mb-2">
            Traveler Plan - Delivery Estimates
          </h1>
          <p className="text-blue-200 text-lg">
            Premium vehicles $5K+ with nationwide delivery
          </p>
          <Badge className="bg-yellow-500 text-black text-lg px-4 py-2 mt-4">
            Traveler VIP Access
          </Badge>
        </div>

        {/* Delivery Calculator */}
        <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-300" />
            Delivery Cost Calculator
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="text-white mb-2 block">Your Zip Code</label>
              <Input
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="12345"
                maxLength={5}
                className="bg-white/20 border-white/30 text-white placeholder:text-gray-300"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={calculateDelivery}
                disabled={zipCode.length !== 5}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Calculate Delivery
              </Button>
            </div>
          </div>

          {deliveryEstimate && (
            <div className="grid md:grid-cols-4 gap-4 mt-6">
              <Card className="p-4 bg-blue-600/30 border-blue-400">
                <DollarSign className="w-8 h-8 text-blue-300 mb-2" />
                <p className="text-2xl font-bold text-white">${deliveryEstimate.deliveryFee}</p>
                <p className="text-sm text-blue-200">Delivery Fee</p>
              </Card>
              <Card className="p-4 bg-purple-600/30 border-purple-400">
                <DollarSign className="w-8 h-8 text-purple-300 mb-2" />
                <p className="text-2xl font-bold text-white">${deliveryEstimate.insuranceFee}</p>
                <p className="text-sm text-purple-200">Insurance</p>
              </Card>
              <Card className="p-4 bg-green-600/30 border-green-400">
                <Clock className="w-8 h-8 text-green-300 mb-2" />
                <p className="text-2xl font-bold text-white">{deliveryEstimate.totalDays} days</p>
                <p className="text-sm text-green-200">Est. Delivery</p>
              </Card>
              <Card className="p-4 bg-yellow-600/30 border-yellow-400">
                <TrendingUp className="w-8 h-8 text-yellow-300 mb-2" />
                <p className="text-2xl font-bold text-white">${deliveryEstimate.totalCost}</p>
                <p className="text-sm text-yellow-200">Total Cost</p>
              </Card>
            </div>
          )}
        </Card>

        {/* Delivery Benefits */}
        <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Traveler Plan Benefits:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Nationwide delivery to all 50 states",
              "Premium vehicles $5K and up only",
              "White-glove delivery service",
              "Full insurance during transport",
              "GPS tracking during delivery",
              "Flexible delivery scheduling",
              "VIP support during transit",
              "24/7 delivery updates"
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-3 text-white">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Available Vehicles */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-6">
            Available Premium Vehicles ($5K+)
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.slice(0, 12).map((vehicle) => (
              <div key={vehicle.id}>
                <Badge className="absolute top-4 left-4 z-10 bg-yellow-500 text-black">
                  Traveler Eligible
                </Badge>
                <VehicleCard vehicle={vehicle} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}