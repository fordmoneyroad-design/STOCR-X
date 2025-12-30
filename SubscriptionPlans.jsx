import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Shield, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const plans = [
  {
    id: "standard",
    name: "Standard",
    price: "$500",
    deposit: "+ Deposit",
    subtitle: "Cars under $5k",
    features: [
      "Access to economy vehicles",
      "3-6 month contracts",
      "Weekly/Monthly payments",
      "Basic insurance options",
      "Free local delivery"
    ],
    color: "from-blue-500 to-blue-600",
    popular: false
  },
  {
    id: "premium",
    name: "Premium",
    price: "$2,500",
    deposit: "Membership Fee",
    subtitle: "Cars $3,500 - $25,000",
    features: [
      "$3,500+ quality vehicles",
      "$500/month payments",
      "Priority support",
      "Insurance options available",
      "25% early buyout discount"
    ],
    color: "from-purple-500 to-purple-600",
    popular: true
  },
  {
    id: "military",
    name: "Military VIP",
    price: "FREE",
    deposit: "With Verification",
    subtitle: "Military Service Members",
    features: [
      "FREE membership (verified military)",
      "Swap any time, any car",
      "Buyout anytime",
      "All 50 states (countries soon)",
      "$500/month payments",
      "VIP premium support",
      "Exclusive military benefits"
    ],
    color: "from-green-500 to-green-600",
    popular: false,
    requiresMilitary: true
  },
  {
    id: "travelers",
    name: "Travelers",
    price: "$4,500",
    deposit: "Join & Swap Anytime",
    subtitle: "Any Vehicle - Ultimate Flexibility",
    features: [
      "Swap currently subscribed car",
      "ANY car in our fleet",
      "Swap & buyout anytime",
      "All 50 states (countries soon)",
      "$500/month payments",
      "Premium concierge service"
    ],
    color: "from-orange-500 to-red-600",
    popular: false
  },
  {
    id: "high_end",
    name: "High End",
    price: "$50,000",
    deposit: "Military $25,000",
    subtitle: "$100k+ Luxury Vehicles",
    features: [
      "Money back guarantee",
      "$100k+ luxury vehicles",
      "$1k-$5k monthly payments",
      "Easy swap under military",
      "White glove service",
      "Exclusive vehicle access",
      "Dedicated account manager"
    ],
    color: "from-yellow-400 to-yellow-600",
    popular: false,
    exclusive: true
  }
];

export default function SubscriptionPlans() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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

  const handleSelectPlan = (planId) => {
    if (!user) {
      base44.auth.redirectToLogin(createPageUrl("SubscriptionPlans") + `?plan=${planId}`);
    } else if (planId === "military") {
      navigate(createPageUrl("MilitaryVerification"));
    } else {
      navigate(createPageUrl("BrowseCars") + `?tier=${planId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Flexible subscription tiers to match your needs and budget
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative p-8 border-none shadow-xl hover:shadow-2xl transition-all duration-300 ${
                plan.popular ? 'ring-4 ring-purple-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white px-4 py-1 flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {plan.requiresMilitary && (
                <div className="absolute -top-4 right-4">
                  <Badge className="bg-green-600 text-white px-3 py-1 flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    Military
                  </Badge>
                </div>
              )}

              {plan.exclusive && (
                <div className="absolute -top-4 right-4">
                  <Badge className="bg-yellow-600 text-white px-3 py-1 flex items-center gap-1">
                    <Globe className="w-4 h-4" />
                    Exclusive
                  </Badge>
                </div>
              )}

              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mx-auto mb-6`}>
                <Star className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">
                {plan.name}
              </h3>
              
              {plan.subtitle && (
                <p className="text-center text-sm text-gray-600 mb-4">{plan.subtitle}</p>
              )}

              <div className="text-center mb-6">
                <p className="text-5xl font-bold text-gray-900 mb-2">{plan.price}</p>
                <p className="text-gray-600">{plan.deposit}</p>
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
                {plan.id === "military" ? "Verify Military Status" : "Select Plan"}
              </Button>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 border-none">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              All Plans Include
            </h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-gray-900">AI Instant Approval</p>
                <p className="text-sm text-gray-600">Get approved in minutes</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-gray-900">Build Ownership</p>
                <p className="text-sm text-gray-600">Every payment counts</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-gray-900">25% Early Buyout</p>
                <p className="text-sm text-gray-600">Discount on remaining balance</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}