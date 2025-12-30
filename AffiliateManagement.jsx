import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Users, TrendingUp, DollarSign, CheckCircle, X, 
  ArrowLeft, Eye, Clock, AlertTriangle, UserPlus
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

export default function AffiliateManagement() {
  const [user, setUser] = useState(null);
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
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

  const { data: pendingAffiliates } = useQuery({
    queryKey: ['pending-affiliates'],
    queryFn: () => base44.entities.AffiliateProgram.filter({ status: "pending_approval" }),
    initialData: []
  });

  const { data: activeAffiliates } = useQuery({
    queryKey: ['active-affiliates'],
    queryFn: () => base44.entities.AffiliateProgram.filter({ status: "active" }),
    initialData: []
  });

  const { data: payrollRequests } = useQuery({
    queryKey: ['affiliate-payroll-requests'],
    queryFn: () => base44.entities.PayrollRequest.filter({ 
      entity_type: "AffiliateProgram",
      status: "pending"
    }),
    initialData: []
  });

  const approveMutation = useMutation({
    mutationFn: async (affiliate) => {
      // Approve affiliate
      await base44.entities.AffiliateProgram.update(affiliate.id, {
        status: "active",
        approved_by: user.email,
        approval_date: new Date().toISOString().split('T')[0],
        start_date: new Date().toISOString().split('T')[0],
        on_payroll: true
      });

      // Approve payroll request
      const relatedRequest = payrollRequests.find(r => r.related_entity_id === affiliate.id);
      if (relatedRequest) {
        await base44.entities.PayrollRequest.update(relatedRequest.id, {
          status: "approved",
          reviewed_by: user.email,
          review_date: new Date().toISOString(),
          review_notes: reviewNotes
        });
      }

      // Send approval email
      await base44.integrations.Core.SendEmail({
        to: affiliate.affiliate_email,
        subject: "🎉 STOCRX Affiliate Application APPROVED!",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">🎉 Congratulations!</h1>
            </div>
            <div style="padding: 30px; background: white;">
              <p>Dear ${affiliate.affiliate_name},</p>
              
              <p>Great news! Your STOCRX Affiliate application has been <strong>APPROVED</strong>!</p>
              
              <h3>Your Affiliate Details:</h3>
              <ul>
                <li><strong>Program:</strong> ${affiliate.program_type.replace('_', ' ').toUpperCase()}</li>
                <li><strong>Referral Code:</strong> ${affiliate.referral_code}</li>
                <li><strong>Commission Rate:</strong> ${affiliate.commission_rate}%</li>
                <li><strong>Status:</strong> ACTIVE - On Payroll</li>
              </ul>

              <div style="background: #dcfce7; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;">
                <h3 style="color: #065f46; margin-top: 0;">💰 Start Earning Now!</h3>
                <ul style="color: #047857;">
                  <li>Share your referral code: <strong>${affiliate.referral_code}</strong></li>
                  <li>Earn ${affiliate.commission_rate}% on every referral</li>
                  <li>Monthly payouts via ${affiliate.payment_method}</li>
                  <li>Access your dashboard to track earnings</li>
                </ul>
              </div>

              <h3>Next Steps:</h3>
              <ol>
                <li>Share your referral code with your network</li>
                <li>Track your referrals in your dashboard</li>
                <li>Get paid monthly for successful referrals</li>
                <li>Reach out if you have any questions</li>
              </ol>

              <p>Welcome to the STOCRX Affiliate family!</p>

              <p>Best regards,<br/>STOCRX Affiliate Team</p>
            </div>
          </div>
        `
      });

      // Log activity
      await base44.entities.ActivityLog.create({
        user_email: user.email,
        action_type: "approve_affiliate",
        action_details: `Approved affiliate: ${affiliate.affiliate_name} (${affiliate.program_type})`,
        related_entity_id: affiliate.id,
        entity_type: "AffiliateProgram"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-affiliates']);
      queryClient.invalidateQueries(['active-affiliates']);
      queryClient.invalidateQueries(['affiliate-payroll-requests']);
      setSelectedAffiliate(null);
      setReviewNotes("");
      alert("✅ Affiliate approved and added to payroll!");
    }
  });

  const denyMutation = useMutation({
    mutationFn: async (affiliate) => {
      await base44.entities.AffiliateProgram.update(affiliate.id, {
        status: "terminated",
        notes: reviewNotes
      });

      const relatedRequest = payrollRequests.find(r => r.related_entity_id === affiliate.id);
      if (relatedRequest) {
        await base44.entities.PayrollRequest.update(relatedRequest.id, {
          status: "denied",
          reviewed_by: user.email,
          review_date: new Date().toISOString(),
          review_notes: reviewNotes
        });
      }

      await base44.integrations.Core.SendEmail({
        to: affiliate.affiliate_email,
        subject: "STOCRX Affiliate Application Update",
        body: `
          Dear ${affiliate.affiliate_name},

          Thank you for your interest in the STOCRX Affiliate Program.

          After careful review, we're unable to approve your application at this time.

          ${reviewNotes ? `Reason: ${reviewNotes}` : ''}

          You're welcome to reapply in the future.

          Best regards,
          STOCRX Team
        `
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-affiliates']);
      queryClient.invalidateQueries(['affiliate-payroll-requests']);
      setSelectedAffiliate(null);
      setReviewNotes("");
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalEarnings = activeAffiliates.reduce((sum, a) => sum + (a.total_earnings || 0), 0);
  const totalReferrals = activeAffiliates.reduce((sum, a) => sum + (a.total_referrals || 0), 0);

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
            <Users className="w-10 h-10 text-purple-400" />
            Affiliate Management
          </h1>
          <p className="text-gray-400">Manage affiliate applications and payroll requests</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-yellow-900 border-yellow-700">
            <Clock className="w-8 h-8 text-yellow-400 mb-2" />
            <p className="text-yellow-200 text-sm mb-1">Pending Approval</p>
            <p className="text-3xl font-bold text-yellow-400">{pendingAffiliates.length}</p>
          </Card>
          <Card className="p-6 bg-green-900 border-green-700">
            <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-green-200 text-sm mb-1">Active Affiliates</p>
            <p className="text-3xl font-bold text-green-400">{activeAffiliates.length}</p>
          </Card>
          <Card className="p-6 bg-blue-900 border-blue-700">
            <TrendingUp className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-blue-200 text-sm mb-1">Total Referrals</p>
            <p className="text-3xl font-bold text-blue-400">{totalReferrals}</p>
          </Card>
          <Card className="p-6 bg-purple-900 border-purple-700">
            <DollarSign className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-purple-200 text-sm mb-1">Total Earnings</p>
            <p className="text-3xl font-bold text-purple-400">${totalEarnings.toLocaleString()}</p>
          </Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="pending">Pending ({pendingAffiliates.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeAffiliates.length})</TabsTrigger>
            <TabsTrigger value="payroll">Payroll Requests ({payrollRequests.length})</TabsTrigger>
          </TabsList>

          {/* Pending Tab */}
          <TabsContent value="pending">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Pending Affiliate Applications</h2>
              
              {pendingAffiliates.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">No pending applications</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-300">Program</TableHead>
                      <TableHead className="text-gray-300">Applied</TableHead>
                      <TableHead className="text-gray-300">Commission</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingAffiliates.map((affiliate) => (
                      <TableRow key={affiliate.id} className="border-gray-700">
                        <TableCell className="text-white">
                          <p className="font-semibold">{affiliate.affiliate_name}</p>
                          <p className="text-sm text-gray-400">{affiliate.affiliate_email}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-purple-600">
                            {affiliate.program_type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">
                          {affiliate.created_date && new Date(affiliate.created_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-green-400 font-semibold">
                          {affiliate.commission_rate}%
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => setSelectedAffiliate(affiliate)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Review
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Review Modal */}
              {selectedAffiliate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <Card className="max-w-2xl w-full p-8 bg-gray-800 border-gray-700 max-h-[90vh] overflow-y-auto">
                    <h2 className="text-2xl font-bold text-white mb-6">Review Application</h2>
                    
                    <div className="space-y-4 mb-6">
                      <div>
                        <p className="text-gray-400 text-sm">Name</p>
                        <p className="text-white font-semibold text-lg">{selectedAffiliate.affiliate_name}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Email</p>
                        <p className="text-white">{selectedAffiliate.affiliate_email}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Phone</p>
                        <p className="text-white">{selectedAffiliate.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Program Type</p>
                        <Badge className="bg-purple-600">
                          {selectedAffiliate.program_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Why Join</p>
                        <p className="text-white bg-gray-700 p-3 rounded">{selectedAffiliate.why_join}</p>
                      </div>
                      {selectedAffiliate.experience && (
                        <div>
                          <p className="text-gray-400 text-sm">Experience</p>
                          <p className="text-white bg-gray-700 p-3 rounded">{selectedAffiliate.experience}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-400 text-sm">Commission Rate</p>
                        <p className="text-green-400 font-bold text-xl">{selectedAffiliate.commission_rate}%</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="text-gray-300 text-sm mb-2 block">Review Notes</label>
                      <Textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add notes about your decision..."
                        className="bg-gray-700 border-gray-600 text-white h-24"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        onClick={() => approveMutation.mutate(selectedAffiliate)}
                        disabled={approveMutation.isLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve & Add to Payroll
                      </Button>
                      <Button
                        onClick={() => {
                          if (confirm('Deny this application?')) {
                            denyMutation.mutate(selectedAffiliate);
                          }
                        }}
                        disabled={denyMutation.isLoading}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Deny
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedAffiliate(null);
                          setReviewNotes("");
                        }}
                        className="border-gray-600 text-gray-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Active Tab */}
          <TabsContent value="active">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Active Affiliates</h2>
              
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Name</TableHead>
                    <TableHead className="text-gray-300">Program</TableHead>
                    <TableHead className="text-gray-300">Referral Code</TableHead>
                    <TableHead className="text-gray-300">Referrals</TableHead>
                    <TableHead className="text-gray-300">Earnings</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeAffiliates.map((affiliate) => (
                    <TableRow key={affiliate.id} className="border-gray-700">
                      <TableCell className="text-white">
                        <p className="font-semibold">{affiliate.affiliate_name}</p>
                        <p className="text-sm text-gray-400">{affiliate.affiliate_email}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-purple-600">
                          {affiliate.program_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-blue-400 font-mono">{affiliate.referral_code}</TableCell>
                      <TableCell className="text-white">{affiliate.total_referrals || 0}</TableCell>
                      <TableCell className="text-green-400 font-semibold">
                        ${affiliate.total_earnings?.toLocaleString() || '0'}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-600">
                          {affiliate.on_payroll ? 'On Payroll' : 'Active'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Payroll Requests Tab */}
          <TabsContent value="payroll">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Payroll Requests</h2>
              
              {payrollRequests.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">No pending payroll requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payrollRequests.map((request) => (
                    <Card key={request.id} className="p-6 bg-gray-700 border-gray-600">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white">{request.employee_name}</h3>
                          <p className="text-gray-400">{request.employee_email}</p>
                        </div>
                        <Badge className="bg-yellow-600">Pending</Badge>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-gray-400 text-sm">Request Type</p>
                          <p className="text-white font-semibold">{request.request_type.replace('_', ' ')}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Department</p>
                          <p className="text-white">{request.department}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Priority</p>
                          <Badge className={
                            request.priority === 'urgent' ? 'bg-red-600' :
                            request.priority === 'high' ? 'bg-orange-600' : 'bg-blue-600'
                          }>
                            {request.priority}
                          </Badge>
                        </div>
                      </div>
                      {request.justification && (
                        <div className="mt-4">
                          <p className="text-gray-400 text-sm mb-1">Justification</p>
                          <p className="text-gray-300 bg-gray-800 p-3 rounded">{request.justification}</p>
                        </div>
                      )}
                    </Card>
                  ))}
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