import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createPageUrl } from "@/utils";

export default function MilitaryVerification() {
  const [user, setUser] = useState(null);
  const [militaryId, setMilitaryId] = useState(null);
  const [dd214, setDd214] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        if (currentUser.military_verified) {
          window.location.href = createPageUrl("MilitaryDashboard");
        }
      } catch (err) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  const handleFileUpload = async (file, setter) => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setter(result.file_url);
    } catch (err) {
      setError("Error uploading file. Please try again.");
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!militaryId || !dd214) {
      setError("Please upload both required documents");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Send verification request to admin
      await base44.integrations.Core.SendEmail({
        to: "stocrx@gmail.com",
        subject: `Military Verification Request - ${user.email}`,
        body: `
          Military Verification Request:
          
          Name: ${user.full_name || user.email}
          Email: ${user.email}
          
          Documents:
          - Military ID: ${militaryId}
          - DD214: ${dd214}
          
          Please verify and grant FREE Military VIP access.
        `
      });

      // Send confirmation to user
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: "STOCRX - Military Verification Submitted",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fedac268a06fe88d74977e/0f2d8e915_IMG_3409.png" alt="STOCRX" style="height: 60px;" />
              <h1 style="color: white; margin-top: 10px;">Military Verification Received!</h1>
            </div>
            <div style="padding: 30px; background: white;">
              <p>Thank you for your service!</p>
              <p>Your military verification documents have been received and are under review.</p>
              <p><strong>We'll verify your status within 24 hours and grant you FREE Military VIP access.</strong></p>
              <p>As a thank you, you'll receive:</p>
              <ul>
                <li>FREE membership (no membership fees)</li>
                <li>VIP priority support</li>
                <li>Swap any car, anytime</li>
                <li>Exclusive military benefits</li>
              </ul>
              <p>We're honored to serve those who serve.</p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">STOCRX - Subscription to Own</p>
              </div>
            </div>
          </div>
        `
      });

      setSuccess(true);
    } catch (err) {
      setError("Error submitting verification. Please try again.");
      console.error(err);
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full text-green-800 mb-4">
            <Shield className="w-5 h-5" />
            <span className="font-semibold">Military Verification</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Thank You For Your Service
          </h1>
          <p className="text-gray-600">
            Get FREE Military VIP membership - verify your military status below
          </p>
        </div>

        {success && (
          <Alert className="mb-8 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Verification submitted! We'll review your documents and activate your FREE Military VIP account within 24 hours.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="p-8 border-none shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Verification Documents</h2>

          <div className="space-y-6">
            {/* Military ID */}
            <div>
              <Label className="text-lg font-semibold mb-3 block">Military ID (Front) *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-500 transition-colors">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e.target.files[0], setMilitaryId)}
                  className="hidden"
                  id="military-id"
                />
                <label htmlFor="military-id" className="cursor-pointer">
                  {militaryId ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="w-6 h-6" />
                      <span>Military ID Uploaded</span>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">Click to upload Military ID</p>
                      <p className="text-sm text-gray-500 mt-1">Active duty or veteran ID card</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* DD214 */}
            <div>
              <Label className="text-lg font-semibold mb-3 block">DD214 or Service Record *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-green-500 transition-colors">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e.target.files[0], setDd214)}
                  className="hidden"
                  id="dd214"
                />
                <label htmlFor="dd214" className="cursor-pointer">
                  {dd214 ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="w-6 h-6" />
                      <span>DD214 Uploaded</span>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">Click to upload DD214</p>
                      <p className="text-sm text-gray-500 mt-1">Proof of military service</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <Alert className="bg-green-50 border-green-200">
              <Shield className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Your information is secure.</strong> We only use these documents to verify your military status and will never share them.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleSubmit}
              disabled={loading || !militaryId || !dd214 || success}
              className="w-full h-16 text-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {loading ? "Submitting..." : success ? "Verification Submitted!" : "Submit for FREE Military VIP"}
            </Button>
          </div>
        </Card>

        {/* Benefits Reminder */}
        <Card className="p-8 mt-8 bg-gradient-to-br from-green-50 to-emerald-50 border-none">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Military VIP Benefits</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "FREE membership (no fees)",
              "VIP priority support",
              "Swap any car, anytime",
              "Buyout anytime",
              "All 50 states coverage",
              "$500/month payments",
              "Exclusive military discounts",
              "Dedicated account manager"
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}