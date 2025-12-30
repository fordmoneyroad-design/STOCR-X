import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle, Package, Truck, Shield, Calendar, MapPin,
  Download, Share2, Bell, X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PostPurchase() {
  const [user, setUser] = useState(null);
  const [showInsurancePopup, setShowInsurancePopup] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Get latest subscription
        const subs = await base44.entities.Subscription.filter({
          customer_email: currentUser.email,
          status: 'active'
        }, '-created_date', 1);

        if (subs.length > 0) {
          setSubscription(subs[0]);
          
          // Show insurance popup if not selected
          if (!subs[0].insurance_selected) {
            setTimeout(() => setShowInsurancePopup(true), 2000);
          }
        }
      } catch (err) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();

    // Track page view
    if (typeof gtag !== 'undefined') {
      gtag('event', 'purchase_complete', {
        event_category: 'ecommerce',
        event_label: 'Post Purchase'
      });
    }
  }, []);

  const addInsuranceMutation = useMutation({
    mutationFn: async () => {
      if (!subscription?.id) {
        throw new Error("No subscription found");
      }
      return await base44.entities.Subscription.update(subscription.id, {
        insurance_selected: true,
        insurance_cost: 150
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['subscription']);
      setShowInsurancePopup(false);
      alert("✅ Insurance added to your subscription!");
    }
  });

  const scheduleInsuranceReminderMutation = useMutation({
    mutationFn: async () => {
      if (!user?.email) {
        throw new Error("User not found");
      }

      const userName = user.full_name || 'there';
      
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: '🛡️ STOCRX: Insurance Reminder',
        body: `Hi ${userName},\n\nThis is a friendly reminder that your vehicle subscription doesn't include insurance coverage yet.\n\nProtect your investment today! Visit your account to add insurance.\n\n- STOCRX Team`
      });

      setShowInsurancePopup(false);
      alert("✅ We'll remind you in 7 days!");
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Success Header */}
        <Card className="p-12 bg-gradient-to-br from-green-600 to-emerald-600 border-none text-center mb-8">
          <CheckCircle className="w-24 h-24 mx-auto mb-6 text-white" />
          <h1 className="text-4xl font-bold text-white mb-4">
            🎉 Congratulations!
          </h1>
          <p className="text-2xl text-green-100 mb-2">
            Your subscription is confirmed!
          </p>
          <p className="text-green-200">
            Order confirmation sent to {user?.email || 'your email'}
          </p>
        </Card>

        {/* Insurance Popup */}
        {showInsurancePopup && subscription && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full p-8 bg-white relative animate-fade-in">
              <button
                onClick={() => setShowInsurancePopup(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>

              <Shield className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold text-center mb-4">
                Add Insurance Protection?
              </h2>
              <p className="text-gray-600 mb-6 text-center">
                Protect your vehicle with comprehensive coverage. Only $150/month!
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Collision coverage</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Theft protection</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>24/7 roadside assistance</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Liability coverage up to $1M</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => addInsuranceMutation.mutate()}
                  disabled={addInsuranceMutation.isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Add Insurance Now
                </Button>
                <Button
                  onClick={() => scheduleInsuranceReminderMutation.mutate()}
                  disabled={scheduleInsuranceReminderMutation.isLoading}
                  variant="outline"
                  className="flex-1"
                >
                  Remind Me in 7 Days
                </Button>
              </div>

              <button
                onClick={() => setShowInsurancePopup(false)}
                className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700"
              >
                No thanks, I'll add it later
              </button>
            </Card>
          </div>
        )}

        {/* What's Next */}
        <Card className="p-8 bg-white mb-8">
          <h2 className="text-2xl font-bold mb-6">What's Next?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <Package className="w-12 h-12 mx-auto mb-3 text-blue-600" />
              <h3 className="font-bold mb-2">1. Vehicle Prep</h3>
              <p className="text-sm text-gray-600">
                We're preparing your vehicle for delivery
              </p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <Truck className="w-12 h-12 mx-auto mb-3 text-purple-600" />
              <h3 className="font-bold mb-2">2. Delivery</h3>
              <p className="text-sm text-gray-600">
                Your vehicle will be delivered soon
              </p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-600" />
              <h3 className="font-bold mb-2">3. Enjoy!</h3>
              <p className="text-sm text-gray-600">
                Start building ownership today
              </p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 bg-white">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Schedule Delivery
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose your preferred delivery date and time
            </p>
            <Button
              onClick={() => navigate(createPageUrl("ScheduleDelivery"))}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Schedule Now
            </Button>
          </Card>

          <Card className="p-6 bg-white">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-green-600" />
              Download Contract
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Get a copy of your subscription agreement
            </p>
            <Button
              variant="outline"
              className="w-full"
            >
              Download PDF
            </Button>
          </Card>

          <Card className="p-6 bg-white">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-purple-600" />
              Share the Love
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Refer friends and earn rewards
            </p>
            <Button
              variant="outline"
              className="w-full"
            >
              Get Referral Link
            </Button>
          </Card>

          <Card className="p-6 bg-white">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-600" />
              Notifications
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Get updates on your subscription
            </p>
            <Button
              variant="outline"
              className="w-full"
            >
              Manage Alerts
            </Button>
          </Card>
        </div>

        {/* Support */}
        <Alert className="mt-8 bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-800">
            <strong>Need Help?</strong> Our support team is here 24/7. 
            <Button
              size="sm"
              onClick={() => navigate(createPageUrl("SupportLiveChat"))}
              className="ml-3 bg-blue-600 hover:bg-blue-700"
            >
              Contact Support
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}