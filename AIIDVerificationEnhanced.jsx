import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, Eye, X, CheckCircle, AlertTriangle, 
  Bot, ArrowLeft, Image as ImageIcon
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function AIIDVerificationEnhanced() {
  const [user, setUser] = useState(null);
  const [verifying, setVerifying] = useState(null);
  const [aiResults, setAiResults] = useState(null);
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
    queryKey: ['pending-kyc-enhanced'],
    queryFn: () => base44.entities.Subscription.filter({ 
      kyc_verified: false, 
      status: "pending" 
    }),
    initialData: []
  });

  const { data: aiVerified } = useQuery({
    queryKey: ['ai-verified-kyc'],
    queryFn: () => base44.entities.Subscription.filter({ 
      ai_kyc_verified: { $exists: true },
      kyc_verified: false
    }),
    initialData: []
  });

  const verifyWithAIMutation = useMutation({
    mutationFn: async (subscription) => {
      setVerifying(subscription.id);
      
      // Enhanced AI verification with fake detection
      const verificationResult = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an advanced AI identity verification system with fake ID detection capabilities.

CRITICAL TASK: Analyze these identity documents for authenticity and detect fake/forged IDs.

Documents:
- License Front: ${subscription.license_front_url}
- License Back: ${subscription.license_back_url}  
- Selfie Photo: ${subscription.selfie_url}

Customer Info:
- Email: ${subscription.customer_email}
- Subscription: ${subscription.subscription_tier}

VERIFICATION CHECKLIST:

1. FAKE ID DETECTION (CRITICAL):
   - Check for obvious Photoshop/editing artifacts
   - Verify holograms, watermarks, microprinting
   - Check if fonts/layouts match real government IDs
   - Look for inconsistent lighting or shadows
   - Detect template-based fake IDs
   - Check for pixel manipulation
   - Verify security features visibility

2. PHOTO MATCHING:
   - Does face in ID match selfie?
   - Same person or different?
   - Age consistency
   - Facial features alignment

3. DOCUMENT QUALITY:
   - Image resolution adequate?
   - All text readable?
   - Photos clear and in focus?
   - No blurring or obstruction?

4. EXPIRATION CHECK:
   - Is ID expired based on visible date?
   - Issue date reasonable?

5. CONSISTENCY CHECK:
   - Information on front/back matches?
   - Name, DOB, ID number consistent?
   - Address readable?

6. TAMPERING DETECTION:
   - Signs of digital alteration?
   - Cut-and-paste indicators?
   - Color inconsistencies?
   - Suspicious artifacts?

7. MILITARY ID (if applicable):
   - Valid military ID format?
   - Proper DoD design?
   - Branch insignia correct?

DECISION CRITERIA:
- If FAKE ID suspected: is_authentic = false, requires_human_review = true
- If photo doesn't match: photo_match = false, requires_human_review = true
- If expired: id_expired = true, requires_human_review = true
- If tampering detected: tampering_detected = true, requires_human_review = true

Return comprehensive analysis with confidence scores.`,
        file_urls: [
          subscription.license_front_url, 
          subscription.license_back_url, 
          subscription.selfie_url
        ],
        response_json_schema: {
          type: "object",
          properties: {
            is_authentic: { type: "boolean" },
            fake_id_detected: { type: "boolean" },
            fake_id_confidence: { type: "number" },
            confidence_score: { type: "number" },
            photo_match: { type: "boolean" },
            photo_match_confidence: { type: "number" },
            id_expired: { type: "boolean" },
            tampering_detected: { type: "boolean" },
            tampering_indicators: { 
              type: "array", 
              items: { type: "string" } 
            },
            security_features_visible: { type: "boolean" },
            image_quality_score: { type: "number" },
            flags: { 
              type: "array", 
              items: { type: "string" } 
            },
            recommendation: { type: "string" },
            requires_human_review: { type: "boolean" },
            risk_level: { 
              type: "string",
              enum: ["low", "medium", "high", "critical"]
            }
          }
        }
      });

      // Update subscription with detailed AI results
      await base44.entities.Subscription.update(subscription.id, {
        ai_kyc_verified: verificationResult.is_authentic && 
                         !verificationResult.fake_id_detected && 
                         verificationResult.photo_match && 
                         !verificationResult.tampering_detected,
        ai_kyc_confidence: verificationResult.confidence_score,
        ai_kyc_notes: JSON.stringify(verificationResult),
        fake_id_detected: verificationResult.fake_id_detected,
        kyc_verified: verificationResult.is_authentic && 
                      !verificationResult.requires_human_review &&
                      !verificationResult.fake_id_detected
      });

      // Send alert if fake ID detected
      if (verificationResult.fake_id_detected || verificationResult.risk_level === "critical") {
        await base44.integrations.Core.SendEmail({
          to: SUPER_ADMIN_EMAIL,
          subject: `🚨 ALERT: Fake ID Detected - ${subscription.customer_email}`,
          body: `
            CRITICAL SECURITY ALERT
            
            FAKE ID DETECTED BY AI SYSTEM
            
            Customer: ${subscription.customer_email}
            Risk Level: ${verificationResult.risk_level?.toUpperCase()}
            Fake ID Confidence: ${(verificationResult.fake_id_confidence * 100).toFixed(1)}%
            
            Detected Issues:
            ${verificationResult.flags.join('\n')}
            
            Tampering Indicators:
            ${verificationResult.tampering_indicators?.join('\n') || 'None'}
            
            AI Recommendation:
            ${verificationResult.recommendation}
            
            ⚠️ REQUIRES IMMEDIATE HUMAN REVIEW
            
            View Documents: ${process.env.APP_URL || window.location.origin}/app/SubscriptionProfile?id=${subscription.id}
            
            DO NOT APPROVE WITHOUT THOROUGH INVESTIGATION.
          `
        });

        // Log security incident
        await base44.entities.ActivityLog.create({
          user_email: "AI_SYSTEM",
          action_type: "fake_id_detected",
          action_details: `Fake ID detected for ${subscription.customer_email}. Risk: ${verificationResult.risk_level}. Confidence: ${(verificationResult.fake_id_confidence * 100).toFixed(1)}%`,
          related_entity_id: subscription.id,
          entity_type: "Subscription"
        });
      }

      // Regular notification
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `AI KYC ${verificationResult.fake_id_detected ? '🚨 FAKE ID' : verificationResult.is_authentic ? '✅ Passed' : '⚠️ Failed'} - ${subscription.customer_email}`,
        body: `
          AI Identity Verification Complete
          
          Customer: ${subscription.customer_email}
          
          === VERIFICATION RESULTS ===
          
          Authentic ID: ${verificationResult.is_authentic ? 'YES' : 'NO'}
          Fake ID Detected: ${verificationResult.fake_id_detected ? 'YES ⚠️' : 'NO'}
          Photo Match: ${verificationResult.photo_match ? 'YES' : 'NO'}
          Expired: ${verificationResult.id_expired ? 'YES' : 'NO'}
          Tampering: ${verificationResult.tampering_detected ? 'DETECTED ⚠️' : 'None'}
          
          Overall Confidence: ${(verificationResult.confidence_score * 100).toFixed(1)}%
          Image Quality: ${(verificationResult.image_quality_score * 100).toFixed(0)}%
          Risk Level: ${verificationResult.risk_level?.toUpperCase()}
          
          Flags:
          ${verificationResult.flags.join('\n')}
          
          ${verificationResult.tampering_indicators?.length > 0 ? `
          Tampering Indicators:
          ${verificationResult.tampering_indicators.join('\n')}
          ` : ''}
          
          Recommendation: ${verificationResult.recommendation}
          
          ${verificationResult.requires_human_review ? '⚠️ REQUIRES HUMAN REVIEW' : '✅ Can auto-approve if all checks pass'}
          
          View: ${process.env.APP_URL || window.location.origin}/app/SubscriptionProfile?id=${subscription.id}
        `
      });

      setAiResults(verificationResult);
      return verificationResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-kyc-enhanced']);
      queryClient.invalidateQueries(['ai-verified-kyc']);
      setVerifying(null);
    }
  });

  const approveKYCMutation = useMutation({
    mutationFn: (subscriptionId) => base44.entities.Subscription.update(subscriptionId, {
      kyc_verified: true,
      admin_approved: true
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-kyc-enhanced']);
      queryClient.invalidateQueries(['ai-verified-kyc']);
      setAiResults(null);
    }
  });

  const rejectKYCMutation = useMutation({
    mutationFn: async ({ subscriptionId, reason }) => {
      await base44.entities.Subscription.update(subscriptionId, {
        kyc_verified: false,
        status: "suspended",
        rejection_reason: reason
      });

      // Log rejection
      await base44.entities.ActivityLog.create({
        user_email: user.email,
        action_type: "reject_kyc",
        action_details: `Rejected KYC for subscription ${subscriptionId}. Reason: ${reason}`,
        related_entity_id: subscriptionId,
        entity_type: "Subscription"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-kyc-enhanced']);
      queryClient.invalidateQueries(['ai-verified-kyc']);
      setAiResults(null);
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const aiApproved = aiVerified.filter(s => s.ai_kyc_verified === true);
  const aiFlagged = aiVerified.filter(s => s.ai_kyc_verified === false || s.fake_id_detected);

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
            Enhanced AI ID Verification
          </h1>
          <p className="text-gray-400">Advanced fake ID detection with human review</p>
        </div>

        <Alert className="mb-8 bg-blue-900 border-blue-700">
          <Bot className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-200">
            <strong>AI-Powered Verification:</strong> System automatically detects fake IDs, tampering, and photo mismatches before human review. All flagged cases require admin approval.
          </AlertDescription>
        </Alert>

        {/* Stats */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-400">{pendingKYC.length}</p>
          </Card>
          <Card className="p-6 bg-green-900 border-green-700">
            <p className="text-green-200 text-sm mb-1">AI Approved</p>
            <p className="text-3xl font-bold text-green-400">{aiApproved.length}</p>
          </Card>
          <Card className="p-6 bg-red-900 border-red-700">
            <p className="text-red-200 text-sm mb-1">AI Flagged</p>
            <p className="text-3xl font-bold text-red-400">{aiFlagged.length}</p>
          </Card>
          <Card className="p-6 bg-orange-900 border-orange-700">
            <p className="text-orange-200 text-sm mb-1">Fake IDs</p>
            <p className="text-3xl font-bold text-orange-400">
              {aiVerified.filter(s => s.fake_id_detected).length}
            </p>
          </Card>
          <Card className="p-6 bg-purple-900 border-purple-700">
            <p className="text-purple-200 text-sm mb-1">Human Review</p>
            <p className="text-3xl font-bold text-purple-400">
              {aiVerified.filter(s => {
                const notes = s.ai_kyc_notes ? JSON.parse(s.ai_kyc_notes) : {};
                return notes.requires_human_review;
              }).length}
            </p>
          </Card>
        </div>

        {/* AI Results Modal */}
        {aiResults && (
          <Card className="p-8 mb-8 bg-gray-800 border-2 border-purple-500">
            <h2 className="text-2xl font-bold text-white mb-6">AI Verification Results</h2>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-gray-400 text-sm mb-2">Authenticity</p>
                <Badge className={aiResults.is_authentic ? 'bg-green-600 text-lg' : 'bg-red-600 text-lg'}>
                  {aiResults.is_authentic ? 'AUTHENTIC' : 'NOT AUTHENTIC'}
                </Badge>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">Fake ID Detection</p>
                <Badge className={aiResults.fake_id_detected ? 'bg-red-600 text-lg' : 'bg-green-600 text-lg'}>
                  {aiResults.fake_id_detected ? '🚨 FAKE DETECTED' : 'NO FAKE DETECTED'}
                </Badge>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">Confidence Score</p>
                <p className="text-white font-bold text-2xl">
                  {(aiResults.confidence_score * 100).toFixed(1)}%
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">Risk Level</p>
                <Badge className={`text-lg ${
                  aiResults.risk_level === 'critical' ? 'bg-red-600' :
                  aiResults.risk_level === 'high' ? 'bg-orange-600' :
                  aiResults.risk_level === 'medium' ? 'bg-yellow-600' : 'bg-green-600'
                }`}>
                  {aiResults.risk_level?.toUpperCase()}
                </Badge>
              </div>
            </div>

            {aiResults.flags.length > 0 && (
              <div className="mb-6">
                <p className="text-gray-400 text-sm mb-2">Flags Detected:</p>
                <ul className="space-y-2">
                  {aiResults.flags.map((flag, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-yellow-300">
                      <AlertTriangle className="w-4 h-4" />
                      {flag}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-gray-700 p-4 rounded-lg mb-6">
              <p className="text-white font-semibold mb-2">AI Recommendation:</p>
              <p className="text-gray-300">{aiResults.recommendation}</p>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setAiResults(null)}
                variant="outline"
                className="flex-1 border-gray-600 text-white"
              >
                Close
              </Button>
            </div>
          </Card>
        )}

        {/* Pending Verification */}
        <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Pending AI Verification ({pendingKYC.length})
          </h2>

          {pendingKYC.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
              <p className="text-gray-400">No pending verifications</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Customer</TableHead>
                  <TableHead className="text-gray-300">Tier</TableHead>
                  <TableHead className="text-gray-300">Documents</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingKYC.map((sub) => (
                  <TableRow key={sub.id} className="border-gray-700">
                    <TableCell className="text-white">{sub.customer_email}</TableCell>
                    <TableCell>
                      <Badge className="bg-purple-600">{sub.subscription_tier}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(sub.license_front_url, '_blank')}
                          className="border-blue-500 text-blue-400"
                        >
                          <ImageIcon className="w-3 h-3 mr-1" />
                          Front
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(sub.license_back_url, '_blank')}
                          className="border-blue-500 text-blue-400"
                        >
                          <ImageIcon className="w-3 h-3 mr-1" />
                          Back
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(sub.selfie_url, '_blank')}
                          className="border-green-500 text-green-400"
                        >
                          <ImageIcon className="w-3 h-3 mr-1" />
                          Selfie
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => verifyWithAIMutation.mutate(sub)}
                        disabled={verifying === sub.id}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {verifying === sub.id ? "Verifying..." : (
                          <>
                            <Bot className="w-4 h-4 mr-1" />
                            AI Verify
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        {/* AI Flagged for Human Review */}
        <Card className="p-6 bg-red-900/20 border-red-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            🚨 Flagged for Human Review ({aiFlagged.length})
          </h2>

          {aiFlagged.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
              <p className="text-gray-400">No flagged cases</p>
            </div>
          ) : (
            aiFlagged.map((sub) => {
              const aiNotes = sub.ai_kyc_notes ? JSON.parse(sub.ai_kyc_notes) : {};
              
              return (
                <Card key={sub.id} className="p-6 bg-gray-800 border-red-600 border-2 mb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="font-bold text-white text-lg">{sub.customer_email}</p>
                      <div className="flex gap-2 mt-2">
                        {sub.fake_id_detected && (
                          <Badge className="bg-red-600">🚨 FAKE ID DETECTED</Badge>
                        )}
                        <Badge className={`${
                          aiNotes.risk_level === 'critical' ? 'bg-red-600' :
                          aiNotes.risk_level === 'high' ? 'bg-orange-600' : 'bg-yellow-600'
                        }`}>
                          Risk: {aiNotes.risk_level?.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <Badge className="bg-purple-600">{sub.subscription_tier}</Badge>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-gray-400 text-sm">Confidence</p>
                      <p className="text-white font-bold">
                        {(aiNotes.confidence_score * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Photo Match</p>
                      <Badge className={aiNotes.photo_match ? 'bg-green-600' : 'bg-red-600'}>
                        {aiNotes.photo_match ? 'YES' : 'NO'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Tampering</p>
                      <Badge className={aiNotes.tampering_detected ? 'bg-red-600' : 'bg-green-600'}>
                        {aiNotes.tampering_detected ? 'DETECTED' : 'None'}
                      </Badge>
                    </div>
                  </div>

                  {aiNotes.flags && aiNotes.flags.length > 0 && (
                    <div className="bg-yellow-900/30 p-4 rounded-lg mb-4">
                      <p className="text-yellow-300 font-bold mb-2">⚠️ Issues Detected:</p>
                      <ul className="space-y-1">
                        {aiNotes.flags.map((flag, idx) => (
                          <li key={idx} className="text-yellow-200 text-sm">• {flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      onClick={() => window.open(sub.license_front_url, '_blank')}
                      variant="outline"
                      className="border-blue-500 text-blue-400"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Docs
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (confirm('Approve this KYC despite AI flags?')) {
                          approveKYCMutation.mutate(sub.id);
                        }
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Override & Approve
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        const reason = prompt('Rejection reason:');
                        if (reason) {
                          rejectKYCMutation.mutate({ subscriptionId: sub.id, reason });
                        }
                      }}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </Card>

        {/* AI Approved - Ready for Final Approval */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">
            ✅ AI Approved - Ready for Final Approval ({aiApproved.length})
          </h2>

          {aiApproved.map((sub) => {
            const aiNotes = sub.ai_kyc_notes ? JSON.parse(sub.ai_kyc_notes) : {};
            
            return (
              <Card key={sub.id} className="p-4 bg-green-900/20 border-green-700 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{sub.customer_email}</p>
                    <p className="text-sm text-gray-400">
                      Confidence: {(aiNotes.confidence_score * 100).toFixed(1)}% • 
                      All checks passed
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => window.open(sub.license_front_url, '_blank')}
                      variant="outline"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => approveKYCMutation.mutate(sub.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Final Approve
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </Card>
      </div>
    </div>
  );
}