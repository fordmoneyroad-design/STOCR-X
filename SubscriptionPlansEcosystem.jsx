import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Star, Shield, Plane, Building2, Crown, CheckCircle,
  ArrowRight, Sparkles, Car, DollarSign, Clock, Users
} from "lucide-react";
import { createPageUrl } from "@/utils";

const SUBSCRIPTION_ECOSYSTEM = [
  {
    tier: "free",
    name: "Free Explorer",
    icon: Star,
    color: "from-gray-500 to-gray-600",
    price: "$0",
    tagline: "Browse & Learn",
    description: "Perfect for browsing and exploring options",
    features: [
      "Browse basic vehicle inventory",
      "Access pricing calculator",
      "View subscription plans",
      "Customer support access",
      "Email notifications"
    ],
    limits: {
      vehicles: "Basic tier only",
      features: "Limited access",
      support: "Email only"
    },
    cta: "Start Free",
    popular: false
  },
  {
    tier: "standard",
    name: "Standard Member",
    icon: Car,
    color: "from-blue-500 to-blue-600",
    price: "$49/mo",
    tagline: "Essential Features",
    description: "Everything you need for subscription-to-own",
    features: [
      "Access to standard vehicle inventory",
      "Subscribe-to-own any standard car",
      "Weekly or monthly payments",
      "Insurance options available",
      "Priority customer support",
      "Swap vehicle twice per contract",
      "Early buyout 25% discount",
      "Free delivery (local)"
    ],
    limits: {
      vehicles: "Standard + Basic",
      swaps: "2 per contract",
      approval: "24-48 hours"
    },
    cta: "Choose Standard",
    popular: true,
    savings: "Most Popular"
  },
  {
    tier: "premium",
    name: "Premium Plus",
    icon: Crown,
    color: "from-purple-500 to-purple-600",
    price: "$99/mo",
    tagline: "Enhanced Benefits",
    description: "Premium features for serious subscribers",
    features: [
      "Premium + Standard + Basic inventory",
      "Unlimited vehicle swaps",
      "30% early buyout discount",
      "Free state-wide delivery",
      "Dedicated account manager",
      "Priority approval (12 hours)",
      "Extended warranties available",
      "Roadside assistance included",
      "2 free oil changes per year"
    ],
    limits: {
      vehicles: "Premium + Standard + Basic",
      swaps: "Unlimited",
      approval: "12 hours"
    },
    cta: "Go Premium",
    popular: false,
    savings: "Save 5%"
  },
  {
    tier: "military",
    name: "Military VIP",
    icon: Shield,
    color: "from-green-600 to-green-700",
    price: "$69/mo",
    tagline: "Service Member Exclusive",
    description: "Special pricing for active/veteran military",
    features: [
      "All Premium features included",
      "30% discount on all payments",
      "Military-only exclusive vehicles",
      "Flexible deployment terms",
      "Fast-track approval (6 hours)",
      "Free nationwide delivery",
      "Deployment freeze option",
      "Family coverage ($25/child)",
      "VA loan assistance"
    ],
    limits: {
      verification: "Military ID required",
      benefits: "Active/Veteran only"
    },
    cta: "Verify Military Status",
    popular: false,
    badge: "Military Only"
  },
  {
    tier: "travelers",
    name: "Travelers Plus",
    icon: Plane,
    color: "from-cyan-500 to-cyan-600",
    price: "$79/mo",
    tagline: "On-the-Go Flexibility",
    description: "Perfect for frequent travelers",
    features: [
      "Premium tier vehicles ($5K+)",
      "Flexible subscription pausing",
      "Airport delivery/pickup",
      "Multi-state coverage",
      "Travel insurance included",
      "GPS tracking",
      "Unlimited mileage",
      "24/7 concierge support",
      "Vehicle swap at any location"
    ],
    limits: {
      vehicles: "Premium tier ($5K+)",
      pause: "Up to 3 months/year"
    },
    cta: "Choose Travelers",
    popular: false
  },
  {
    tier: "high_end",
    name: "High-End Business",
    icon: Building2,
    color: "from-yellow-500 to-yellow-600",
    price: "$299/mo",
    tagline: "Luxury Fleet Management",
    description: "Premium vehicles for businesses",
    features: [
      "Luxury & high-end vehicles only",
      "Company fleet management",
      "Multiple vehicle subscriptions",
      "Business tax benefits",
      "Corporate account dashboard",
      "Dedicated fleet manager",
      "Priority maintenance",
      "Custom branding options",
      "Quarterly business reports",
      "W-9 on file for tax purposes"
    ],
    limits: {
      vehicles: "Luxury tier only",
      fleet: "Up to 10 vehicles",
      verification: "Business license required"
    },
    cta: "Contact Sales",
    popular: false,
    badge: "Business"
  },
  {
    tier: "lifetime",
    name: "Lifetime Elite",
    icon: Sparkles,
    color: "from-pink-500 to-rose-600",
    price: "$5,000",
    tagline: "One-Time Payment",
    description: "Lifetime access to all vehicles",
    features: [
      "Lifetime membership (no monthly fees)",
      "Access to ALL vehicle tiers",
      "Unlimited vehicle swaps",
      "50% early buyout discount",
      "Free lifetime maintenance",
      "VIP concierge service",
      "Exclusive vehicle pre-access",
      "Annual vehicle upgrade",
      "Transferable to family member",
      "Priority everything"
    ],
    limits: {
      payment: "One-time $5,000",
      vehicles: "Full inventory access",
      duration: "Lifetime"
    },
    cta: "Become Elite",
    popular: false,
    badge: "Best Value"
  }
];

export default function SubscriptionPlansEcosystem() {
  const [user, setUser] = useState(null);

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

  const handleSelectPlan = (tier) => {
    if (tier === "military") {
      window.location.href = createPageUrl("MilitaryVerification");
    } else if (!user) {
      base44.auth.redirectToLogin(createPageUrl("BrowseCars"));
    } else {
      window.location.href = createPageUrl("BrowseCars");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Complete Subscription Ecosystem
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your lifestyle and needs
          </p>
        </div>

        {/* Comparison Table */}
        <Card className="p-8 mb-12 border-none shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Plan Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4">Feature</th>
                  {SUBSCRIPTION_ECOSYSTEM.map((plan) => (
                    <th key={plan.tier} className="text-center py-4 px-4">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 font-semibold">Price</td>
                  {SUBSCRIPTION_ECOSYSTEM.map((plan) => (
                    <td key={plan.tier} className="text-center py-4 px-4 font-bold">
                      {plan.price}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4">Vehicle Access</td>
                  {SUBSCRIPTION_ECOSYSTEM.map((plan) => (
                    <td key={plan.tier} className="text-center py-4 px-4 text-sm">
                      {plan.limits.vehicles}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4">Vehicle Swaps</td>
                  {SUBSCRIPTION_ECOSYSTEM.map((plan) => (
                    <td key={plan.tier} className="text-center py-4 px-4">
                      {plan.limits.swaps || '-'}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4">Approval Time</td>
                  {SUBSCRIPTION_ECOSYSTEM.map((plan) => (
                    <td key={plan.tier} className="text-center py-4 px-4 text-sm">
                      {plan.limits.approval || 'Instant'}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SUBSCRIPTION_ECOSYSTEM.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = user?.subscription_tier === plan.tier;

            return (
              <Card
                key={plan.tier}
                className={`relative overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all ${
                  plan.popular ? 'ring-4 ring-blue-500' : ''
                }`}
              >
                {plan.badge && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-center py-2 font-bold text-sm">
                    ⭐ {plan.savings}
                  </div>
                )}

                <div className={`bg-gradient-to-br ${plan.color} p-8 ${plan.popular ? 'pt-12' : ''}`}>
                  <Icon className="w-12 h-12 text-white mb-4" />
                  <h3 className="text-3xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-lg text-white/90 mb-4">{plan.tagline}</p>
                  <div className="text-4xl font-bold text-white mb-2">{plan.price}</div>
                  {plan.tier !== "lifetime" && <p className="text-white/80 text-sm">per month</p>}
                </div>

                <div className="p-8">
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleSelectPlan(plan.tier)}
                    disabled={isCurrentPlan}
                    className={`w-full h-12 font-bold ${
                      isCurrentPlan 
                        ? 'bg-gray-300 cursor-not-allowed'
                        : `bg-gradient-to-r ${plan.color} hover:opacity-90`
                    }`}
                  >
                    {isCurrentPlan ? 'Current Plan' : plan.cta}
                    {!isCurrentPlan && <ArrowRight className="ml-2 w-5 h-5" />}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}