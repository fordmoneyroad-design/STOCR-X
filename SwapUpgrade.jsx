import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { RefreshCw, TrendingUp, CheckCircle, AlertCircle, Car } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createPageUrl } from "@/utils";

export default function SwapUpgrade() {
  const [user, setUser] = useState(null);
  const [requestType, setRequestType] = useState("swap");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const { data: currentVehicles } = useQuery({
    queryKey: ['current-vehicles', subscriptions],
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

  const { data: availableVehicles } = useQuery({
    queryKey: ['available-vehicles'],
    queryFn: () => base44.entities.Vehicle.filter({ status: "available" }),
    initialData: []
  });

  const activeSubscription = subscriptions?.find(sub => sub.status === "active");
  const currentVehicle = activeSubscription ? currentVehicles?.find(v => v.id === activeSubscription.vehicle_id) : null;

  const handleSubmit = async () => {
    if (!selectedVehicle || !activeSubscription || !currentVehicle) return;

    setLoading(true);
    try {
      // Create swap request
      await base44.entities.SwapRequest.create({
        subscription_id: activeSubscription.id,
        current_vehicle_id: currentVehicle.id,
        requested_vehicle_id: selectedVehicle.id,
        request_type: requestType,
        reason: reason,
        status: "pending"
      });

      // Send email notification
      await base44.integrations.Core.SendEmail({
        to: "stocrx@gmail.com",
        subject: `${requestType === "swap" ? "Swap" : "Upgrade"} Request - ${user.email}`,
        body: `
          ${requestType === "swap" ? "Swap" : "Upgrade"} Request:
          
          Customer: ${user.full_name || user.email}
          Email: ${user.email}
          
          Current Vehicle: ${currentVehicle.year} ${currentVehicle.make} ${currentVehicle.model}
          Requested Vehicle: ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}
          
          Reason: ${reason}
          
          Equity Paid: $${activeSubscription.total_paid?.toLocaleString()}
          
          Please review and process this ${requestType} request.
        `
      });

      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Error submitting request. Please try again.");
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

  if (!activeSubscription || !currentVehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-12 text-center border-none shadow-xl">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Active Subscription</h3>
            <p className="text-gray-600 mb-6">You need an active subscription to request a swap or upgrade.</p>
            <Button onClick={() => window.location.href = createPageUrl("BrowseCars")}>
              Browse Available Cars
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {success && (
          <Alert className="mb-8 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Request submitted successfully! We'll review it and contact you within 24 hours.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Swap or Upgrade Your Vehicle
          </h1>
          <p className="text-xl text-gray-600">
            Transfer your equity to a different vehicle
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Current Vehicle */}
          <div className="lg:col-span-1">
            <Card className="p-6 border-none shadow-xl sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Current Vehicle</h3>
              <div className="bg-blue-50 rounded-xl p-4 mb-4">
                <img
                  src={currentVehicle.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'}
                  alt={`${currentVehicle.make} ${currentVehicle.model}`}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <h4 className="font-bold text-lg text-gray-900">
                  {currentVehicle.year} {currentVehicle.make} {currentVehicle.model}
                </h4>
                <p className="text-sm text-gray-600 mt-2">VIN: {currentVehicle.vin}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Equity Paid</span>
                  <span className="font-bold text-green-600">
                    ${activeSubscription.total_paid?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subscription Tier</span>
                  <Badge className="bg-blue-600">
                    {activeSubscription.subscription_tier}
                  </Badge>
                </div>
              </div>

              <Alert className="mt-6 bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  Your equity will transfer to the new vehicle
                </AlertDescription>
              </Alert>
            </Card>
          </div>

          {/* Request Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Type */}
            <Card className="p-8 border-none shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Request Type</h3>
              <RadioGroup value={requestType} onValueChange={setRequestType}>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 border-2 rounded-xl p-4 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="swap" id="swap" />
                    <Label htmlFor="swap" className="cursor-pointer flex-1">
                      <div className="flex items-center gap-3">
                        <RefreshCw className="w-6 h-6 text-blue-600" />
                        <div>
                          <p className="font-bold">Swap Vehicle</p>
                          <p className="text-sm text-gray-600">Switch to a different vehicle at similar value</p>
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 border-2 rounded-xl p-4 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="upgrade" id="upgrade" />
                    <Label htmlFor="upgrade" className="cursor-pointer flex-1">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                        <div>
                          <p className="font-bold">Upgrade Vehicle</p>
                          <p className="text-sm text-gray-600">Move to a higher-value vehicle (additional payment may apply)</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </Card>

            {/* Reason */}
            <Card className="p-8 border-none shadow-xl">
              <Label className="text-lg font-semibold mb-3 block">Reason for Request</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Tell us why you'd like to swap or upgrade..."
                className="h-32"
              />
            </Card>

            {/* Available Vehicles */}
            <Card className="p-8 border-none shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Select Your New Vehicle
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                {availableVehicles?.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    onClick={() => setSelectedVehicle(vehicle)}
                    className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                      selectedVehicle?.id === vehicle.id
                        ? 'border-blue-600 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={vehicle.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="font-bold text-lg text-gray-900 mb-2">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h4>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Price</span>
                        <span className="font-bold text-blue-600">
                          ${vehicle.price?.toLocaleString()}
                        </span>
                      </div>
                      {selectedVehicle?.id === vehicle.id && (
                        <div className="mt-3 flex items-center gap-2 text-blue-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-semibold">Selected</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!selectedVehicle || !reason || loading || success}
              className="w-full h-16 text-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-xl"
            >
              {loading ? "Submitting Request..." : success ? "Request Submitted!" : `Submit ${requestType === "swap" ? "Swap" : "Upgrade"} Request`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}