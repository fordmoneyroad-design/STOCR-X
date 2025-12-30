import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Shield, AlertCircle } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

const plans = [
  {
    id: "standard",
    name: "Standard",
    price: "$500",
    subtitle: "Cars under $5k",
    maxPrice: 5000,
    features: [
      "Access to economy vehicles",
      "3-6 month contracts",
      "Weekly/Monthly payments",
      "Basic insurance options"
    ],
    color: "from-blue-500 to-blue-600"
  },
  {
    id: "premium",
    name: "Premium",
    price: "$2,500",
    subtitle: "Cars $3,500 - $25,000",
    minPrice: 3500,
    maxPrice: 25000,
    features: [
      "$3,500+ quality vehicles",
      "$500/month payments",
      "Priority support",
      "25% early buyout discount"
    ],
    color: "from-purple-500 to-purple-600",
    popular: true
  }
];

export default function PlanSelection() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const vehicleId = urlParams.get('vehicleId');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Redirect to onboarding if not completed
        if (!currentUser.onboarding_completed) {
          navigate(createPageUrl("Onboarding"));
          return;
        }
      } catch (err) {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    checkAuth();
  }, [navigate]);

  const { data: vehicle } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: async () => {
      const vehicles = await base44.entities.Vehicle.filter({ id: vehicleId });
      return vehicles[0];
    },
    enabled: !!vehicleId
  });

  if (!vehicleId || !vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Vehicle not found</p>
      </div>
    );
  }

  const eligiblePlans = plans.filter(plan => {
    if (plan.maxPrice && vehicle.price > plan.maxPrice) return false;
    if (plan.minPrice && vehicle.price < plan.minPrice) return false;
    return true;
  });

  const handleSelectPlan = (planId) => {
    navigate(createPageUrl("Apply") + `?vehicleId=${vehicleId}&tier=${planId}`);
  };

  const handleSpecialPlan = (planType) => {
    if (planType === "military") {
      navigate(createPageUrl("MilitaryVerification") + `?vehicleId=${vehicleId}`);
    } else if (planType === "travelers" || planType === "high_end") {
      navigate(createPageUrl("FundsVerification") + `?vehicleId=${vehicleId}&tier=${planType}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Selected: {vehicle.year} {vehicle.make} {vehicle.model} - ${vehicle.price?.toLocaleString()}
          </p>
        </div>

        {eligiblePlans.length === 0 && (
          <Alert variant="destructive" className="mb-8 max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This vehicle doesn't qualify for Standard or Premium plans. Please check Military VIP, Travelers, or High End options below.
            </AlertDescription>
          </Alert>
        )}

        {/* Standard/Premium Plans */}
        {eligiblePlans.length > 0 && (
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {eligiblePlans.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative p-8 border-none shadow-xl hover:shadow-2xl transition-all ${
                  plan.popular ? 'ring-4 ring-purple-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-purple-500 text-white px-4 py-1">
                      <Star className="w-4 h-4 mr-1 inline" />
                      Recommended
                    </Badge>
                  </div>
                )}

                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mx-auto mb-6`}>
                  <Star className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
                  {plan.name}
                </h3>
                
                <p className="text-center text-sm text-gray-600 mb-4">{plan.subtitle}</p>

                <div className="text-center mb-6">
                  <p className="text-5xl font-bold text-gray-900 mb-2">{plan.price}</p>
                  <p className="text-gray-600">Membership Fee</p>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  className={`w-full h-12 text-lg font-bold bg-gradient-to-r ${plan.color} hover:opacity-90 text-white`}
                >
                  Select {plan.name}
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Special Plans */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Or Choose a Special Plan
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Military VIP */}
            <Card className="p-6 border-2 border-green-500 hover:shadow-xl transition-all">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-8 h-8 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">Military VIP</h3>
              </div>
              <p className="text-3xl font-bold text-green-600 mb-4">FREE</p>
              <p className="text-sm text-gray-600 mb-4">
                For verified military service members
              </p>
              <Button
                onClick={() => handleSpecialPlan("military")}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Verify Military Status
              </Button>
            </Card>

            {/* Travelers */}
            <Card className="p-6 border-2 border-orange-500 hover:shadow-xl transition-all">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-8 h-8 text-orange-600" />
                <h3 className="text-xl font-bold text-gray-900">Travelers</h3>
              </div>
              <p className="text-3xl font-bold text-orange-600 mb-4">$4,500</p>
              <p className="text-sm text-gray-600 mb-4">
                Any vehicle - Ultimate flexibility
              </p>
              <Button
                onClick={() => handleSpecialPlan("travelers")}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                Verify Funds
              </Button>
            </Card>

            {/* High End */}
            <Card className="p-6 border-2 border-yellow-500 hover:shadow-xl transition-all">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-8 h-8 text-yellow-600" />
                <h3 className="text-xl font-bold text-gray-900">High End</h3>
              </div>
              <p className="text-3xl font-bold text-yellow-600 mb-4">$50,000</p>
              <p className="text-sm text-gray-600 mb-4">
                $100k+ luxury vehicles
              </p>
              <Button
                onClick={() => handleSpecialPlan("high_end")}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                Verify Funds
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}