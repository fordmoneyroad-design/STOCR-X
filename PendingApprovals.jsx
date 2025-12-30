
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle, X, Eye, ArrowLeft, AlertTriangle, FileText, User, DollarSign } from "lucide-react";
import { createPageUrl } from "@/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import SuperAdminQuickActions from "../components/admin/SuperAdminQuickActions";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function PendingApprovals() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  const { data: pendingSubscriptions } = useQuery({
    queryKey: ['pending-subscriptions'],
    queryFn: () => base44.entities.Subscription.filter({ admin_approved: false, status: "pending" }),
    initialData: []
  });

  const { data: pendingKYC } = useQuery({
    queryKey: ['pending-kyc'],
    queryFn: () => base44.entities.Subscription.filter({ kyc_verified: false, status: "pending" }),
    initialData: []
  });

  const { data: approvedKYC } = useQuery({
    queryKey: ['approved-kyc'],
    queryFn: () => base44.entities.Subscription.filter({ kyc_verified: true, status: "active" }),
    initialData: []
  });

  const { data: allSubscriptions } = useQuery({
    queryKey: ['all-subscriptions-for-approval'],
    queryFn: () => base44.entities.Subscription.list(),
    initialData: []
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles-all'],
    queryFn: () => base44.entities.Vehicle.list(),
    initialData: []
  });

  const { data: allPayments } = useQuery({
    queryKey: ['all-payments-for-approval'],
    queryFn: () => base44.entities.Payment.list("-created_date"),
    initialData: []
  });

  const { data: allUsers } = useQuery({
    queryKey: ['all-users-for-payments'],
    queryFn: () => base44.entities.User.list(),
    initialData: []
  });

  const approveSubscriptionMutation = useMutation({
    mutationFn: (id) => base44.entities.Subscription.update(id, {
      admin_approved: true,
      status: "active",
      kyc_verified: true
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-subscriptions']);
      queryClient.invalidateQueries(['pending-kyc']);
      queryClient.invalidateQueries(['approved-kyc']);
      queryClient.invalidateQueries(['all-subscriptions-for-approval']);
    }
  });

  const approvePaymentMutation = useMutation({
    mutationFn: (id) => base44.entities.Payment.update(id, {
      status: "completed"
    }),
    onSuccess: () => queryClient.invalidateQueries(['all-payments-for-approval'])
  });

  const denyMutation = useMutation({
    mutationFn: ({ type, id }) => {
      if (type === 'subscription') {
        return base44.entities.Subscription.update(id, { status: "terminated" });
      } else {
        return base44.entities.Payment.update(id, { status: "failed" });
      }
    },
    onSuccess: (_, variables) => {
      if (variables.type === 'subscription') {
        queryClient.invalidateQueries(['pending-subscriptions']);
        queryClient.invalidateQueries(['pending-kyc']);
        queryClient.invalidateQueries(['approved-kyc']);
        queryClient.invalidateQueries(['all-subscriptions-for-approval']);
      } else if (variables.type === 'payment') {
        queryClient.invalidateQueries(['all-payments-for-approval']);
      }
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <AlertTriangle className="w-10 h-10 text-yellow-400" />
            Pending Approvals
          </h1>
          <p className="text-gray-400">Review and approve pending items</p>
        </div>

        <Tabs defaultValue="pending_kyc" className="mt-8">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="pending_kyc">Pending KYC ({pendingKYC.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedKYC.length})</TabsTrigger>
            <TabsTrigger value="pending_payments">Pending Payments ({allPayments.filter(p => p.status === 'pending').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending_kyc">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">KYC Verification Pending</h2>
              {pendingKYC.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                  <p className="text-gray-400">No pending KYC verifications.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Customer</TableHead>
                      <TableHead className="text-gray-300">License</TableHead>
                      <TableHead className="text-gray-300">Selfie</TableHead>
                      <TableHead className="text-gray-300">Insurance</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingKYC.map((sub) => (
                      <TableRow key={sub.id} className="border-gray-700">
                        <TableCell className="text-white">{sub.customer_email}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {sub.license_front_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(sub.license_front_url, '_blank')}
                                className="border-blue-500 text-blue-400"
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                Front
                              </Button>
                            )}
                            {sub.license_back_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(sub.license_back_url, '_blank')}
                                className="border-blue-500 text-blue-400"
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                Back
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {sub.selfie_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(sub.selfie_url, '_blank')}
                              className="border-green-500 text-green-400"
                            >
                              <User className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          {sub.insurance_doc_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(sub.insurance_doc_url, '_blank')}
                              className="border-purple-500 text-purple-400"
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => navigate(createPageUrl("SubscriptionProfile") + `?id=${sub.id}`)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Review Profile
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => approveSubscriptionMutation.mutate(sub.id)}
                              className="bg-green-600 hover:bg-green-700"
                              disabled={approveSubscriptionMutation.isLoading}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve KYC
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (confirm('Deny this subscription and its KYC?')) {
                                  denyMutation.mutate({ type: 'subscription', id: sub.id });
                                }
                              }}
                              disabled={denyMutation.isLoading}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Approved KYC</h2>
              {approvedKYC.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                  <p className="text-gray-400">No approved KYC verifications.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Customer</TableHead>
                      <TableHead className="text-gray-300">License</TableHead>
                      <TableHead className="text-gray-300">Selfie</TableHead>
                      <TableHead className="text-gray-300">Insurance</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedKYC.map((sub) => (
                      <TableRow key={sub.id} className="border-gray-700">
                        <TableCell className="text-white">{sub.customer_email}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {sub.license_front_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(sub.license_front_url, '_blank')}
                                className="border-blue-500 text-blue-400"
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                Front
                              </Button>
                            )}
                            {sub.license_back_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(sub.license_back_url, '_blank')}
                                className="border-blue-500 text-blue-400"
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                Back
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {sub.selfie_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(sub.selfie_url, '_blank')}
                              className="border-green-500 text-green-400"
                            >
                              <User className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          {sub.insurance_doc_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(sub.insurance_doc_url, '_blank')}
                              className="border-purple-500 text-purple-400"
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => navigate(createPageUrl("SubscriptionProfile") + `?id=${sub.id}`)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Profile
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="pending_payments">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Pending Payments</h2>

              {allPayments.filter(p => p.status === 'pending').length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">No pending payments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allPayments.filter(p => p.status === 'pending').map((payment) => {
                    const subscription = allSubscriptions.find(s => s.id === payment.subscription_id);
                    const vehicle = vehicles.find(v => v.id === subscription?.vehicle_id);
                    const customer = allUsers.find(u => u.email === subscription?.customer_email);

                    return (
                      <Card key={payment.id} className="p-6 bg-gray-700 border-gray-600">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-3xl font-bold text-white">${payment.amount?.toLocaleString()}</p>
                            <p className="text-sm text-gray-400 capitalize">{payment.payment_type?.replace('_', ' ')}</p>
                          </div>
                          <Badge className="bg-yellow-600 text-lg px-4 py-2">Pending Verification</Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 mb-4 p-4 bg-gray-800 rounded-lg">
                          {/* Customer Info */}
                          <div>
                            <h4 className="text-sm font-bold text-gray-400 mb-3">Customer Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Name:</span>
                                <span className="text-white font-semibold">{customer?.full_name || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Email:</span>
                                <span className="text-white">{subscription?.customer_email}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Tier:</span>
                                <Badge className="bg-purple-600">{customer?.subscription_tier || 'free'}</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Member Since:</span>
                                <span className="text-white">
                                  {customer?.created_date && new Date(customer.created_date).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Payment Info */}
                          <div>
                            <h4 className="text-sm font-bold text-gray-400 mb-3">Payment Details</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Payment Date:</span>
                                <span className="text-white">
                                  {payment.created_date && new Date(payment.created_date).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Due Date:</span>
                                <span className="text-white">
                                  {payment.due_date ? new Date(payment.due_date).toLocaleDateString() : 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Method:</span>
                                <span className="text-white capitalize">{payment.payment_method || 'Manual'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Transaction ID:</span>
                                <span className="text-white text-xs font-mono">
                                  {payment.transaction_id || payment.id?.slice(0, 8)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Vehicle Info */}
                        {vehicle && (
                          <div className="p-4 bg-gray-800 rounded-lg mb-4">
                            <h4 className="text-sm font-bold text-gray-400 mb-3">Vehicle Information</h4>
                            <div className="flex items-center gap-4">
                              {vehicle.images && vehicle.images[0] && (
                                <img
                                  src={vehicle.images[0]}
                                  alt="Vehicle"
                                  className="w-32 h-24 object-cover rounded-lg"
                                />
                              )}
                              <div className="flex-1">
                                <p className="text-white font-bold text-lg mb-1">
                                  {vehicle.year} {vehicle.make} {vehicle.model}
                                </p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-gray-400">VIN: </span>
                                    <span className="text-white">{vehicle.vin || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Price: </span>
                                    <span className="text-green-400 font-semibold">${vehicle.price?.toLocaleString()}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Location: </span>
                                    <span className="text-white">{vehicle.location_city}, {vehicle.location_state}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-400">Condition: </span>
                                    <span className="text-white capitalize">{vehicle.condition?.replace('_', ' ')}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Subscription Summary */}
                        {subscription && (
                          <div className="p-4 bg-gray-800 rounded-lg mb-4">
                            <h4 className="text-sm font-bold text-gray-400 mb-3">Subscription Summary</h4>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-gray-400">Tier</p>
                                <Badge className="bg-purple-600 mt-1">{subscription.subscription_tier}</Badge>
                              </div>
                              <div>
                                <p className="text-gray-400">Total Paid</p>
                                <p className="text-white font-bold">${subscription.total_paid?.toLocaleString() || '0'}</p>
                              </div>
                              <div>
                                <p className="text-gray-400">Remaining</p>
                                <p className="text-white font-bold">${subscription.remaining_balance?.toLocaleString() || '0'}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {payment.days_late > 0 && (
                          <Alert className="mb-4 bg-red-900/30 border-red-700">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                            <AlertDescription className="text-red-200">
                              {payment.days_late} days late • Late fee: ${payment.late_fee_applied || 0}
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="flex gap-3">
                          <Button
                            onClick={() => navigate(createPageUrl("PaymentDetail") + `?id=${payment.id}`)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Full Payment Details
                          </Button>
                          {subscription && (
                            <Button
                              onClick={() => navigate(createPageUrl("UserProfile") + `?email=${subscription.customer_email}`)}
                              className="flex-1 bg-purple-600 hover:bg-purple-700"
                            >
                              <User className="w-4 h-4 mr-2" />
                              Customer Profile
                            </Button>
                          )}
                          {subscription && (
                            <Button
                              onClick={() => navigate(createPageUrl("SubscriptionProfile") + `?id=${subscription.id}`)}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              View Subscription
                            </Button>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        <SuperAdminQuickActions />
      </div>
    </div>
  );
}
