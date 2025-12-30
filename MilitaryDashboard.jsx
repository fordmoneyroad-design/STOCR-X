import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Star, Trophy, Crown, Zap } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function MilitaryDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser.military_verified) {
          window.location.href = createPageUrl("MilitaryVerification");
          return;
        }
        setUser(currentUser);
      } catch (err) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  const { data: subscriptions } = useQuery({
    queryKey: ['subscriptions', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ customer_email: user?.email }, "-created_date"),
    enabled: !!user,
    initialData: []
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-gray-900 to-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* VIP Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Crown className="w-64 h-64 text-yellow-400" />
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-yellow-600 px-6 py-3 rounded-full mb-4">
              <Shield className="w-6 h-6 text-white" />
              <span className="text-white font-bold text-lg">MILITARY VIP MEMBER</span>
              <Star className="w-6 h-6 text-white" />
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                Welcome, Hero
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-6">
              {user.full_name || user.email}
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                <Trophy className="w-5 h-5 mr-2 inline" />
                Verified Military
              </Badge>
              <Badge className="bg-purple-600 text-white text-lg px-4 py-2">
                <Crown className="w-5 h-5 mr-2 inline" />
                VIP Access
              </Badge>
            </div>
          </div>
        </div>

        {/* VIP Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Shield, title: "FREE Membership", desc: "No membership fees ever", color: "from-green-500 to-emerald-600" },
            { icon: Zap, title: "Instant Swaps", desc: "Any car, any time", color: "from-blue-500 to-cyan-600" },
            { icon: Star, title: "VIP Support", desc: "Priority 24/7 assistance", color: "from-purple-500 to-pink-600" },
            { icon: Trophy, title: "Best Rates", desc: "$500/month standard", color: "from-yellow-500 to-orange-600" }
          ].map((benefit, idx) => (
            <Card key={idx} className={`p-6 bg-gradient-to-br ${benefit.color} border-none text-white relative overflow-hidden group`}>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <benefit.icon className="w-12 h-12 mb-4" />
              <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
              <p className="text-sm opacity-90">{benefit.desc}</p>
            </Card>
          ))}
        </div>

        {/* Exclusive Access Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <Card className="p-8 bg-gradient-to-br from-gray-800 to-gray-900 border-yellow-500 border-2">
            <div className="flex items-center gap-3 mb-6">
              <Crown className="w-8 h-8 text-yellow-400" />
              <h2 className="text-3xl font-bold text-white">Your VIP Perks</h2>
            </div>
            
            <div className="space-y-4">
              {[
                "Swap any vehicle in fleet anytime",
                "Early buyout available any time",
                "All 50 states coverage",
                "Countries coming soon (Traveler benefits)",
                "Dedicated VIP account manager",
                "Exclusive military-only vehicles",
                "Priority vehicle reservations",
                "Special military family discounts"
              ].map((perk, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-gray-200">{perk}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-8 bg-gradient-to-br from-green-900 to-emerald-900 border-green-500 border-2">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-green-400" />
              <h2 className="text-3xl font-bold text-white">Thank You For Your Service</h2>
            </div>
            
            <p className="text-gray-200 mb-6 leading-relaxed">
              As a token of our gratitude for your service, you receive our most premium tier completely FREE. 
              We're honored to serve those who have served our country.
            </p>

            <div className="bg-green-800 rounded-xl p-6">
              <p className="text-green-200 text-sm mb-2">Your Savings</p>
              <p className="text-5xl font-bold text-white mb-2">$4,500</p>
              <p className="text-green-200 text-sm">Membership fee waived (Travelers tier value)</p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-800 rounded-lg">
                <p className="text-green-200 text-sm">Active Since</p>
                <p className="text-white font-bold">{user.created_date && new Date(user.created_date).toLocaleDateString()}</p>
              </div>
              <div className="text-center p-4 bg-green-800 rounded-lg">
                <p className="text-green-200 text-sm">Subscriptions</p>
                <p className="text-white font-bold">{subscriptions?.length || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="p-12 bg-gradient-to-r from-yellow-500 via-yellow-600 to-orange-600 border-none shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Drive?
            </h2>
            <p className="text-xl text-yellow-100 mb-8">
              Browse our exclusive military fleet and drive today
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => window.location.href = createPageUrl("BrowseCars")}
                className="bg-white text-yellow-600 hover:bg-gray-100 text-lg px-8 h-14"
              >
                Browse VIP Fleet
              </Button>
              <Button 
                onClick={() => window.location.href = createPageUrl("MyAccount")}
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 h-14"
              >
                My Account
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}