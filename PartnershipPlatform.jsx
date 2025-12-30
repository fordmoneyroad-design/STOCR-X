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
  ArrowLeft, Users, Shield, Key, Copy, CheckCircle, XCircle,
  Clock, AlertTriangle, RefreshCw, MessageCircle
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SuperAdminQuickActions from "../components/admin/SuperAdminQuickActions";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

const ROLE_PERMISSIONS = {
  viewer: {
    label: "Viewer",
    permissions: { view_vehicles: true, view_customers: true, view_reports: true }
  },
  support_agent: {
    label: "Support Agent",
    permissions: { view_vehicles: true, view_customers: true, manage_subscriptions: true }
  },
  fleet_manager: {
    label: "Fleet Manager",
    permissions: { view_vehicles: true, manage_vehicles: true, view_reports: true }
  },
  marketing_partner: {
    label: "Marketing Partner",
    permissions: { view_vehicles: true, view_reports: true }
  },
  finance_manager: {
    label: "Finance Manager",
    permissions: { view_payments: true, manage_payments: true, view_reports: true }
  },
  full_access: {
    label: "Full Access",
    permissions: {
      view_vehicles: true, manage_vehicles: true, view_customers: true,
      manage_subscriptions: true, view_payments: true, manage_payments: true,
      view_reports: true, manage_settings: true
    }
  }
};

export default function PartnershipPlatform() {
  const [user, setUser] = useState(null);
  const [newAccessCode, setNewAccessCode] = useState("");
  const [showCodeForm, setShowCodeForm] = useState(false);
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

  const { data: currentCode } = useQuery({
    queryKey: ['current-access-code'],
    queryFn: async () => {
      const codes = await base44.entities.PartnerAccessCode.filter({ is_active: true });
      if (codes.length > 0) return codes[0];
      
      // Create default code if none exists
      return await base44.entities.PartnerAccessCode.create({
        code: "8877",
        is_active: true,
        created_by: user?.email || "system"
      });
    },
    enabled: !!user
  });

  const { data: allRequests } = useQuery({
    queryKey: ['partner-requests'],
    queryFn: () => base44.entities.PartnerCollaborator.list("-created_date", 100),
    initialData: []
  });

  const updateCodeMutation = useMutation({
    mutationFn: async () => {
      if (!newAccessCode || newAccessCode.length !== 4) {
        throw new Error("Access code must be 4 digits!");
      }

      // Deactivate old code
      if (currentCode?.id) {
        await base44.entities.PartnerAccessCode.update(currentCode.id, {
          is_active: false,
          replaced_by_code: newAccessCode
        });
      }

      // Create new code
      return await base44.entities.PartnerAccessCode.create({
        code: newAccessCode,
        is_active: true,
        created_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['current-access-code']);
      setNewAccessCode("");
      setShowCodeForm(false);
      alert("✅ Access code updated!");
    },
    onError: (error) => {
      alert(`❌ ${error.message}`);
    }
  });

  const acceptRequestMutation = useMutation({
    mutationFn: async ({ requestId, role, notes }) => {
      const permissions = ROLE_PERMISSIONS[role]?.permissions || {};
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 90); // 90 days from now

      return await base44.entities.PartnerCollaborator.update(requestId, {
        status: 'accepted',
        assigned_role: role,
        permissions: permissions,
        reviewed_by: user.email,
        review_notes: notes,
        approved_date: new Date().toISOString(),
        access_expires_at: expiresAt.toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['partner-requests']);
      alert("✅ Collaborator request accepted!");
    }
  });

  const rejectRequestMutation = useMutation({
    mutationFn: async ({ requestId, notes }) => {
      return await base44.entities.PartnerCollaborator.update(requestId, {
        status: 'rejected',
        reviewed_by: user.email,
        review_notes: notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['partner-requests']);
      alert("✅ Request rejected");
    }
  });

  const removeCollaboratorMutation = useMutation({
    mutationFn: async (requestId) => {
      return await base44.entities.PartnerCollaborator.delete(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['partner-requests']);
      alert("✅ Collaborator removed");
    }
  });

  const handleCopyCode = () => {
    if (currentCode?.code) {
      navigator.clipboard.writeText(currentCode.code);
      alert("✅ Access code copied to clipboard!");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pendingRequests = allRequests.filter(r => r.status === 'pending');
  const acceptedRequests = allRequests.filter(r => r.status === 'accepted');
  const rejectedRequests = allRequests.filter(r => r.status === 'rejected');

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
            <Users className="w-10 h-10 text-blue-400" />
            Partnership Platform
          </h1>
          <p className="text-gray-400">Manage collaborator access and partnership requests</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-yellow-900 border-yellow-700">
            <Clock className="w-8 h-8 text-yellow-400 mb-2" />
            <p className="text-yellow-200 text-sm mb-1">Pending Requests</p>
            <p className="text-4xl font-bold text-yellow-400">{pendingRequests.length}</p>
          </Card>
          <Card className="p-6 bg-green-900 border-green-700">
            <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-green-200 text-sm mb-1">Active Collaborators</p>
            <p className="text-4xl font-bold text-green-400">{acceptedRequests.length}</p>
          </Card>
          <Card className="p-6 bg-red-900 border-red-700">
            <XCircle className="w-8 h-8 text-red-400 mb-2" />
            <p className="text-red-200 text-sm mb-1">Rejected</p>
            <p className="text-4xl font-bold text-red-400">{rejectedRequests.length}</p>
          </Card>
          <Card className="p-6 bg-blue-900 border-blue-700">
            <Users className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-blue-200 text-sm mb-1">Total Requests</p>
            <p className="text-4xl font-bold text-blue-400">{allRequests.length}</p>
          </Card>
        </div>

        {/* Access Code Management */}
        <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Key className="w-8 h-8 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Collaborator Access Code</h2>
          </div>

          <Alert className="mb-6 bg-blue-900/30 border-blue-700">
            <Shield className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-200">
              Share this code to allow someone to send you a collaborator request. You'll still need to review and approve this request from the pending requests section below.
            </AlertDescription>
          </Alert>

          <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-6 rounded-lg mb-6">
            <p className="text-gray-300 text-sm mb-3">Current Access Code:</p>
            <div className="flex items-center gap-4">
              <div className="bg-black/30 px-8 py-4 rounded-lg">
                <p className="text-6xl font-bold text-yellow-400 tracking-widest">
                  {currentCode?.code || "----"}
                </p>
              </div>
              <Button
                onClick={handleCopyCode}
                className="bg-green-600 hover:bg-green-700"
              >
                <Copy className="w-5 h-5 mr-2" />
                Copy Code
              </Button>
              <Button
                onClick={() => setShowCodeForm(!showCodeForm)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Change Code
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Last changed: {currentCode?.created_date && new Date(currentCode.created_date).toLocaleString()}
            </p>
          </div>

          {showCodeForm && (
            <Card className="p-6 bg-gray-700 border-gray-600">
              <h3 className="text-lg font-bold text-white mb-4">Generate New Access Code</h3>
              <Alert className="mb-4 bg-yellow-900/30 border-yellow-700">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-200">
                  <strong>Warning:</strong> After you generate a new code, the old code will no longer work. Any pending requests with the old code will still be valid.
                </AlertDescription>
              </Alert>

              <div className="flex gap-4">
                <Input
                  value={newAccessCode}
                  onChange={(e) => setNewAccessCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Enter 4-digit code (e.g., 1234)"
                  maxLength={4}
                  className="bg-gray-600 border-gray-500 text-white text-2xl tracking-widest text-center"
                />
                <Button
                  onClick={() => updateCodeMutation.mutate()}
                  disabled={updateCodeMutation.isLoading || newAccessCode.length !== 4}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {updateCodeMutation.isLoading ? "Updating..." : "Update Code"}
                </Button>
                <Button
                  onClick={() => {
                    setShowCodeForm(false);
                    setNewAccessCode("");
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          )}
        </Card>

        {/* Requests Tabs */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-700">
              <TabsTrigger value="pending">
                Pending ({pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="accepted">
                Active ({acceptedRequests.length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({rejectedRequests.length})
              </TabsTrigger>
            </TabsList>

            {/* Pending Tab */}
            <TabsContent value="pending">
              {pendingRequests.length === 0 ? (
                <p className="text-gray-400 text-center py-12">No pending requests</p>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <Card key={request.id} className="p-6 bg-gray-700 border-gray-600">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">{request.partner_name}</h3>
                          <div className="space-y-1 text-sm text-gray-300">
                            <p>📧 {request.partner_email}</p>
                            {request.company_name && <p>🏢 {request.company_name}</p>}
                            {request.phone && <p>📱 {request.phone}</p>}
                          </div>
                        </div>
                        <Badge className="bg-yellow-600">Pending Review</Badge>
                      </div>

                      <div className="bg-gray-800 p-4 rounded-lg mb-4">
                        <p className="text-gray-400 text-sm mb-2">Request Message:</p>
                        <p className="text-white">{request.request_message}</p>
                      </div>

                      {request.requested_permissions?.length > 0 && (
                        <div className="mb-4">
                          <p className="text-gray-400 text-sm mb-2">Requested Permissions:</p>
                          <div className="flex flex-wrap gap-2">
                            {request.requested_permissions.map((perm, idx) => (
                              <Badge key={idx} className="bg-blue-600">
                                {perm.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <select
                          id={`role-${request.id}`}
                          className="flex-1 p-2 rounded bg-gray-600 text-white border-gray-500"
                          defaultValue="viewer"
                        >
                          {Object.entries(ROLE_PERMISSIONS).map(([key, val]) => (
                            <option key={key} value={key}>{val.label}</option>
                          ))}
                        </select>
                        <Button
                          onClick={() => {
                            const role = document.getElementById(`role-${request.id}`).value;
                            const notes = prompt("Add review notes (optional):");
                            acceptRequestMutation.mutate({ requestId: request.id, role, notes });
                          }}
                          disabled={acceptRequestMutation.isLoading}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          onClick={() => {
                            const notes = prompt("Reason for rejection:");
                            if (notes) {
                              rejectRequestMutation.mutate({ requestId: request.id, notes });
                            }
                          }}
                          disabled={rejectRequestMutation.isLoading}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Accepted Tab */}
            <TabsContent value="accepted">
              {acceptedRequests.length === 0 ? (
                <p className="text-gray-400 text-center py-12">No active collaborators</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-700">
                        <TableHead className="text-gray-300">Name</TableHead>
                        <TableHead className="text-gray-300">Email</TableHead>
                        <TableHead className="text-gray-300">Company</TableHead>
                        <TableHead className="text-gray-300">Role</TableHead>
                        <TableHead className="text-gray-300">Approved</TableHead>
                        <TableHead className="text-gray-300">Expires</TableHead>
                        <TableHead className="text-gray-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {acceptedRequests.map((request) => (
                        <TableRow key={request.id} className="border-gray-700">
                          <TableCell className="text-white">{request.partner_name}</TableCell>
                          <TableCell className="text-gray-300">{request.partner_email}</TableCell>
                          <TableCell className="text-gray-300">{request.company_name || '-'}</TableCell>
                          <TableCell>
                            <Badge className="bg-green-600">
                              {ROLE_PERMISSIONS[request.assigned_role]?.label || request.assigned_role}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-400 text-sm">
                            {request.approved_date && new Date(request.approved_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-gray-400 text-sm">
                            {request.access_expires_at && new Date(request.access_expires_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => {
                                if (confirm("Remove this collaborator? This action cannot be undone.")) {
                                  removeCollaboratorMutation.mutate(request.id);
                                }
                              }}
                              disabled={removeCollaboratorMutation.isLoading}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Rejected Tab */}
            <TabsContent value="rejected">
              {rejectedRequests.length === 0 ? (
                <p className="text-gray-400 text-center py-12">No rejected requests</p>
              ) : (
                <div className="space-y-3">
                  {rejectedRequests.map((request) => (
                    <Card key={request.id} className="p-4 bg-gray-700 border-gray-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">{request.partner_name}</p>
                          <p className="text-sm text-gray-400">{request.partner_email}</p>
                          {request.review_notes && (
                            <p className="text-xs text-red-300 mt-1">Reason: {request.review_notes}</p>
                          )}
                        </div>
                        <Badge className="bg-red-600">Rejected</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>

        <SuperAdminQuickActions />
      </div>
    </div>
  );
}