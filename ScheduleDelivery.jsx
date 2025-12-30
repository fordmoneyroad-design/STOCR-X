import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, MapPin, CheckCircle, AlertCircle, Truck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";

export default function ScheduleDelivery() {
  const [user, setUser] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setDeliveryAddress(currentUser.delivery_address || "");
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

  const activeSubscription = subscriptions?.find(sub => sub.status === "active" || sub.status === "pending");
  const activeVehicle = activeSubscription ? vehicles?.find(v => v.id === activeSubscription.vehicle_id) : null;

  const updateSubscriptionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Subscription.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscriptions']);
    }
  });

  const handleSubmit = async () => {
    if (!deliveryDate || !deliveryAddress) {
      alert("Please select a date and enter delivery address");
      return;
    }

    setLoading(true);
    try {
      // Update subscription with delivery details
      await updateSubscriptionMutation.mutateAsync({
        id: activeSubscription.id,
        data: {
          delivery_scheduled: true,
          delivery_date: format(deliveryDate, 'yyyy-MM-dd'),
          delivery_address: deliveryAddress,
          delivery_fee: 0 // Calculate based on distance if needed
        }
      });

      // Update user delivery address
      await base44.auth.updateMe({ delivery_address: deliveryAddress });

      // Send email notification
      await base44.integrations.Core.SendEmail({
        to: "stocrx@gmail.com",
        subject: `Delivery Scheduled - ${user.email}`,
        body: `
          Delivery Scheduled:
          
          Customer: ${user.full_name || user.email}
          Email: ${user.email}
          
          Vehicle: ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}
          VIN: ${activeVehicle.vin}
          
          Delivery Date: ${format(deliveryDate, 'PPP')}
          Delivery Address: ${deliveryAddress}
          
          Please confirm with the customer and arrange delivery.
        `
      });

      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Error scheduling delivery. Please try again.");
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
            <p className="text-gray-600 mb-6">You need an active subscription to schedule delivery.</p>
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {success && (
          <Alert className="mb-8 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Delivery scheduled successfully! We'll contact you to confirm the details.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full text-blue-800 mb-4">
            <Truck className="w-5 h-5" />
            <span className="font-semibold">Vehicle Delivery</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Schedule Your Delivery
          </h1>
          <p className="text-gray-600">
            Free delivery within 25 miles
          </p>
        </div>

        {/* Vehicle Card */}
        <Card className="p-6 border-none shadow-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white mb-8">
          <div className="flex items-center gap-4">
            <img
              src={activeVehicle.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'}
              alt={`${activeVehicle.make} ${activeVehicle.model}`}
              className="w-24 h-24 object-cover rounded-lg"
            />
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
              </h2>
              <p className="text-blue-100 text-sm">VIN: {activeVehicle.vin}</p>
            </div>
          </div>
        </Card>

        <Card className="p-8 border-none shadow-xl">
          <div className="space-y-6">
            {/* Delivery Date */}
            <div>
              <Label className="text-lg font-semibold mb-3 block">Delivery Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-14 justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    {deliveryDate ? format(deliveryDate, 'PPP') : 'Select a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deliveryDate}
                    onSelect={setDeliveryDate}
                    disabled={(date) => date < new Date() || date < new Date(new Date().setDate(new Date().getDate() + 2))}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-sm text-gray-500 mt-2">
                Delivery typically takes 2-7 business days
              </p>
            </div>

            {/* Delivery Address */}
            <div>
              <Label className="text-lg font-semibold mb-3 block">Delivery Address *</Label>
              <Input
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter your delivery address"
                className="h-14 text-lg"
              />
            </div>

            {/* Delivery Info */}
            <Card className="p-6 bg-blue-50 border-none">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Delivery Information
              </h4>
              <div className="space-y-2 text-sm text-gray-700">
                <p>✓ Free delivery within 25 miles of our location</p>
                <p>✓ Additional fee for delivery beyond 25 miles</p>
                <p>✓ Vehicle will be delivered to your doorstep</p>
                <p>✓ Full tank of gas included</p>
                <p>✓ Complete vehicle walkthrough on delivery</p>
              </div>
            </Card>

            {/* Warning */}
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                Please ensure someone is available to receive the vehicle at the specified address and time.
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading || success || !deliveryDate || !deliveryAddress}
              className="w-full h-16 text-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-xl"
            >
              {loading ? "Scheduling..." : success ? "Delivery Scheduled!" : "Schedule Delivery"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}