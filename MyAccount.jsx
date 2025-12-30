
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  User as UserIcon,
  Car,
  CreditCard,
  FileText, // FileText is still imported but not used in the updated Quick Actions
  TrendingUp,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MyAccount() {
  const [user, setUser] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const showSuccess = urlParams.get('success');

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

  const { data: subscriptions, isLoading: loadingSubscriptions } = useQuery({
    queryKey: ['subscriptions', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ customer_email: user?.email }, "-created_date"),
    enabled: !!user,
    initialData: []
  });

  const { data: payments } = useQuery({
    queryKey: ['payments', subscriptions],
    queryFn: async () => {
      if (!subscriptions || subscriptions.length === 0) return [];
      const allPayments = await Promise.all(
        subscriptions.map(sub => base44.entities.Payment.filter({ subscription_id: sub.id }, "-created_date"))
      );
      return allPayments.flat();
    },
    enabled: subscriptions && subscriptions.length > 0,
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

  const { data: financing } = useQuery({
    queryKey: ['financing', subscriptions],
    queryFn: async () => {
      if (!subscriptions || subscriptions.length === 0 || !user) return [];
      return await base44.entities.FinancingOption.filter({ customer_email: user.email });
    },
    enabled: !!user && subscriptions && subscriptions.length > 0,
    initialData: []
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const activeSubscription = subscriptions?.find(sub => sub.status === "active" || sub.status === "pending");
  const activeVehicle = activeSubscription ? vehicles?.find(v => v.id === activeSubscription.vehicle_id) : null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'suspended': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const createPageUrl = (pageName) => {
    // Assuming a standard /app/PageName route for navigation within the application
    return `/app/${pageName}`; 
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {showSuccess && (
          <Alert className="mb-8 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Application submitted successfully! We'll review your documents and contact you within 24 hours.
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user.full_name || user.email}!
          </h1>
          <p className="text-gray-600">Manage your subscriptions and track your ownership progress</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Active Subscription */}
          <div className="lg:col-span-2 space-y-6">
            {activeSubscription && activeVehicle ? (
              <>
                {/* Active Vehicle Card */}
                <Card className="p-6 border-none shadow-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className={`${getStatusColor(activeSubscription.status)} text-white`}>
                      {activeSubscription.status}
                    </Badge>
                    <Car className="w-8 h-8" />
                  </div>
                  
                  <h2 className="text-3xl font-bold mb-2">
                    {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div>
                      <p className="text-blue-100 text-sm">Payment Frequency</p>
                      <p className="text-xl font-semibold capitalize">{activeSubscription.payment_frequency}</p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-sm">Next Payment</p>
                      <p className="text-xl font-semibold">
                        ${activeSubscription.next_payment_amount?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Ownership Progress */}
                <Card className="p-6 border-none shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                      Ownership Progress
                    </h3>
                    <RefreshCw className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>${activeSubscription.total_paid?.toLocaleString() || 0} paid</span>
                      <span>${activeVehicle.price?.toLocaleString()} total</span>
                    </div>
                    <Progress 
                      value={((activeSubscription.total_paid || 0) / (activeVehicle.price || 1)) * 100} 
                      className="h-6"
                    />
                    <p className="text-right text-sm text-gray-600 mt-2">
                      {(((activeSubscription.total_paid || 0) / (activeVehicle.price || 1)) * 100).toFixed(1)}% Complete
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Remaining Balance</p>
                      <p className="text-2xl font-bold text-blue-600">
                        ${activeSubscription.remaining_balance?.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Early Buyout</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${((activeSubscription.remaining_balance || 0) * 0.75).toFixed(0)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">25% discount</p>
                    </div>
                  </div>
                  {/* The 'Complete Ownership Early' button was moved to Quick Actions */}
                </Card>

                {/* Payment History */}
                <Card className="p-6 border-none shadow-lg">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                    Payment History
                  </h3>

                  <div className="space-y-3">
                    {payments && payments.length > 0 ? (
                      payments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              payment.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                            }`}>
                              {payment.status === 'completed' ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <Clock className="w-5 h-5 text-yellow-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold capitalize">{payment.payment_type.replace('_', ' ')}</p>
                              <p className="text-sm text-gray-500">
                                {payment.created_date && new Date(payment.created_date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${payment.amount?.toLocaleString()}</p>
                            <Badge className={payment.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}>
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">No payment history yet</p>
                    )}
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-12 text-center border-none shadow-xl">
                <Car className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Active Subscription</h3>
                <p className="text-gray-600 mb-6">Start your journey to car ownership today</p>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Browse Available Cars
                </Button>
              </Card>
            )}
          </div>

          {/* Right Column - Profile & Quick Actions */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="p-6 border-none shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{user.full_name || 'User'}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="font-semibold">
                    {user.created_date && new Date(user.created_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Total Subscriptions</span>
                  <span className="font-semibold">{subscriptions?.length || 0}</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full mt-6"
                onClick={() => base44.auth.logout()}
              >
                Logout
              </Button>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 border-none shadow-lg">
              <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = createPageUrl("MakePayment")}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Make a Payment
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = createPageUrl("EarlyBuyout")}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Complete Ownership Early
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = createPageUrl("SwapUpgrade")}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Request Swap/Upgrade
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = createPageUrl("ScheduleDelivery")}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Delivery
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = createPageUrl("ReportIncident")}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Report Incident
                </Button>
              </div>

              {/* Financing Options */}
              {financing && financing.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-sm text-gray-600 mb-3">Financing Options</h4>
                  {financing.map((fin) => (
                    <div key={fin.id} className="mb-3 p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold capitalize">
                          {fin.provider_name.replace('_', ' ')}
                        </span>
                        <Badge className="bg-green-500">Active</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        ${fin.monthly_payment}/month for {fin.loan_term_months} months
                      </p>
                      {fin.payment_link && (
                        <Button
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => window.open(fin.payment_link, '_blank')}
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Make Payment
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Verification Status */}
            {activeSubscription && (
              <Card className="p-6 border-none shadow-lg">
                <h3 className="font-bold text-lg mb-4">Verification Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">KYC Verification</span>
                    <Badge className={activeSubscription.kyc_verified ? 'bg-green-500' : 'bg-yellow-500'}>
                      {activeSubscription.kyc_verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Insurance</span>
                    <Badge className={activeSubscription.insurance_verified ? 'bg-green-500' : 'bg-yellow-500'}>
                      {activeSubscription.insurance_verified ? 'Verified' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
