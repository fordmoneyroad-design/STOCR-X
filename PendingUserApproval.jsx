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
  ArrowLeft, CheckCircle, XCircle, User, Mail, Phone, MapPin,
  Shield, Truck, DollarSign, FileText, Calendar, Award
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function PendingUserApproval() {
  const [user, setUser] = useState(null);
  const [pendingUserId, setPendingUserId] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");
  const [approvedTier, setApprovedTier] = useState("");
  const navigate = useNavigate();
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

        // Get ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        if (id) setPendingUserId(id);
      } catch (err) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  const { data: pendingUser } = useQuery({
    queryKey: ['pending-user', pendingUserId],
    queryFn: async () => {
      const users = await base44.entities.PendingUser.filter({ id: pendingUserId });
      if (users.length > 0) {
        setApprovedTier(users[0].subscription_tier);
        return users[0];
      }
      return null;
    },
    enabled: !!pendingUserId
  });

  const { data: shippingQuotes } = useQuery({
    queryKey: ['user-shipping-quotes', pendingUserId],
    queryFn: () => base44.entities.ShippingQuote.filter({ pending_user_id: pendingUserId }),
    enabled: !!pendingUserId,
    initialData: []
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      if (!pendingUser?.id || !user?.email) {
        throw new Error("Missing required data");
      }

      // Update pending user
      await base44.entities.PendingUser.update(pendingUserId, {
        status: 'approved',
        approved_tier: approvedTier,
        approval_notes: approvalNotes,
        reviewed_by: user.email,
        review_date: new Date().toISOString()
      });

      // Send approval email
      const userName = pendingUser.full_name || 'there';
      const userEmail = pendingUser.email;
      
      await base44.integrations.Core.SendEmail({
        to: userEmail,
        subject: '🎉 Your STOCRX Account Has Been Approved!',
        body: `Hi ${userName},\n\nGreat news! Your ${approvedTier} tier account has been approved.\n\nYou can now log in and start browsing vehicles.\n\n${approvalNotes ? `Admin Notes: ${approvalNotes}\n\n` : ''}Welcome to STOCRX!\n\n- The STOCRX Team`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-users']);
      alert("✅ User approved and notified!");
      navigate(createPageUrl("PendingUsers"));
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (reason) => {
      if (!pendingUser?.id || !user?.email) {
        throw new Error("Missing required data");
      }

      await base44.entities.PendingUser.update(pendingUserId, {
        status: 'rejected',
        rejection_reason: reason,
        reviewed_by: user.email,
        review_date: new Date().toISOString()
      });

      // Send rejection email
      const userName = pendingUser.full_name || 'there';
      const userEmail = pendingUser.email;

      await base44.integrations.Core.SendEmail({
        to: userEmail,
        subject: 'STOCRX Application Update',
        body: `Hi ${userName},\n\nThank you for your interest in STOCRX.\n\nUnfortunately, we are unable to approve your application at this time.\n\nReason: ${reason}\n\nIf you have questions, please contact support.\n\n- The STOCRX Team`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-users']);
      alert("❌ User rejected and notified");
      navigate(createPageUrl("PendingUsers"));
    }
  });

  if (!user || !pendingUser) {
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
          onClick={() => navigate(createPageUrl("PendingUsers"))}
          className="text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pending Users
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Review User Application
          </h1>
          <p className="text-gray-400">Approve or reject pending user request</p>
        </div>

        {/* User Info */}
        <Card className="p-8 bg-gray-800 border-gray-700 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">User Information</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-gray-400 text-sm">Full Name</p>
                <p className="text-white font-semibold">{pendingUser.full_name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-gray-400 text-sm">Email</p>
                <p className="text-white font-semibold">{pendingUser.email || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-gray-400 text-sm">Phone</p>
                <p className="text-white font-semibold">{pendingUser.phone || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-gray-400 text-sm">Location</p>
                <p className="text-white font-semibold">
                  {pendingUser.city || 'N/A'}, {pendingUser.state || 'N/A'} {pendingUser.zip_code || ''}
                </p>
              </div>
            </div>
          </div>

          {pendingUser.user_notes && (
            <Alert className="mt-6 bg-blue-900/30 border-blue-700">
              <AlertDescription className="text-blue-200">
                <strong>User Notes:</strong> {pendingUser.user_notes}
              </AlertDescription>
            </Alert>
          )}
        </Card>

        {/* Shipping Quotes */}
        {shippingQuotes.length > 0 && (
          <Card className="p-8 bg-gray-800 border-gray-700 mb-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Truck className="w-6 h-6 text-orange-400" />
              Shipping Quotes
            </h2>
            <div className="space-y-4">
              {shippingQuotes.map((quote) => (
                <div key={quote.id} className="bg-orange-900/30 border border-orange-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold text-2xl mb-1">
                        ${quote.quote_amount?.toFixed(2) || '0.00'}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {quote.distance_miles?.toFixed(0) || '0'} miles • {quote.carrier_type || 'N/A'} • {quote.delivery_timeframe || 'TBD'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Source: {quote.quote_source || 'N/A'} • Valid until: {quote.valid_until || 'N/A'}
                      </p>
                    </div>
                    <Badge className={
                      quote.status === 'accepted' ? 'bg-green-600' :
                      quote.status === 'sent_to_customer' ? 'bg-blue-600' :
                      'bg-gray-600'
                    }>
                      {quote.status || 'draft'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Approval Section */}
        <Card className="p-8 bg-gray-800 border-gray-700 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Approval Decision</h2>
          
          <div className="space-y-6">
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Approved Tier</label>
              <select
                value={approvedTier}
                onChange={(e) => setApprovedTier(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-700 border-gray-600 text-white"
              >
                <option value="free">Free</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="military">Military VIP</option>
                <option value="travelers">Travelers</option>
                <option value="high_end">High End</option>
                <option value="lifetime">Lifetime</option>
              </select>
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-2 block">Approval Notes (Optional)</label>
              <Textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Add any notes for the user..."
                className="bg-gray-700 border-gray-600 text-white h-24"
              />
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={() => approveMutation.mutate()}
            disabled={approveMutation.isLoading}
            className="flex-1 h-14 bg-green-600 hover:bg-green-700 text-lg font-bold"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Approve User
          </Button>
          <Button
            onClick={() => {
              const reason = prompt("Enter rejection reason:");
              if (reason) rejectMutation.mutate(reason);
            }}
            disabled={rejectMutation.isLoading}
            className="flex-1 h-14 bg-red-600 hover:bg-red-700 text-lg font-bold"
          >
            <XCircle className="w-5 h-5 mr-2" />
            Reject Application
          </Button>
        </div>
      </div>
    </div>
  );
}