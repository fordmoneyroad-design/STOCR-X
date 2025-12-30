
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft, DollarSign, Plus, Gift, AlertTriangle, CheckCircle,
  Clock, XCircle, Search
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SuperAdminQuickActions from "../components/admin/SuperAdminQuickActions";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function StoreCreditManagement() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [creditData, setCreditData] = useState({
    customer_email: "",
    amount: "",
    reason: "service_recovery",
    expiration_date: "",
    notes: ""
  });

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

  const { data: allCredits } = useQuery({
    queryKey: ['all-credits'],
    queryFn: () => base44.entities.StoreCredit.list("-created_date", 100),
    initialData: []
  });

  const { data: customers } = useQuery({
    queryKey: ['all-customers'],
    queryFn: () => base44.entities.User.list(),
    initialData: []
  });

  const issueCreditMutation = useMutation({ // Corrected typo here: issueC reditMutation -> issueCreditMutation
    mutationFn: async () => {
      const expirationDate = creditData.expiration_date || 
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 1 year default

      return await base44.entities.StoreCredit.create({
        customer_email: creditData.customer_email,
        amount: parseFloat(creditData.amount),
        balance: parseFloat(creditData.amount),
        original_amount: parseFloat(creditData.amount),
        reason: creditData.reason,
        expiration_date: expirationDate,
        status: 'active',
        issued_by: user.email,
        notes: creditData.notes,
        usage_history: []
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-credits']);
      alert("✅ Store credit issued!");
      setShowForm(false);
      setCreditData({
        customer_email: "",
        amount: "",
        reason: "service_recovery",
        expiration_date: "",
        notes: ""
      });
    }
  });

  const expireCreditMutation = useMutation({
    mutationFn: async (creditId) => {
      return await base44.entities.StoreCredit.update(creditId, {
        status: 'expired'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-credits']);
      alert("✅ Credit expired!");
    }
  });

  const cancelCreditMutation = useMutation({
    mutationFn: async (creditId) => {
      return await base44.entities.StoreCredit.update(creditId, {
        status: 'cancelled',
        balance: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-credits']);
      alert("✅ Credit cancelled!");
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const activeCredits = allCredits.filter(c => c.status === 'active' || c.status === 'partially_used');
  const totalActiveValue = activeCredits.reduce((sum, c) => sum + (c.balance || 0), 0);
  const totalIssued = allCredits.reduce((sum, c) => sum + (c.original_amount || 0), 0);

  const filteredCredits = searchEmail
    ? allCredits.filter(c => c.customer_email.toLowerCase().includes(searchEmail.toLowerCase()))
    : allCredits;

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

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <DollarSign className="w-10 h-10 text-green-400" />
              Store Credit Management
            </h1>
            <p className="text-gray-400">Issue, track, and manage customer store credits</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Issue New Credit
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-green-900 border-green-700">
            <Gift className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-green-200 text-sm mb-1">Active Credits</p>
            <p className="text-4xl font-bold text-green-400">{activeCredits.length}</p>
          </Card>
          <Card className="p-6 bg-blue-900 border-blue-700">
            <DollarSign className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-blue-200 text-sm mb-1">Active Value</p>
            <p className="text-4xl font-bold text-blue-400">${totalActiveValue.toLocaleString()}</p>
          </Card>
          <Card className="p-6 bg-purple-900 border-purple-700">
            <CheckCircle className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-purple-200 text-sm mb-1">Total Issued</p>
            <p className="text-4xl font-bold text-purple-400">${totalIssued.toLocaleString()}</p>
          </Card>
          <Card className="p-6 bg-orange-900 border-orange-700">
            <Clock className="w-8 h-8 text-orange-400 mb-2" />
            <p className="text-orange-200 text-sm mb-1">Total Credits</p>
            <p className="text-4xl font-bold text-orange-400">{allCredits.length}</p>
          </Card>
        </div>

        {/* Issue Credit Form */}
        {showForm && (
          <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Issue Store Credit</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              issueCreditMutation.mutate();
            }} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Customer Email *</label>
                  <Input
                    value={creditData.customer_email}
                    onChange={(e) => setCreditData({...creditData, customer_email: e.target.value})}
                    required
                    placeholder="customer@email.com"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Amount *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={creditData.amount}
                    onChange={(e) => setCreditData({...creditData, amount: e.target.value})}
                    required
                    placeholder="100.00"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Reason *</label>
                  <select
                    value={creditData.reason}
                    onChange={(e) => setCreditData({...creditData, reason: e.target.value})}
                    className="w-full p-3 rounded-lg bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="return_refund">Return Refund</option>
                    <option value="cancellation">Cancellation</option>
                    <option value="service_recovery">Service Recovery</option>
                    <option value="promotional">Promotional</option>
                    <option value="goodwill">Goodwill</option>
                    <option value="admin_adjustment">Admin Adjustment</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Expiration Date (Optional)</label>
                  <Input
                    type="date"
                    value={creditData.expiration_date}
                    onChange={(e) => setCreditData({...creditData, expiration_date: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Defaults to 1 year if not set</p>
                </div>
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Notes</label>
                <Textarea
                  value={creditData.notes}
                  onChange={(e) => setCreditData({...creditData, notes: e.target.value})}
                  placeholder="Optional notes about this credit..."
                  className="bg-gray-700 border-gray-600 text-white h-24"
                />
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={issueCreditMutation.isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {issueCreditMutation.isLoading ? "Issuing..." : "Issue Store Credit"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Search */}
        <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by customer email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="pl-10 bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </Card>

        {/* Credits List */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">All Store Credits ({filteredCredits.length})</h2>

          {filteredCredits.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No store credits found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Customer</TableHead>
                    <TableHead className="text-gray-300">Amount</TableHead>
                    <TableHead className="text-gray-300">Balance</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Reason</TableHead>
                    <TableHead className="text-gray-300">Issued</TableHead>
                    <TableHead className="text-gray-300">Expires</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCredits.map((credit) => (
                    <TableRow key={credit.id} className="border-gray-700">
                      <TableCell className="text-white">
                        {credit.customer_email}
                      </TableCell>
                      <TableCell className="text-green-400 font-bold">
                        ${credit.original_amount?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-white font-bold">
                        ${credit.balance?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          credit.status === 'active' ? 'bg-green-600' :
                          credit.status === 'partially_used' ? 'bg-blue-600' :
                          credit.status === 'fully_used' ? 'bg-gray-600' :
                          credit.status === 'expired' ? 'bg-yellow-600' : 'bg-red-600'
                        }>
                          {credit.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300 text-sm">
                        {credit.reason?.replace('_', ' ')}
                      </TableCell>
                      <TableCell className="text-gray-400 text-sm">
                        {credit.created_date && new Date(credit.created_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-gray-400 text-sm">
                        {credit.expiration_date && new Date(credit.expiration_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {(credit.status === 'active' || credit.status === 'partially_used') && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => expireCreditMutation.mutate(credit.id)}
                                disabled={expireCreditMutation.isLoading}
                                className="bg-yellow-600 hover:bg-yellow-700"
                              >
                                <Clock className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  if (confirm("Cancel this credit? This cannot be undone.")) {
                                    cancelCreditMutation.mutate(credit.id);
                                  }
                                }}
                                disabled={cancelCreditMutation.isLoading}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        <SuperAdminQuickActions />
      </div>
    </div>
  );
}
