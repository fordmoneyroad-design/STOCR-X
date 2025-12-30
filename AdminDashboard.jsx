import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Car,
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Plus
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import VehicleManagement from "../components/admin/VehicleManagement";
import SubscriptionManagement from "../components/admin/SubscriptionManagement";
import PaymentManagement from "../components/admin/PaymentManagement";
import ClaimManagement from "../components/admin/ClaimManagement";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
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

  const { data: vehicles } = useQuery({
    queryKey: ['admin-vehicles'],
    queryFn: () => base44.entities.Vehicle.list("-created_date"),
    initialData: []
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: () => base44.entities.Subscription.list("-created_date"),
    initialData: []
  });

  const { data: payments } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: () => base44.entities.Payment.list("-created_date"),
    initialData: []
  });

  const { data: claims } = useQuery({
    queryKey: ['admin-claims'],
    queryFn: () => base44.entities.Claim.list("-created_date"),
    initialData: []
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate stats
  const totalRevenue = payments?.reduce((sum, p) => sum + (p.status === 'completed' ? p.amount : 0), 0) || 0;
  const activeSubscriptions = subscriptions?.filter(s => s.status === 'active').length || 0;
  const pendingVerifications = subscriptions?.filter(s => !s.kyc_verified).length || 0;
  const availableVehicles = vehicles?.filter(v => v.status === 'available').length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">Manage STOCRX operations and monitor performance</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="claims">Claims</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 border-none shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
              </Card>

              <Card className="p-6 border-none shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Active Subscriptions</p>
                <p className="text-3xl font-bold text-gray-900">{activeSubscriptions}</p>
              </Card>

              <Card className="p-6 border-none shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Car className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Available Vehicles</p>
                <p className="text-3xl font-bold text-gray-900">{availableVehicles}</p>
              </Card>

              <Card className="p-6 border-none shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-1">Pending Verifications</p>
                <p className="text-3xl font-bold text-gray-900">{pendingVerifications}</p>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Subscriptions */}
              <Card className="p-6 border-none shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Subscriptions</h3>
                <div className="space-y-3">
                  {subscriptions?.slice(0, 5).map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{sub.customer_email}</p>
                        <p className="text-sm text-gray-500">
                          {sub.created_date && new Date(sub.created_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={
                        sub.status === 'active' ? 'bg-green-500' :
                        sub.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                      }>
                        {sub.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Payments */}
              <Card className="p-6 border-none shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Payments</h3>
                <div className="space-y-3">
                  {payments?.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold capitalize">{payment.payment_type.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-500">
                          {payment.created_date && new Date(payment.created_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${payment.amount?.toLocaleString()}</p>
                        <Badge className={payment.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Vehicles Tab */}
          <TabsContent value="vehicles">
            <VehicleManagement vehicles={vehicles} />
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <SubscriptionManagement subscriptions={subscriptions} vehicles={vehicles} />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <PaymentManagement payments={payments} subscriptions={subscriptions} />
          </TabsContent>

          {/* Claims Tab */}
          <TabsContent value="claims">
            <ClaimManagement claims={claims} subscriptions={subscriptions} vehicles={vehicles} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}