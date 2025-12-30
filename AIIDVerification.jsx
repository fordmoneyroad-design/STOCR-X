import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ArrowLeft, CheckCircle, X, AlertTriangle, Eye } from "lucide-react";
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

export default function AIIDVerification() {
  const [user, setUser] = useState(null);
  const [verifying, setVerifying] = useState(null);
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

  const { data: pendingKYC } = useQuery({
    queryKey: ['pending-kyc-ai'],
    queryFn: () => base44.entities.Subscription.filter({ kyc_verified: false, status: "pending" }),
    initialData: []
  });

  const verifyWithAIMutation = useMutation({
    mutationFn: async (subscription) => {
      setVerifying(subscription.id);
      
      // AI verification using LLM with image analysis
      const verificationResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an AI identity verification system. Analyze these documents for authenticity:

Documents provided:
- License Front: ${subscription.license_front_url}
- License Back: ${subscription.license_back_url}
- Selfie: ${subscription.selfie_url}

Verify:
1. Are these real government-issued IDs or fake/doctored images?
2. Does the photo on the ID match the selfie?
3. Is the ID expired based on visible date?
4. Are there signs of tampering or digital manipulation?
5. Quality and resolution check
6. Holograms and security features visible?

Return verification assessment.`,
        file_urls: [subscription.license_front_url, subscription.license_back_url, subscription.selfie_url],
        response_json_schema: {
          type: "object",
          properties: {
            is_authentic: { type: "boolean" },
            confidence_score: { type: "number" },
            photo_match: { type: "boolean" },
            id_expired: { type: "boolean" },
            tampering_detected: { type: "boolean" },
            flags: { type: "array", items: { type: "string" } },
            recommendation: { type: "string" },
            requires_human_review: { type: "boolean" }
          }
        }
      });

      // Update subscription with AI verification results
      await base44.entities.Subscription.update(subscription.id, {
        ai_kyc_verified: verificationResult.is_authentic && verificationResult.photo_match && !verificationResult.tampering_detected,
        ai_kyc_confidence: verificationResult.confidence_score,
        ai_kyc_notes: JSON.stringify(verificationResult),
        kyc_verified: verificationResult.is_authentic && !verificationResult.requires_human_review
      });

      // Send notification to admin
      await base44.integrations.Core.SendEmail({
        to: SUPER_ADMIN_EMAIL,
        subject: `AI KYC Verification - ${subscription.customer_email}`,
        body: `
          AI Identity Verification Complete
          
          Customer: ${subscription.customer_email}
          
          Results:
          - Authentic ID: ${verificationResult.is_authentic ? 'Yes' : 'No'}
          - Confidence: ${(verificationResult.confidence_score * 100).toFixed(1)}%
          - Photo Match: ${verificationResult.photo_match ? 'Yes' : 'No'}
          - Expired: ${verificationResult.id_expired ? 'Yes' : 'No'}
          - Tampering: ${verificationResult.tampering_detected ? 'DETECTED' : 'None'}
          
          Flags:
          ${verificationResult.flags.join('\n')}
          
          Recommendation: ${verificationResult.recommendation}
          
          ${verificationResult.requires_human_review ? 'REQUIRES HUMAN REVIEW' : 'Auto-approved'}
          
          View: ${window.location.origin}/SubscriptionProfile?id=${subscription.id}
        `
      });

      return verificationResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-kyc-ai']);
      setVerifying(null);
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
            <Shield className="w-10 h-10 text-green-400" />
            AI Identity Verification
          </h1>
          <p className="text-gray-400">Automated fake ID detection before human review</p>
        </div>

        <Alert className="mb-8 bg-blue-900 border-blue-700">
          <Shield className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-200">
            <strong>AI Pre-screening:</strong> All IDs are analyzed by AI to detect fakes, tampering, and photo mismatches before reaching human review.
          </AlertDescription>
        </Alert>

        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">
            Pending Verification ({pendingKYC.length})
          </h2>

          {pendingKYC.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
              <p className="text-gray-400">All identities verified!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Customer</TableHead>
                  <TableHead className="text-gray-300">Documents</TableHead>
                  <TableHead className="text-gray-300">AI Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingKYC.map((sub) => {
                  const aiVerified = sub.ai_kyc_verified;
                  const aiNotes = sub.ai_kyc_notes ? JSON.parse(sub.ai_kyc_notes) : null;
                  
                  return (
                    <TableRow key={sub.id} className="border-gray-700">
                      <TableCell className="text-white font-semibold">
                        {sub.customer_email}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(sub.license_front_url, '_blank')}
                            className="border-blue-500 text-blue-400"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Front
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(sub.license_back_url, '_blank')}
                            className="border-blue-500 text-blue-400"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Back
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(sub.selfie_url, '_blank')}
                            className="border-green-500 text-green-400"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Selfie
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        {aiNotes ? (
                          <div className="space-y-1">
                            <Badge className={aiVerified ? 'bg-green-600' : 'bg-red-600'}>
                              {aiVerified ? 'AI Approved' : 'AI Flagged'}
                            </Badge>
                            <p className="text-xs text-gray-400">
                              Confidence: {(aiNotes.confidence_score * 100).toFixed(0)}%
                            </p>
                            {aiNotes.flags && aiNotes.flags.length > 0 && (
                              <p className="text-xs text-yellow-400">
                                ⚠️ {aiNotes.flags.length} flags
                              </p>
                            )}
                          </div>
                        ) : (
                          <Badge className="bg-yellow-600">Not Verified</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => verifyWithAIMutation.mutate(sub)}
                            disabled={verifying === sub.id}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            {verifying === sub.id ? (
                              "Verifying..."
                            ) : (
                              <>
                                <Shield className="w-4 h-4 mr-1" />
                                AI Verify
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => window.location.href = `/SubscriptionProfile?id=${sub.id}`}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* AI Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mt-8">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Verified</p>
            <p className="text-3xl font-bold text-white">
              {pendingKYC.filter(s => s.ai_kyc_verified !== undefined).length}
            </p>
          </Card>
          <Card className="p-6 bg-gray-800 border-green-700 border-2">
            <p className="text-gray-400 text-sm mb-1">AI Approved</p>
            <p className="text-3xl font-bold text-green-400">
              {pendingKYC.filter(s => s.ai_kyc_verified === true).length}
            </p>
          </Card>
          <Card className="p-6 bg-gray-800 border-red-700 border-2">
            <p className="text-gray-400 text-sm mb-1">AI Flagged</p>
            <p className="text-3xl font-bold text-red-400">
              {pendingKYC.filter(s => s.ai_kyc_verified === false).length}
            </p>
          </Card>
          <Card className="p-6 bg-gray-800 border-yellow-700 border-2">
            <p className="text-gray-400 text-sm mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-400">
              {pendingKYC.filter(s => s.ai_kyc_verified === undefined).length}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}