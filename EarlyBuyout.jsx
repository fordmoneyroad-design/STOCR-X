
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, DollarSign, CheckCircle, AlertCircle, Star } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createPageUrl } from "@/utils";

export default function EarlyBuyout() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
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

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles', subscriptions],
    queryFn: async () => {
      if (!subscriptions || subscriptions.length === 0) return [];
      const vehicleIds = subscriptions.map(sub => sub.vehicle_id);
      const allVehicles = await Promise.all(
        vehicleIds.map(id => base44.entities.Vehicle.filter({ id }))
      );
      return allVehicles.flat();
    },
    enabled: subscriptions && subscriptions.length > 0,
    initialData: []
  });

  const activeSubscription = subscriptions?.find(sub => sub.status === "active");
  const activeVehicle = activeSubscription ? vehicles?.find(v => v.id === activeSubscription.vehicle_id) : null;

  const handleBuyout = async () => {
    if (!activeSubscription || !activeVehicle) return;

    setLoading(true);
    try {
      // NEW BUYOUT CALCULATION:
      // Full subscription balance + 0.6% tax (no $700 markup, no discount)
      const remainingBalance = activeSubscription.remaining_balance || 0;
      const taxAmount = remainingBalance * 0.006; // 0.6% tax
      const totalBuyout = remainingBalance + taxAmount;

      // Send email to admin
      await base44.integrations.Core.SendEmail({
        to: "stocrx@gmail.com",
        subject: `Early Buyout Request - ${user.email}`,
        body: `
          Early Buyout Request:
          
          Customer: ${user.full_name || user.email}
          Email: ${user.email}
          
          Vehicle: ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}
          
          Remaining Balance: $${remainingBalance.toLocaleString()}
          Tax (0.6%): $${taxAmount.toFixed(2)}
          Total Buyout Amount: $${totalBuyout.toFixed(2)}
          
          Total Paid So Far: $${activeSubscription.total_paid?.toLocaleString()}
          
          NOTE: Customer will pay FULL subscription balance + 0.6% tax. No $700 markup removed, no discount applied (as per updated policy).
          
          Please review and contact the customer to complete the early buyout process.
        `
      });

      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Error submitting buyout request. Please try again.");
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!activeSubscription || !activeVehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-12 text-center border-none shadow-xl">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Active Subscription</h3>
            <p className="text-gray-600 mb-6">You need an active subscription to request early buyout.</p>
            <Button onClick={() => window.location.href = createPageUrl("BrowseCars")}>
              Browse Available Cars
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const remainingBalance = activeSubscription.remaining_balance || 0;
  const taxAmount = remainingBalance * 0.006; // 0.6% tax
  const totalBuyout = remainingBalance + taxAmount;
  const ownershipProgress = ((activeSubscription.total_paid || 0) / (activeVehicle.price || 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {success && (
          <Alert className="mb-8 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Early buyout request submitted! We'll contact you within 24 hours to complete the process.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full text-yellow-800 mb-4">
            <Star className="w-5 h-5" />
            <span className="font-semibold">Early Buyout Offer</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Complete Ownership Early
          </h1>
          <p className="text-gray-600">
            Own your vehicle today by paying the remaining balance plus a small tax.
          </p>
        </div>

        {/* Vehicle Card */}
        <Card className="p-6 border-none shadow-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white mb-8">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-yellow-500 text-black">
              Eligible for Buyout
            </Badge>
          </div>
          
          <h2 className="text-3xl font-bold mb-2">
            {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-blue-100 text-sm">Contract Length</p>
              <p className="text-xl font-semibold">{activeSubscription.contract_length_months} months</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Payment Frequency</p>
              <p className="text-xl font-semibold capitalize">{activeSubscription.payment_frequency}</p>
            </div>
          </div>
        </Card>

        {/* Ownership Progress */}
        <Card className="p-8 border-none shadow-lg mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h3 className="text-2xl font-bold text-gray-900">Your Ownership Journey</h3>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>${activeSubscription.total_paid?.toLocaleString() || 0} paid</span>
              <span>${activeVehicle.price?.toLocaleString()} total</span>
            </div>
            <Progress 
              value={ownershipProgress} 
              className="h-6"
            />
            <p className="text-right text-sm text-gray-600 mt-2">
              {ownershipProgress.toFixed(1)}% Complete
            </p>
          </div>
        </Card>

        {/* Buyout Calculation - UPDATED */}
        <Card className="p-8 border-none shadow-xl bg-gradient-to-br from-green-50 to-emerald-50 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" />
            Early Buyout Calculation
          </h3>

          <Alert className="mb-6 bg-orange-50 border-orange-200">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Updated Policy:</strong> Early buyout = Full remaining balance + 0.6% tax. No discounts or $700 markup removal.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-gray-700">Remaining Subscription Balance</span>
              <span className="text-2xl font-bold text-gray-900">
                ${remainingBalance.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b">
              <span className="text-gray-700">Tax (0.6%)</span>
              <span className="text-2xl font-bold text-blue-600">
                +${taxAmount.toFixed(2)}
              </span>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-green-500">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Buyout Price</p>
                  <p className="text-4xl font-bold text-green-600">
                    ${totalBuyout.toFixed(2)}
                  </p>
                </div>
                <Star className="w-12 h-12 text-yellow-400" />
              </div>
            </div>
          </div>
        </Card>

        {/* Benefits */}
        <Card className="p-8 border-none shadow-lg mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Benefits of Early Buyout</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Own your vehicle outright",
              "Stop subscription payments",
              "No more contracts or terms",
              "Full vehicle ownership",
              "Transfer or sell anytime"
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Warning */}
        <Alert variant="destructive" className="mb-8 bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Important:</strong> Once you complete the buyout, this offer cannot be reversed. Make sure you're ready to own the vehicle outright.
          </AlertDescription>
        </Alert>

        {/* CTA Button */}
        <Button
          onClick={handleBuyout}
          disabled={loading || success}
          className="w-full h-16 text-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-xl"
        >
          {loading ? "Submitting Request..." : success ? "Request Submitted!" : "Request Early Buyout"}
        </Button>

        <p className="text-center text-sm text-gray-500 mt-4">
          We'll contact you within 24 hours to process your buyout payment
        </p>
      </div>
    </div>
  );
}
