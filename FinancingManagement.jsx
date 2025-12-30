import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Plus, X, ExternalLink, CheckCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

const FINANCING_PROVIDERS = {
  snap_loans: {
    name: "Snap Loans",
    description: "Fast approval rent-to-own loans",
    link: "https://www.snaploans.com"
  },
  koalafi: {
    name: "Koalafi",
    description: "Flexible financing solutions",
    link: "https://www.koalafi.com"
  },
  release_90: {
    name: "ReLease 90",
    description: "90-day lease purchase options",
    link: "https://www.release90.com"
  }
};

export default function FinancingManagement() {
  const [user, setUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [approvedAmount, setApprovedAmount] = useState("");
  const [loanTermMonths, setLoanTermMonths] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
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

  const { data: financingOptions } = useQuery({
    queryKey: ['financing-options'],
    queryFn: () => base44.entities.FinancingOption.list("-created_date"),
    initialData: []
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['subscriptions-all'],
    queryFn: () => base44.entities.Subscription.list("-created_date"),
    initialData: []
  });

  const createFinancingMutation = useMutation({
    mutationFn: (data) => base44.entities.FinancingOption.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['financing-options']);
      setShowAddForm(false);
      resetForm();
    }
  });

  const updateFinancingMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.FinancingOption.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['financing-options'])
  });

  const deleteFinancingMutation = useMutation({
    mutationFn: (id) => base44.entities.FinancingOption.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['financing-options'])
  });

  const resetForm = () => {
    setSelectedProvider("");
    setCustomerEmail("");
    setApprovedAmount("");
    setLoanTermMonths("");
    setPaymentLink("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const subscription = subscriptions.find(s => s.customer_email === customerEmail);
    const monthlyPayment = parseFloat(approvedAmount) / parseInt(loanTermMonths);

    await createFinancingMutation.mutateAsync({
      provider_name: selectedProvider,
      customer_email: customerEmail,
      subscription_id: subscription?.id || null,
      application_status: "approved",
      approved_amount: parseFloat(approvedAmount),
      loan_term_months: parseInt(loanTermMonths),
      monthly_payment: monthlyPayment,
      interest_rate: 0,
      payment_link: paymentLink,
      application_date: new Date().toISOString().split('T')[0],
      approval_date: new Date().toISOString().split('T')[0]
    });
  };

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <DollarSign className="w-10 h-10 text-green-400" />
              Buy Now Pay Later Management
            </h1>
            <p className="text-gray-400">Manage financing options for customers</p>
          </div>
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Financing Option
          </Button>
        </div>

        {/* Provider Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {Object.entries(FINANCING_PROVIDERS).map(([key, provider]) => (
            <Card key={key} className="p-6 bg-gray-800 border-gray-700">
              <h3 className="text-xl font-bold text-white mb-2">{provider.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{provider.description}</p>
              <Button
                variant="outline"
                className="w-full border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                onClick={() => window.open(provider.link, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Website
              </Button>
            </Card>
          ))}
        </div>

        {/* Add Form */}
        {showAddForm && (
          <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Add Financing Option</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-300 mb-2 block">Provider *</Label>
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    required
                    className="w-full p-3 rounded-lg bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="">Select Provider...</option>
                    <option value="snap_loans">Snap Loans</option>
                    <option value="koalafi">Koalafi</option>
                    <option value="release_90">ReLease 90</option>
                  </select>
                </div>

                <div>
                  <Label className="text-gray-300 mb-2 block">Customer Email *</Label>
                  <Input
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="customer@example.com"
                  />
                </div>

                <div>
                  <Label className="text-gray-300 mb-2 block">Approved Amount *</Label>
                  <Input
                    type="number"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value)}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="5000"
                  />
                </div>

                <div>
                  <Label className="text-gray-300 mb-2 block">Loan Term (months) *</Label>
                  <Input
                    type="number"
                    value={loanTermMonths}
                    onChange={(e) => setLoanTermMonths(e.target.value)}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="12"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-gray-300 mb-2 block">Payment Portal Link</Label>
                  <Input
                    value={paymentLink}
                    onChange={(e) => setPaymentLink(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="https://payment-portal.com/customer"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="flex-1 border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Add Financing Option
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Financing Options Table */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Active Financing Options</h2>
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Provider</TableHead>
                <TableHead className="text-gray-300">Customer</TableHead>
                <TableHead className="text-gray-300">Approved Amount</TableHead>
                <TableHead className="text-gray-300">Monthly Payment</TableHead>
                <TableHead className="text-gray-300">Term</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {financingOptions.map((option) => (
                <TableRow key={option.id} className="border-gray-700">
                  <TableCell className="text-white capitalize">
                    {FINANCING_PROVIDERS[option.provider_name]?.name || option.provider_name}
                  </TableCell>
                  <TableCell className="text-gray-300">{option.customer_email}</TableCell>
                  <TableCell className="text-green-400 font-bold">
                    ${option.approved_amount?.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-white">
                    ${option.monthly_payment?.toLocaleString()}/mo
                  </TableCell>
                  <TableCell className="text-gray-300">{option.loan_term_months} months</TableCell>
                  <TableCell>
                    <Badge className={
                      option.application_status === 'approved' || option.application_status === 'active' 
                        ? 'bg-green-600' 
                        : 'bg-yellow-600'
                    }>
                      {option.application_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {option.payment_link && (
                        <Button
                          size="sm"
                          onClick={() => window.open(option.payment_link, '_blank')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          if (confirm('Remove this financing option?')) {
                            deleteFinancingMutation.mutate(option.id);
                          }
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}