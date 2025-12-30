import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  User, Car, DollarSign, FileText, Clock, MapPin,
  CheckCircle, AlertTriangle, Eye, Download, MessageCircle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function SubscriptionProfile() {
  const [user, setUser] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const subscriptionId = urlParams.get('id');
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.email !== SUPER_ADMIN_EMAIL && currentUser.role !== 'admin') {
          window.location.href = '/';
          return;
        }
        setUser(currentUser);
      } catch (err) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  const { data: subscription } = useQuery({
    queryKey: ['subscription-profile', subscriptionId],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.filter({ id: subscriptionId });
      return subs[0];
    },
    enabled: !!subscriptionId
  });

  const { data: customer } = useQuery({
    queryKey: ['customer-profile', subscription?.customer_email],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ email: subscription.customer_email });
      return users[0];
    },
    enabled: !!subscription
  });

  const { data: vehicle } = useQuery({
    queryKey: ['vehicle-profile', subscription?.vehicle_id],
    queryFn: async () => {
      const vehicles = await base44.entities.Vehicle.filter({ id: subscription.vehicle_id });
      return vehicles[0];
    },
    enabled: !!subscription
  });

  const { data: payments } = useQuery({
    queryKey: ['payments-profile', subscriptionId],
    queryFn: () => base44.entities.Payment.filter({ subscription_id: subscriptionId }, "-created_date"),
    enabled: !!subscriptionId,
    initialData: []
  });

  const { data: documents } = useQuery({
    queryKey: ['documents-profile', subscriptionId],
    queryFn: () => base44.entities.Document.filter({ subscription_id: subscriptionId }),
    enabled: !!subscriptionId,
    initialData: []
  });

  const { data: financing } = useQuery({
    queryKey: ['financing-profile', subscriptionId],
    queryFn: () => base44.entities.FinancingOption.filter({ subscription_id: subscriptionId }),
    enabled: !!subscriptionId,
    initialData: []
  });

  const approveMutation = useMutation({
    mutationFn: () => base44.entities.Subscription.update(subscriptionId, {
      admin_approved: true,
      status: "active"
    }),
    onSuccess: () => queryClient.invalidateQueries(['subscription-profile'])
  });

  if (!user || !subscription) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalPaid = payments?.reduce((sum, p) => sum + (p.status === 'completed' ? p.amount : 0), 0) || 0;
  const ownershipProgress = ((totalPaid / (vehicle?.price || 1)) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="text-gray-400 hover:text-white mb-4"
          >
            ← Back
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Subscription Profile
              </h1>
              <p className="text-gray-400">{subscription.customer_email}</p>
            </div>
            
            <div className="flex gap-4">
              <Badge className={
                subscription.status === 'active' ? 'bg-green-500 text-lg px-4 py-2' :
                subscription.status === 'pending' ? 'bg-yellow-500 text-lg px-4 py-2' :
                'bg-red-500 text-lg px-4 py-2'
              }>
                {subscription.status}
              </Badge>
              
              {!subscription.admin_approved && (
                <Button
                  onClick={() => approveMutation.mutate()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Subscription
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <DollarSign className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-2xl font-bold text-white">${totalPaid.toLocaleString()}</p>
            <p className="text-gray-400 text-sm">Total Paid</p>
          </Card>

          <Card className="p-6 bg-gray-800 border-gray-700">
            <Clock className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-2xl font-bold text-white">{subscription.contract_length_months}mo</p>
            <p className="text-gray-400 text-sm">Contract Length</p>
          </Card>

          <Card className="p-6 bg-gray-800 border-gray-700">
            <FileText className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-2xl font-bold text-white">{documents.length}</p>
            <p className="text-gray-400 text-sm">Documents</p>
          </Card>

          <Card className="p-6 bg-gray-800 border-gray-700">
            <Car className="w-8 h-8 text-orange-400 mb-2" />
            <p className="text-2xl font-bold text-white">{ownershipProgress}%</p>
            <p className="text-gray-400 text-sm">Ownership Progress</p>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-gray-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="customer">Customer</TabsTrigger>
            <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="financing">Financing</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Subscription Details</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Subscription ID</p>
                  <p className="text-white font-mono">{subscription.id}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Tier</p>
                  <Badge className="bg-purple-600">{subscription.subscription_tier}</Badge>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Payment Frequency</p>
                  <p className="text-white capitalize">{subscription.payment_frequency}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Next Payment</p>
                  <p className="text-white">${subscription.next_payment_amount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Next Payment Date</p>
                  <p className="text-white">{subscription.next_payment_date ? new Date(subscription.next_payment_date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Late Payments</p>
                  <p className="text-white">{subscription.late_payment_count || 0}</p>
                </div>
              </div>
            </Card>

            {!subscription.admin_approved && (
              <Alert className="bg-yellow-900 border-yellow-700">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-200">
                  This subscription is pending approval. Review documents and approve to activate.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Customer Tab */}
          <TabsContent value="customer">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <User className="w-6 h-6 text-blue-400" />
                Customer Information
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Full Name</p>
                  <p className="text-white">{customer?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Email</p>
                  <p className="text-white">{customer?.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Phone</p>
                  <p className="text-white">{customer?.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Delivery Address</p>
                  <p className="text-white">{subscription.delivery_address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Subscription Tier</p>
                  <Badge className="bg-purple-600">{customer?.subscription_tier || 'free'}</Badge>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Account Created</p>
                  <p className="text-white">{customer?.created_date ? new Date(customer.created_date).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              <div className="mt-6">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Customer
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Vehicle Tab */}
          <TabsContent value="vehicle">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Car className="w-6 h-6 text-orange-400" />
                Vehicle Details
              </h2>
              
              {vehicle && (
                <>
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Vehicle</p>
                      <p className="text-white text-xl font-bold">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">VIN</p>
                      <p className="text-white font-mono">{vehicle.vin || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Condition</p>
                      <Badge className="bg-orange-600">{vehicle.condition}</Badge>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Mileage</p>
                      <p className="text-white">{vehicle.mileage?.toLocaleString()} miles</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Location</p>
                      <p className="text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {vehicle.location}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Price</p>
                      <p className="text-white text-xl font-bold">${vehicle.price?.toLocaleString()}</p>
                    </div>
                  </div>

                  {vehicle.images && vehicle.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-4">
                      {vehicle.images.slice(0, 4).map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Vehicle ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Payment History</h2>
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-semibold text-white capitalize">{payment.payment_type.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-400">{payment.created_date ? new Date(payment.created_date).toLocaleDateString() : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-white">${payment.amount?.toLocaleString()}</p>
                      <Badge className={
                        payment.status === 'completed' ? 'bg-green-600' :
                        payment.status === 'pending' ? 'bg-yellow-600' : 'bg-red-600'
                      }>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Documents</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-indigo-600 capitalize">{doc.document_type.replace('_', ' ')}</Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(doc.document_url, '_blank')}
                          className="text-blue-400"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(doc.document_url, '_blank')}
                          className="text-green-400"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">
                      Uploaded: {doc.created_date ? new Date(doc.created_date).toLocaleDateString() : ''}
                    </p>
                    {doc.retention_until && (
                      <p className="text-xs text-gray-500 mt-1">
                        Retained until: {new Date(doc.retention_until).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Financing Tab */}
          <TabsContent value="financing">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Financing Options</h2>
              {financing.length > 0 ? (
                <div className="space-y-4">
                  {financing.map((fin) => (
                    <div key={fin.id} className="p-6 bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white capitalize">
                          {fin.provider_name.replace('_', ' ')}
                        </h3>
                        <Badge className={
                          fin.application_status === 'approved' ? 'bg-green-600' :
                          fin.application_status === 'pending' ? 'bg-yellow-600' : 'bg-red-600'
                        }>
                          {fin.application_status}
                        </Badge>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-gray-400 text-sm">Approved Amount</p>
                          <p className="text-white font-bold">${fin.approved_amount?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Monthly Payment</p>
                          <p className="text-white font-bold">${fin.monthly_payment?.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Loan Term</p>
                          <p className="text-white font-bold">{fin.loan_term_months} months</p>
                        </div>
                      </div>
                      {fin.payment_link && (
                        <Button
                          className="mt-4 bg-blue-600 hover:bg-blue-700"
                          onClick={() => window.open(fin.payment_link, '_blank')}
                        >
                          Open Payment Portal
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 py-12">No financing options on file</p>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}