
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Mail, Calendar, Shield, DollarSign, Car, FileText, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SuperAdminQuickActions from "../components/admin/SuperAdminQuickActions";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser?.role !== 'admin' && currentUser?.email !== "fordmoneyroad@gmail.com") {
          window.location.href = '/';
          return;
        }
        setUser(currentUser);

        // Get email from URL
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get('email');
        
        if (email) {
          const users = await base44.entities.User.filter({ email });
          if (users && users.length > 0) {
            setProfileUser(users[0]);
          }
        }
      } catch (err) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  const { data: subscriptions } = useQuery({
    queryKey: ['user-subscriptions', profileUser?.email],
    queryFn: () => base44.entities.Subscription.filter({ customer_email: profileUser?.email || '' }),
    enabled: !!profileUser?.email,
    initialData: []
  });

  const { data: payments } = useQuery({
    queryKey: ['user-payments', subscriptions],
    queryFn: async () => {
      if (!subscriptions || subscriptions.length === 0) return [];
      const allPayments = [];
      for (const sub of subscriptions) {
        const subPayments = await base44.entities.Payment.filter({ subscription_id: sub?.id });
        allPayments.push(...subPayments);
      }
      return allPayments;
    },
    enabled: subscriptions && subscriptions.length > 0,
    initialData: []
  });

  const { data: documents } = useQuery({
    queryKey: ['user-documents', profileUser?.email],
    queryFn: () => base44.entities.Document.filter({ customer_email: profileUser?.email || '' }),
    enabled: !!profileUser?.email,
    initialData: []
  });

  const { data: activityLogs } = useQuery({
    queryKey: ['user-activity', profileUser?.email],
    queryFn: () => base44.entities.ActivityLog.filter({ user_email: profileUser?.email || '' }, "-created_date", 50),
    enabled: !!profileUser?.email,
    initialData: []
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles-list'],
    queryFn: () => base44.entities.Vehicle.list(),
    initialData: []
  });

  if (!user || !profileUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalPaid = payments.reduce((sum, p) => sum + (p?.status === 'completed' ? (p?.amount || 0) : 0), 0);
  const totalPending = payments.reduce((sum, p) => sum + (p?.status === 'pending' ? (p?.amount || 0) : 0), 0);

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

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">
                {profileUser?.full_name || profileUser?.email || 'User'}
              </h1>
              <p className="text-gray-400">{profileUser?.email}</p>
              <div className="flex gap-2 mt-2">
                <Badge className={profileUser?.role === 'admin' ? 'bg-red-600' : 'bg-blue-600'}>
                  {profileUser?.role || 'user'}
                </Badge>
                <Badge className="bg-purple-600">{profileUser?.subscription_tier || 'free'}</Badge>
                {profileUser?.is_lifetime_member && (
                  <Badge className="bg-yellow-600">Lifetime Member</Badge>
                )}
                {profileUser?.department && (
                  <Badge className="bg-green-600 capitalize">{profileUser.department}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <Mail className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-gray-400 text-sm mb-1">Email</p>
            <p className="text-white font-semibold text-sm break-all">{profileUser?.email}</p>
          </Card>
          <Card className="p-6 bg-gray-800 border-gray-700">
            <Calendar className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-gray-400 text-sm mb-1">Member Since</p>
            <p className="text-white font-semibold">
              {profileUser?.created_date ? new Date(profileUser.created_date).toLocaleDateString() : 'N/A'}
            </p>
          </Card>
          <Card className="p-6 bg-green-900 border-green-700">
            <DollarSign className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-green-200 text-sm mb-1">Total Paid</p>
            <p className="text-2xl font-bold text-green-400">${totalPaid.toLocaleString()}</p>
          </Card>
          <Card className="p-6 bg-yellow-900 border-yellow-700">
            <DollarSign className="w-8 h-8 text-yellow-400 mb-2" />
            <p className="text-yellow-200 text-sm mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">${totalPending.toLocaleString()}</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Subscriptions */}
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Car className="w-6 h-6 text-blue-400" />
              Subscriptions ({subscriptions?.length || 0})
            </h2>
            {!subscriptions || subscriptions.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No subscriptions</p>
            ) : (
              <div className="space-y-4">
                {subscriptions.map((sub) => {
                  const vehicle = vehicles?.find(v => v?.id === sub?.vehicle_id);
                  return (
                    <Card
                      key={sub?.id}
                      className="p-4 bg-gray-700 border-gray-600 cursor-pointer hover:bg-gray-600"
                      onClick={() => navigate(createPageUrl("SubscriptionProfile") + `?id=${sub?.id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-white">
                          {vehicle ? `${vehicle?.year || ''} ${vehicle?.make || ''} ${vehicle?.model || ''}` : 'Vehicle N/A'}
                        </h3>
                        <Badge className={
                          sub?.status === 'active' ? 'bg-green-600' :
                          sub?.status === 'pending' ? 'bg-yellow-600' : 'bg-red-600'
                        }>
                          {sub?.status || 'unknown'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-400">Tier</p>
                          <p className="text-white">{sub?.subscription_tier || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Total Paid</p>
                          <p className="text-white">${sub?.total_paid?.toLocaleString() || '0'}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Payments */}
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-400" />
              Payment History ({payments?.length || 0})
            </h2>
            {!payments || payments.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No payments</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {payments.map((payment) => (
                  <Card
                    key={payment?.id}
                    className="p-3 bg-gray-700 border-gray-600 cursor-pointer hover:bg-gray-600"
                    onClick={() => navigate(createPageUrl("PaymentDetail") + `?id=${payment?.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold">${payment?.amount?.toLocaleString() || '0'}</p>
                        <p className="text-xs text-gray-400">{payment?.payment_type || 'N/A'}</p>
                      </div>
                      <Badge className={
                        payment?.status === 'completed' ? 'bg-green-600' :
                        payment?.status === 'pending' ? 'bg-yellow-600' : 'bg-red-600'
                      }>
                        {payment?.status || 'unknown'}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>

          {/* Documents */}
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-400" />
              Documents ({documents?.length || 0})
            </h2>
            {!documents || documents.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No documents</p>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <Card key={doc?.id} className="p-3 bg-gray-700 border-gray-600">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge className="mb-2">{doc?.document_type || 'Unknown'}</Badge>
                        <p className="text-xs text-gray-400">
                          {doc?.created_date ? new Date(doc.created_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => window.open(doc?.document_url, '_blank')}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={!doc?.document_url}
                      >
                        View
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>

          {/* Activity Log */}
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-green-400" />
              Recent Activity
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activityLogs && activityLogs.length > 0 ? (
                activityLogs.map((log) => (
                  <div key={log?.id} className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <Badge className="text-xs">{log?.action_type || 'Unknown'}</Badge>
                      <span className="text-xs text-gray-500">
                        {log?.created_date ? new Date(log.created_date).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{log?.action_details || 'No details'}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No activity logged</p>
              )}
            </div>
          </Card>
        </div>

        <SuperAdminQuickActions />
      </div>
    </div>
  );
}
