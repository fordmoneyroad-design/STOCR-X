import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, DollarSign, User, Car, Calendar, CreditCard, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SuperAdminQuickActions from "../components/admin/SuperAdminQuickActions";

export default function PaymentDetail() {
  const [user, setUser] = useState(null);
  const [payment, setPayment] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [customer, setCustomer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin' && currentUser.email !== "fordmoneyroad@gmail.com") {
          window.location.href = '/';
          return;
        }
        setUser(currentUser);

        const urlParams = new URLSearchParams(window.location.search);
        const paymentId = urlParams.get('id');
        
        if (paymentId) {
          const payments = await base44.entities.Payment.filter({ id: paymentId });
          if (payments.length > 0) {
            const pmt = payments[0];
            setPayment(pmt);

            // Load subscription
            if (pmt.subscription_id) {
              const subs = await base44.entities.Subscription.filter({ id: pmt.subscription_id });
              if (subs.length > 0) {
                const sub = subs[0];
                setSubscription(sub);

                // Load customer
                const users = await base44.entities.User.filter({ email: sub.customer_email });
                if (users.length > 0) {
                  setCustomer(users[0]);
                }

                // Load vehicle
                if (sub.vehicle_id) {
                  const vehicles = await base44.entities.Vehicle.filter({ id: sub.vehicle_id });
                  if (vehicles.length > 0) {
                    setVehicle(vehicles[0]);
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        base44.auth.redirectToLogin();
      }
    };
    loadData();
  }, []);

  if (!user || !payment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <DollarSign className="w-10 h-10 text-green-400" />
            Payment Details
          </h1>
          <p className="text-gray-400">Transaction ID: {payment.transaction_id || payment.id}</p>
        </div>

        {/* Payment Status Card */}
        <Card className={`p-8 mb-8 ${
          payment.status === 'completed' ? 'bg-green-900/30 border-green-700' :
          payment.status === 'pending' ? 'bg-yellow-900/30 border-yellow-700' :
          'bg-red-900/30 border-red-700'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-300 text-sm mb-1">Amount</p>
              <p className="text-5xl font-bold text-white">${payment.amount.toLocaleString()}</p>
            </div>
            <Badge className={`text-2xl px-6 py-3 ${
              payment.status === 'completed' ? 'bg-green-600' :
              payment.status === 'pending' ? 'bg-yellow-600' :
              'bg-red-600'
            }`}>
              {payment.status.toUpperCase()}
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div>
              <p className="text-gray-400 text-sm">Payment Type</p>
              <p className="text-white font-semibold">{payment.payment_type}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Method</p>
              <p className="text-white font-semibold">{payment.payment_method || 'N/A'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Platform Fee</p>
              <p className="text-white font-semibold">${payment.platform_fee?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Days Late</p>
              <p className="text-white font-semibold">{payment.days_late || 0}</p>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Customer Information */}
          {customer && (
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-blue-400" />
                Customer Information
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Full Name</p>
                  <p className="text-white font-semibold text-lg">{customer.full_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white font-semibold">{customer.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Subscription Tier</p>
                  <Badge className="bg-purple-600">{customer.subscription_tier || 'free'}</Badge>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Member Since</p>
                  <p className="text-white">
                    {customer.created_date && new Date(customer.created_date).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  onClick={() => navigate(createPageUrl("UserProfile") + `?email=${customer.email}`)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  View Full Profile
                </Button>
              </div>
            </Card>
          )}

          {/* Vehicle Information */}
          {vehicle && (
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Car className="w-6 h-6 text-orange-400" />
                Vehicle Information
              </h2>
              {vehicle.images && vehicle.images[0] && (
                <img
                  src={vehicle.images[0]}
                  alt={`${vehicle.year} ${vehicle.make}`}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Vehicle</p>
                  <p className="text-white font-bold text-xl">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-gray-400 text-sm">Price</p>
                    <p className="text-white">${vehicle.price?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Mileage</p>
                    <p className="text-white">{vehicle.mileage?.toLocaleString() || 'N/A'} mi</p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate(createPageUrl("CarDetails") + `?id=${vehicle.id}`)}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  View Vehicle Details
                </Button>
              </div>
            </Card>
          )}

          {/* Subscription Details */}
          {subscription && (
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-purple-400" />
                Subscription Details
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Tier</p>
                    <Badge className="bg-purple-600">{subscription.subscription_tier}</Badge>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Status</p>
                    <Badge className={
                      subscription.status === 'active' ? 'bg-green-600' :
                      subscription.status === 'pending' ? 'bg-yellow-600' : 'bg-red-600'
                    }>
                      {subscription.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Paid</p>
                  <p className="text-white font-bold text-xl">${subscription.total_paid?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Remaining Balance</p>
                  <p className="text-white font-bold text-xl">${subscription.remaining_balance?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Next Payment Date</p>
                  <p className="text-white">
                    {subscription.next_payment_date && new Date(subscription.next_payment_date).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  onClick={() => navigate(createPageUrl("SubscriptionProfile") + `?id=${subscription.id}`)}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  View Full Subscription
                </Button>
              </div>
            </Card>
          )}

          {/* Payment Timeline */}
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-400" />
              Payment Timeline
            </h2>
            <div className="space-y-4">
              {payment.created_date && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div>
                    <p className="text-white font-semibold">Payment Created</p>
                    <p className="text-sm text-gray-400">
                      {new Date(payment.created_date).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {payment.due_date && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <div>
                    <p className="text-white font-semibold">Due Date</p>
                    <p className="text-sm text-gray-400">
                      {new Date(payment.due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              {payment.paid_date && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div>
                    <p className="text-white font-semibold">Payment Completed</p>
                    <p className="text-sm text-gray-400">
                      {new Date(payment.paid_date).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
              {payment.notes && (
                <div className="mt-6 p-4 bg-gray-700 rounded-lg">
                  <p className="text-gray-400 text-sm mb-2">Notes</p>
                  <p className="text-white">{payment.notes}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <SuperAdminQuickActions />
      </div>
    </div>
  );
}