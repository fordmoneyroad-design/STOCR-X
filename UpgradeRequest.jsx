import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, CheckCircle, Star, Zap, Crown, Shield, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function UpgradeRequest() {
  const [user, setUser] = useState(null);
  const [selectedTier, setSelectedTier] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (err) {
        base44.auth.redirectToLogin(createPageUrl("UpgradeRequest"));
      }
    };
    checkAuth();
  }, []);

  const { data: subscriptions } = useQuery({
    queryKey: ['user-subscriptions', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ customer_email: user.email, status: 'active' }),
    enabled: !!user,
    initialData: []
  });

  const upgradeMutation = useMutation({
    mutationFn: async (data) => {
      // Create upgrade request via PayrollRequest entity
      await base44.entities.PayrollRequest.create({
        employee_email: user.email,
        employee_name: user.full_name || user.email,
        request_type: "status_change",
        department: `Upgrade to ${data.tier}`,
        justification: data.reason,
        requested_by: user.email,
        priority: "high",
        entity_type: "User",
        related_entity_id: user.id
      });

      // Notify admin
      await base44.integrations.Core.SendEmail({
        to: "fordmoneyroad@gmail.com",
        subject: `Tier Upgrade Request - ${user.full_name || user.email}`,
        body: `
          User ${user.email} has requested a tier upgrade.
          
          Current Tier: ${user.subscription_tier || 'free'}
          Requested Tier: ${data.tier}
          
          Reason: ${data.reason}
          
          Review at: https://stocrx.com/SuperAdmin
        `
      });

      // Send confirmation to user
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: "STOCRX Tier Upgrade Request Received",
        body: `
          Dear ${user.full_name || user.email},
          
          We've received your request to upgrade to the ${data.tier.toUpperCase()} tier.
          
          Our team will review your request and get back to you within 1-2 business days.
          
          Current Tier: ${user.subscription_tier || 'free'}
          Requested Tier: ${data.tier}
          
          You'll receive an email once your upgrade is approved.
          
          Best regards,
          STOCRX Team
        `
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      queryClient.invalidateQueries(['user-subscriptions']);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    upgradeMutation.mutate({ tier: selectedTier, reason });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tiers = [
    {
      name: "standard",
      title: "Standard",
      icon: CheckCircle,
      price: "$25/mo",
      features: [
        "Access to standard vehicles",
        "Basic insurance coverage",
        "3-6 month contracts",
        "Standard support"
      ],
      gradient: "from-blue-600 to-indigo-600"
    },
    {
      name: "premium",
      title: "Premium",
      icon: Star,
      price: "$50/mo",
      features: [
        "Access to premium vehicles",
        "Enhanced insurance coverage",
        "Flexible contract terms",
        "Priority support",
        "Early buyout discount"
      ],
      gradient: "from-purple-600 to-pink-600"
    },
    {
      name: "military",
      title: "Military",
      icon: Shield,
      price: "Special Rates",
      features: [
        "Exclusive military pricing",
        "Discounted vehicles",
        "Flexible deployment terms",
        "Dedicated support",
        "Military badge"
      ],
      gradient: "from-green-600 to-teal-600"
    },
    {
      name: "high_end",
      title: "High-End / Business",
      icon: Crown,
      price: "$100+/mo",
      features: [
        "Luxury & exotic vehicles",
        "Business fleet options",
        "Comprehensive insurance",
        "White-glove service",
        "Corporate billing"
      ],
      gradient: "from-yellow-600 to-orange-600"
    },
    {
      name: "lifetime",
      title: "Lifetime Member",
      icon: Zap,
      price: "One-time",
      features: [
        "Lifetime membership",
        "Access to all vehicles",
        "No monthly fees",
        "VIP treatment",
        "Exclusive perks"
      ],
      gradient: "from-red-600 to-pink-600"
    }
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full p-12 bg-white text-center">
          <CheckCircle className="w-20 h-20 mx-auto mb-6 text-green-600" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Upgrade Request Submitted!</h1>
          <p className="text-xl text-gray-600 mb-6">
            Your tier upgrade request is being reviewed by our team.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-blue-900 mb-2">What's Next?</h3>
            <ul className="text-left text-blue-800 space-y-2">
              <li>✅ Request review by admin (1-2 business days)</li>
              <li>📧 Email notification when approved</li>
              <li>🎯 Immediate access to new tier benefits</li>
              <li>💳 Updated billing on next cycle</li>
            </ul>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => navigate(createPageUrl("AccountApprovalStatus"))}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Check Status
            </Button>
            <Button
              onClick={() => navigate(createPageUrl("Home"))}
              variant="outline"
              className="flex-1"
            >
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-blue-400" />
          <h1 className="text-5xl font-bold text-white mb-4">Upgrade Your Tier</h1>
          <p className="text-xl text-gray-300">
            Current Tier: <Badge className="bg-purple-600 text-lg px-4 py-2 ml-2">
              {user.subscription_tier?.toUpperCase() || 'FREE'}
            </Badge>
          </p>
        </div>

        {subscriptions.length === 0 && (
          <Alert className="mb-8 bg-yellow-900/30 border-yellow-700">
            <AlertDescription className="text-yellow-200">
              You don't have any active subscriptions yet. Browse our vehicles and start a subscription first!
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              const isCurrentTier = user.subscription_tier === tier.name;
              return (
                <Card
                  key={tier.name}
                  className={`p-6 cursor-pointer transition-all ${
                    isCurrentTier
                      ? 'bg-gray-700 border-gray-500 opacity-50 cursor-not-allowed'
                      : selectedTier === tier.name
                      ? `bg-gradient-to-br ${tier.gradient} border-white text-white`
                      : 'bg-gray-800 border-gray-700 hover:border-blue-500'
                  }`}
                  onClick={() => !isCurrentTier && setSelectedTier(tier.name)}
                >
                  <Icon className={`w-12 h-12 mb-4 ${
                    selectedTier === tier.name ? 'text-white' : 'text-blue-400'
                  }`} />
                  <h3 className={`text-2xl font-bold mb-2 ${
                    selectedTier === tier.name ? 'text-white' : 'text-white'
                  }`}>
                    {tier.title}
                  </h3>
                  <p className={`text-xl font-bold mb-4 ${
                    selectedTier === tier.name ? 'text-white' : 'text-green-400'
                  }`}>
                    {tier.price}
                  </p>
                  <ul className="space-y-2">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className={`text-sm flex items-center gap-2 ${
                        selectedTier === tier.name ? 'text-white' : 'text-gray-300'
                      }`}>
                        <CheckCircle className="w-4 h-4" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  {isCurrentTier && (
                    <Badge className="mt-4 bg-gray-600">Current Tier</Badge>
                  )}
                </Card>
              );
            })}
          </div>

          <Card className="p-8 bg-gray-800 border-gray-700 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Complete Your Upgrade Request</h2>
            
            <div className="mb-6">
              <label className="text-gray-300 text-sm mb-2 block">Selected Tier</label>
              <Badge className="bg-blue-600 text-lg px-4 py-2">
                {selectedTier ? selectedTier.toUpperCase() : 'None Selected'}
              </Badge>
            </div>

            <div className="mb-6">
              <label className="text-gray-300 text-sm mb-2 block">
                Why are you upgrading? (Optional)
              </label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Tell us why you want to upgrade to this tier..."
                className="bg-gray-700 border-gray-600 text-white h-32"
              />
            </div>

            <Alert className="mb-6 bg-blue-900/30 border-blue-700">
              <AlertDescription className="text-blue-200">
                <strong>Note:</strong> Your upgrade request will be reviewed by our team. 
                Once approved, your new tier benefits will be activated immediately and billing will be adjusted on your next cycle.
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              disabled={!selectedTier || upgradeMutation.isLoading}
              className="w-full h-14 text-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {upgradeMutation.isLoading ? "Submitting..." : "Submit Upgrade Request"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Card>
        </form>
      </div>
    </div>
  );
}