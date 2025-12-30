import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Users, Key, CheckCircle, Shield } from "lucide-react";

const PERMISSION_OPTIONS = [
  { key: "view_vehicles", label: "View Vehicles" },
  { key: "manage_vehicles", label: "Manage Vehicles" },
  { key: "view_customers", label: "View Customers" },
  { key: "manage_subscriptions", label: "Manage Subscriptions" },
  { key: "view_payments", label: "View Payments" },
  { key: "manage_payments", label: "Manage Payments" },
  { key: "view_reports", label: "View Reports" },
  { key: "manage_settings", label: "Manage Settings" }
];

export default function RequestPartnerAccess() {
  const [submitted, setSubmitted] = useState(false);
  const [requestData, setRequestData] = useState({
    partner_name: "",
    partner_email: "",
    company_name: "",
    phone: "",
    access_code: "",
    request_message: "",
    requested_permissions: []
  });

  const submitRequestMutation = useMutation({
    mutationFn: async () => {
      if (!requestData.access_code || requestData.access_code.length !== 4) {
        throw new Error("Please enter a valid 4-digit access code");
      }

      // Verify access code is valid
      const codes = await base44.entities.PartnerAccessCode.filter({
        code: requestData.access_code,
        is_active: true
      });

      if (codes.length === 0) {
        throw new Error("Invalid or expired access code. Please contact STOCRX to get the correct code.");
      }

      // Update code usage
      await base44.entities.PartnerAccessCode.update(codes[0].id, {
        usage_count: (codes[0].usage_count || 0) + 1,
        last_used_at: new Date().toISOString()
      });

      // Create request
      return await base44.entities.PartnerCollaborator.create({
        ...requestData,
        status: 'pending',
        assigned_role: 'none',
        two_factor_enabled: false
      });
    },
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (error) => {
      alert(`❌ ${error.message}`);
    }
  });

  const togglePermission = (key) => {
    const current = requestData.requested_permissions || [];
    if (current.includes(key)) {
      setRequestData({
        ...requestData,
        requested_permissions: current.filter(p => p !== key)
      });
    } else {
      setRequestData({
        ...requestData,
        requested_permissions: [...current, key]
      });
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-12 bg-gradient-to-br from-green-900 to-emerald-900 border-green-700 text-center">
            <CheckCircle className="w-20 h-20 mx-auto mb-6 text-green-400" />
            <h1 className="text-4xl font-bold text-white mb-4">Request Submitted!</h1>
            <p className="text-xl text-green-100 mb-8">
              Your collaborator request has been sent to the STOCRX team. You'll receive an email notification once your request is reviewed.
            </p>
            <div className="bg-white/10 backdrop-blur p-6 rounded-lg mb-6">
              <p className="text-green-200 text-sm mb-2">What happens next?</p>
              <ol className="text-left text-green-100 space-y-2">
                <li>1. STOCRX admin will review your request (1-2 business days)</li>
                <li>2. You'll receive an email with their decision</li>
                <li>3. If approved, you'll get login credentials and instructions</li>
                <li>4. You must enable 2FA before accessing the platform</li>
              </ol>
            </div>
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-white text-green-900 hover:bg-gray-100"
            >
              Back to Home
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Users className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Request Collaborator Access
          </h1>
          <p className="text-xl text-gray-400">
            Join the STOCRX Partnership Platform
          </p>
        </div>

        <Alert className="mb-8 bg-blue-900/30 border-blue-700">
          <Shield className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-200">
            <strong>Partner Access:</strong> To request collaborator access, you need a 4-digit access code from STOCRX. 
            Contact the STOCRX team at <strong>fordmoneyroad@gmail.com</strong> to obtain your access code.
          </AlertDescription>
        </Alert>

        <Card className="p-8 bg-gray-800 border-gray-700">
          <form onSubmit={(e) => {
            e.preventDefault();
            submitRequestMutation.mutate();
          }} className="space-y-6">
            
            {/* Access Code */}
            <div>
              <label className="text-white text-lg mb-3 block font-bold flex items-center gap-2">
                <Key className="w-5 h-5 text-yellow-400" />
                Access Code * (Required)
              </label>
              <Input
                value={requestData.access_code}
                onChange={(e) => setRequestData({
                  ...requestData,
                  access_code: e.target.value.replace(/\D/g, '').slice(0, 4)
                })}
                required
                maxLength={4}
                placeholder="Enter 4-digit code (e.g., 8877)"
                className="bg-gray-700 border-gray-600 text-white text-3xl tracking-widest text-center h-16"
              />
              <p className="text-xs text-gray-400 mt-2">
                Don't have a code? Contact STOCRX to get one.
              </p>
            </div>

            <div className="border-t border-gray-700 pt-6"></div>

            {/* Personal Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Full Name *</label>
                <Input
                  value={requestData.partner_name}
                  onChange={(e) => setRequestData({...requestData, partner_name: e.target.value})}
                  required
                  placeholder="John Doe"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Email *</label>
                <Input
                  type="email"
                  value={requestData.partner_email}
                  onChange={(e) => setRequestData({...requestData, partner_email: e.target.value})}
                  required
                  placeholder="john@company.com"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Company Name</label>
                <Input
                  value={requestData.company_name}
                  onChange={(e) => setRequestData({...requestData, company_name: e.target.value})}
                  placeholder="Your Company LLC"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Phone</label>
                <Input
                  type="tel"
                  value={requestData.phone}
                  onChange={(e) => setRequestData({...requestData, phone: e.target.value})}
                  placeholder="(555) 123-4567"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            {/* Request Message */}
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Why do you want to collaborate? *</label>
              <Textarea
                value={requestData.request_message}
                onChange={(e) => setRequestData({...requestData, request_message: e.target.value})}
                required
                placeholder="Explain your interest in partnering with STOCRX..."
                className="bg-gray-700 border-gray-600 text-white h-32"
              />
            </div>

            {/* Permissions */}
            <div>
              <label className="text-gray-300 text-sm mb-3 block">Requested Permissions:</label>
              <div className="grid md:grid-cols-2 gap-3">
                {PERMISSION_OPTIONS.map((perm) => (
                  <label
                    key={perm.key}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      requestData.requested_permissions?.includes(perm.key)
                        ? 'bg-blue-900 border-2 border-blue-600'
                        : 'bg-gray-700 border-2 border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={requestData.requested_permissions?.includes(perm.key)}
                      onChange={() => togglePermission(perm.key)}
                      className="w-5 h-5"
                    />
                    <span className="text-white">{perm.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Select all permissions you need. Final access will be determined by STOCRX admin.
              </p>
            </div>

            <Alert className="bg-yellow-900/30 border-yellow-700">
              <Shield className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-200">
                <strong>Security Notice:</strong> Once approved, you must enable two-factor authentication (2FA) before accessing the platform. This helps ensure the security of STOCRX's systems and customer data.
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              disabled={submitRequestMutation.isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-14 text-lg font-bold"
            >
              {submitRequestMutation.isLoading ? "Submitting..." : "Submit Collaborator Request"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}