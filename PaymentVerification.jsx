import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CreditCard, CheckCircle, Clock, AlertTriangle, Search, DollarSign } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PaymentVerification() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  const { data: allPayments } = useQuery({
    queryKey: ['user-all-payments', user?.email],
    queryFn: async () => {
      // Get user's subscriptions first
      const subs = await base44.entities.Subscription.filter({ customer_email: user.email });
      const allPayments = [];
      for (const sub of subs) {
        const payments = await base44.entities.Payment.filter({ subscription_id: sub.id });
        allPayments.push(...payments);
      }
      return allPayments;
    },
    enabled: !!user,
    initialData: []
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['user-subscriptions', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ customer_email: user.email }),
    enabled: !!user,
    initialData: []
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => base44.entities.Vehicle.list(),
    initialData: []
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pendingPayments = allPayments.filter(p => p.status === 'pending');
  const completedPayments = allPayments.filter(p => p.status === 'completed');
  const failedPayments = allPayments.filter(p => p.status === 'failed');

  const filteredPayments = allPayments.filter(payment => {
    const sub = subscriptions.find(s => s.id === payment.subscription_id);
    const vehicle = vehicles.find(v => v.id === sub?.vehicle_id);
    const searchLower = searchQuery.toLowerCase();
    return (
      payment.amount?.toString().includes(searchQuery) ||
      payment.payment_type?.toLowerCase().includes(searchLower) ||
      payment.transaction_id?.toLowerCase().includes(searchLower) ||
      vehicle?.make?.toLowerCase().includes(searchLower) ||
      vehicle?.model?.toLowerCase().includes(searchLower)
    );
  });

  const totalPaid = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPending = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <CreditCard className="w-10 h-10 text-green-400" />
            Payment Verification Center
          </h1>
          <p className="text-gray-400">Track all your payment statuses and history</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-green-900 border-green-700">
            <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-green-200 text-sm mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-400">${totalPaid.toLocaleString()}</p>
            <p className="text-xs text-green-300 mt-1">{completedPayments.length} payments</p>
          </Card>
          <Card className="p-6 bg-yellow-900 border-yellow-700">
            <Clock className="w-8 h-8 text-yellow-400 mb-2" />
            <p className="text-yellow-200 text-sm mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-400">${totalPending.toLocaleString()}</p>
            <p className="text-xs text-yellow-300 mt-1">{pendingPayments.length} payments</p>
          </Card>
          <Card className="p-6 bg-red-900 border-red-700">
            <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
            <p className="text-red-200 text-sm mb-1">Failed</p>
            <p className="text-3xl font-bold text-red-400">{failedPayments.length}</p>
            <p className="text-xs text-red-300 mt-1">payments</p>
          </Card>
          <Card className="p-6 bg-blue-900 border-blue-700">
            <DollarSign className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-blue-200 text-sm mb-1">Total Payments</p>
            <p className="text-3xl font-bold text-blue-400">{allPayments.length}</p>
            <p className="text-xs text-blue-300 mt-1">all time</p>
          </Card>
        </div>

        {/* Pending Payments Alert */}
        {pendingPayments.length > 0 && (
          <Alert className="mb-8 bg-yellow-900/30 border-yellow-700">
            <Clock className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-200">
              You have <strong>{pendingPayments.length}</strong> payment(s) pending verification. 
              Manual payments typically take 1-2 business days to process.
            </AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
          <div className="flex items-center gap-4">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by amount, type, vehicle, or transaction ID..."
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </Card>

        {/* Payment History */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Payment History</h2>
          
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">No payments found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Date</TableHead>
                  <TableHead className="text-gray-300">Amount</TableHead>
                  <TableHead className="text-gray-300">Type</TableHead>
                  <TableHead className="text-gray-300">Vehicle</TableHead>
                  <TableHead className="text-gray-300">Method</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Transaction ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => {
                  const sub = subscriptions.find(s => s.id === payment.subscription_id);
                  const vehicle = vehicles.find(v => v.id === sub?.vehicle_id);
                  return (
                    <TableRow key={payment.id} className="border-gray-700">
                      <TableCell className="text-gray-400 text-sm">
                        {payment.created_date && new Date(payment.created_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-white font-bold">
                        ${payment.amount?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-gray-300 capitalize">
                        {payment.payment_type?.replace('_', ' ')}
                      </TableCell>
                      <TableCell className="text-gray-300 text-sm">
                        {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-gray-300 capitalize">
                        {payment.payment_method || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          payment.status === 'completed' ? 'bg-green-600' :
                          payment.status === 'pending' ? 'bg-yellow-600' :
                          'bg-red-600'
                        }>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-400 text-xs font-mono">
                        {payment.transaction_id || 'N/A'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* Help Section */}
        <Card className="p-6 bg-blue-900/30 border-blue-700 mt-8">
          <h3 className="text-xl font-bold text-white mb-4">Need Help with Payments?</h3>
          <div className="space-y-2 text-blue-200">
            <p>💳 <strong>Pending Payments:</strong> Manual payments take 1-2 business days to verify</p>
            <p>✅ <strong>Completed Payments:</strong> Successfully processed and applied to your account</p>
            <p>❌ <strong>Failed Payments:</strong> Contact support to resolve payment issues</p>
            <p>📧 <strong>Questions?</strong> Email us at payments@stocrx.com</p>
          </div>
          <Button className="mt-4 bg-green-600 hover:bg-green-700">
            Contact Payment Support
          </Button>
        </Card>
      </div>
    </div>
  );
}