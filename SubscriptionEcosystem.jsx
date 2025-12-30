import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, TrendingUp, Shield, Star, Crown, Zap,
  CheckCircle, ArrowRight, Calculator, CreditCard, Award
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SubscriptionEcosystem() {
  const navigate = useNavigate();

  const tiers = [
    {
      name: "Free",
      icon: Shield,
      price: "$0",
      commitment: "Browse only",
      features: [
        "Browse all vehicles",
        "View pricing",
        "Access calculator",
        "Email support",
        "No commitment"
      ],
      limitations: ["Cannot subscribe", "No premium vehicles"],
      color: "from-gray-600 to-gray-700",
      badge: "bg-gray-600"
    },
    {
      name: "Standard",
      icon: CheckCircle,
      price: "$25/mo",
      commitment: "3-6 month contract",
      features: [
        "Access standard vehicles ($5k-$15k)",
        "Basic insurance included",
        "3-6 month contracts",
        "Weekly/bi-weekly/monthly payments",
        "24/7 support",
        "Early buyout option (25% discount)"
      ],
      limitations: ["No luxury vehicles", "No high-end tier benefits"],
      color: "from-blue-600 to-indigo-600",
      badge: "bg-blue-600",
      popular: true
    },
    {
      name: "Premium",
      icon: Star,
      price: "$50/mo",
      commitment: "3-6 month contract",
      features: [
        "Access premium vehicles ($15k-$30k)",
        "Enhanced insurance coverage",
        "Flexible contract terms",
        "Priority support",
        "Swap/upgrade privileges",
        "Early buyout discount (30%)",
        "Free delivery (within 100 miles)"
      ],
      limitations: ["No exotic vehicles"],
      color: "from-purple-600 to-pink-600",
      badge: "bg-purple-600"
    },
    {
      name: "Military",
      icon: Shield,
      price: "Special Rates",
      commitment: "Flexible deployment terms",
      features: [
        "Exclusive military pricing (20% off)",
        "Deployment-friendly contracts",
        "Pause subscription during deployment",
        "Dedicated military support",
        "Military badge benefits",
        "Family plan discounts"
      ],
      limitations: ["Requires military ID verification"],
      color: "from-green-600 to-teal-600",
      badge: "bg-green-600"
    },
    {
      name: "High-End/Business",
      icon: Crown,
      price: "$100+/mo",
      commitment: "Flexible terms",
      features: [
        "Luxury & exotic vehicles ($30k+)",
        "Business fleet options",
        "Comprehensive insurance",
        "White-glove concierge service",
        "Corporate billing",
        "Multiple vehicle management",
        "Priority vehicle swaps"
      ],
      limitations: [],
      color: "from-yellow-600 to-orange-600",
      badge: "bg-yellow-600"
    },
    {
      name: "Lifetime",
      icon: Zap,
      price: "One-time $5,000",
      commitment: "Lifetime access",
      features: [
        "LIFETIME membership (one payment)",
        "Access to ALL vehicles forever",
        "No monthly subscription fees",
        "VIP treatment",
        "Unlimited swaps/upgrades",
        "Exclusive member events",
        "Transfer to family members"
      ],
      limitations: ["Down payment still required per vehicle"],
      color: "from-red-600 to-pink-600",
      badge: "bg-red-600",
      premium: true
    }
  ];

  const paymentStructure = [
    {
      title: "Down Payment",
      amount: "$500 - $3,000",
      description: "Initial payment based on vehicle value (10-20%). Goes towards ownership.",
      icon: DollarSign,
      color: "bg-blue-600"
    },
    {
      title: "Membership Fee",
      amount: "$25 - $100/mo",
      description: "Tier subscription fee. Access to platform, insurance, support.",
      icon: Award,
      color: "bg-purple-600"
    },
    {
      title: "Vehicle Payment",
      amount: "$200 - $800/mo",
      description: "Weekly, bi-weekly, or monthly. Builds equity towards ownership.",
      icon: TrendingUp,
      color: "bg-green-600"
    },
    {
      title: "Insurance (Optional)",
      amount: "$50 - $150/mo",
      description: "Comprehensive coverage through our partners. Can use own insurance.",
      icon: Shield,
      color: "bg-orange-600"
    },
    {
      title: "Delivery Fee (One-time)",
      amount: "$50 - $200",
      description: "Based on distance. Free for Premium+ tiers within 100 miles.",
      icon: CreditCard,
      color: "bg-teal-600"
    }
  ];

  const loanOptions = [
    {
      provider: "Snap Loans",
      description: "Quick approval, flexible terms",
      rates: "8-15% APR",
      terms: "3-6 months",
      approval: "Same day",
      bestFor: "Standard tier customers",
      color: "from-blue-600 to-cyan-600"
    },
    {
      provider: "Koalafi",
      description: "No credit needed, pay over time",
      rates: "0-20% APR",
      terms: "3-12 months",
      approval: "Instant",
      bestFor: "Credit building",
      color: "from-green-600 to-teal-600"
    },
    {
      provider: "Release 90",
      description: "Premium financing for high-end vehicles",
      rates: "5-12% APR",
      terms: "6-12 months",
      approval: "24-48 hours",
      bestFor: "Premium/High-End tiers",
      color: "from-purple-600 to-pink-600"
    },
    {
      provider: "STOCRX Financing",
      description: "In-house payment plans",
      rates: "Custom",
      terms: "Flexible",
      approval: "Admin review",
      bestFor: "Special circumstances",
      color: "from-orange-600 to-red-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">STOCRX Ecosystem</h1>
          <p className="text-xl text-gray-300 mb-6">
            Complete subscription tiers, payment structure, and financing options
          </p>
          <Badge className="bg-green-600 text-white text-lg px-6 py-3">
            ✅ Transparent • Flexible • Path to Ownership
          </Badge>
        </div>

        {/* Subscription Tiers */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Subscription Tiers</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <Card key={tier.name} className={`p-6 bg-gradient-to-br ${tier.color} border-none text-white relative overflow-hidden`}>
                  {tier.popular && (
                    <Badge className="absolute top-4 right-4 bg-yellow-500 text-black">
                      MOST POPULAR
                    </Badge>
                  )}
                  {tier.premium && (
                    <Badge className="absolute top-4 right-4 bg-white text-black">
                      ⭐ BEST VALUE
                    </Badge>
                  )}
                  
                  <Icon className="w-12 h-12 mb-4" />
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <p className="text-3xl font-bold mb-2">{tier.price}</p>
                  <p className="text-sm opacity-90 mb-4">{tier.commitment}</p>

                  <div className="space-y-2 mb-4">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {tier.limitations.length > 0 && (
                    <div className="border-t border-white/20 pt-4 mt-4">
                      <p className="text-xs opacity-75 mb-2">Limitations:</p>
                      {tier.limitations.map((limit, idx) => (
                        <p key={idx} className="text-xs opacity-75">• {limit}</p>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={() => navigate(createPageUrl("UpgradeRequest"))}
                    className="w-full mt-6 bg-white text-gray-900 hover:bg-gray-100 font-bold"
                  >
                    Choose {tier.name}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Payment Structure */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Payment Structure Breakdown</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paymentStructure.map((payment) => {
              const Icon = payment.icon;
              return (
                <Card key={payment.title} className="p-6 bg-gray-800 border-gray-700">
                  <div className={`w-12 h-12 ${payment.color} rounded-full flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{payment.title}</h3>
                  <p className="text-2xl font-bold text-green-400 mb-3">{payment.amount}</p>
                  <p className="text-gray-300 text-sm">{payment.description}</p>
                </Card>
              );
            })}
          </div>

          <Card className="p-8 bg-gradient-to-br from-green-600 to-teal-600 border-none text-white mt-8">
            <h3 className="text-2xl font-bold mb-4">💡 How Payments Build Ownership</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <Calculator className="w-10 h-10 mb-3" />
                <h4 className="font-bold mb-2">Example: $15,000 Vehicle</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Down Payment: $1,500 (10%)</li>
                  <li>• Remaining: $13,500</li>
                  <li>• Monthly Payment: $450</li>
                  <li>• Term: 6 months</li>
                  <li>• Total Paid: $4,200</li>
                </ul>
              </div>
              <div>
                <TrendingUp className="w-10 h-10 mb-3" />
                <h4 className="font-bold mb-2">Build Equity</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Every payment builds equity</li>
                  <li>• After 6 months: $5,700 equity</li>
                  <li>• Remaining: $9,300</li>
                  <li>• Option to buy or continue</li>
                  <li>• Early buyout: 25-30% discount</li>
                </ul>
              </div>
              <div>
                <Award className="w-10 h-10 mb-3" />
                <h4 className="font-bold mb-2">Ownership Path</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Continue payments until $15k paid</li>
                  <li>• Or pay remaining balance anytime</li>
                  <li>• Transfer title immediately</li>
                  <li>• No hidden fees</li>
                  <li>• You own the vehicle!</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Financing Options */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Financing Partners</h2>
          <p className="text-center text-gray-300 mb-8">
            Need help with down payment or monthly payments? We partner with trusted lenders.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {loanOptions.map((option) => (
              <Card key={option.provider} className={`p-6 bg-gradient-to-br ${option.color} border-none text-white`}>
                <h3 className="text-2xl font-bold mb-2">{option.provider}</h3>
                <p className="text-lg mb-4">{option.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm opacity-90">Interest Rate</p>
                    <p className="font-bold">{option.rates}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Terms</p>
                    <p className="font-bold">{option.terms}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Approval Time</p>
                    <p className="font-bold">{option.approval}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Best For</p>
                    <p className="font-bold text-sm">{option.bestFor}</p>
                  </div>
                </div>

                <Button
                  onClick={() => navigate(createPageUrl("FinancingManagement"))}
                  className="w-full bg-white text-gray-900 hover:bg-gray-100 font-bold"
                >
                  Apply Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* How It All Fits Together */}
        <Card className="p-8 bg-gray-800 border-gray-700">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">How It All Fits Together</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <Badge className="bg-blue-600 text-white px-3 py-1 text-lg">1</Badge>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Choose Your Tier</h3>
                <p className="text-gray-300">
                  Select the subscription tier that matches your needs (Free to Lifetime). 
                  This determines which vehicles you can access and what benefits you get.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Badge className="bg-purple-600 text-white px-3 py-1 text-lg">2</Badge>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Select a Vehicle</h3>
                <p className="text-gray-300">
                  Browse vehicles in your tier. See the down payment required (10-20% of vehicle value) 
                  and monthly payment options (weekly/bi-weekly/monthly).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Badge className="bg-green-600 text-white px-3 py-1 text-lg">3</Badge>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Choose Payment Method</h3>
                <p className="text-gray-300">
                  Pay directly OR use our financing partners (Snap Loans, Koalafi, Release 90) to 
                  spread the down payment over time. Financing approval in minutes to hours.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Badge className="bg-orange-600 text-white px-3 py-1 text-lg">4</Badge>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Get Approved & Drive</h3>
                <p className="text-gray-300">
                  Complete KYC verification (AI-verified in 24 hours). Admin approves. 
                  Vehicle delivered. Start making payments and building ownership equity!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Badge className="bg-yellow-600 text-white px-3 py-1 text-lg">5</Badge>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Build Equity & Own</h3>
                <p className="text-gray-300">
                  Every payment goes towards ownership. After 3-6 months of consistent payments, 
                  pay off remaining balance (with early buyout discount) and the car is YOURS!
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-green-900/30 border border-green-700 rounded-lg">
            <h3 className="text-xl font-bold text-green-400 mb-3">💰 All Revenue Goes to Ownership</h3>
            <p className="text-gray-300">
              Unlike traditional car rentals where you pay and get nothing, STOCRX payments build equity. 
              Your down payment + monthly payments = ownership equity. The subscription fee ($25-$100/mo) 
              covers platform access, insurance, support, and admin overhead.
            </p>
          </div>
        </Card>

        {/* CTA */}
        <Card className="p-8 bg-gradient-to-br from-blue-600 to-purple-600 border-none text-white text-center mt-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-lg mb-6">
            Choose a tier, browse vehicles, and start building towards ownership today!
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => navigate(createPageUrl("SubscriptionPlans"))}
              className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-8 py-3"
            >
              View All Tiers
            </Button>
            <Button
              onClick={() => navigate(createPageUrl("BrowseCars"))}
              className="bg-green-600 hover:bg-green-700 font-bold px-8 py-3"
            >
              Browse Vehicles
            </Button>
            <Button
              onClick={() => navigate(createPageUrl("Calculator"))}
              className="bg-yellow-600 hover:bg-yellow-700 font-bold px-8 py-3"
            >
              Use Calculator
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}