import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createPageUrl } from "@/utils";

export default function FundsVerification() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const vehicleId = urlParams.get('vehicleId');
  const tier = urlParams.get('tier');
  
  const [user, setUser] = useState(null);
  const [bankStatement, setBankStatement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const tierInfo = {
    travelers: { name: "Travelers", amount: 4500 },
    high_end: { name: "High End", amount: 50000 }
  };

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

  const handleFileUpload = async (file) => {
    setLoading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setBankStatement(result.file_url);
    } catch (err) {
      setError("Error uploading file. Please try again.");
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!bankStatement) {
      setError("Please upload bank statement");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await base44.integrations.Core.SendEmail({
        to: "stocrx@gmail.com",
        subject: `${tierInfo[tier].name} Funds Verification - ${user.email}`,
        body: `
          ${tierInfo[tier].name} Plan Verification Request:
          
          Customer: ${user.full_name || user.email}
          Email: ${user.email}
          Vehicle ID: ${vehicleId}
          Required Amount: $${tierInfo[tier].amount.toLocaleString()}
          
          Bank Statement: ${bankStatement}
          
          Please verify funds and approve application.
        `
      });

      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `STOCRX - ${tierInfo[tier].name} Verification Submitted`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fedac268a06fe88d74977e/0f2d8e915_IMG_3409.png" alt="STOCRX" style="height: 60px;" />
              <h1 style="color: white; margin-top: 10px;">Verification Submitted!</h1>
            </div>
            <div style="padding: 30px; background: white;">
              <p>Thank you for applying for ${tierInfo[tier].name} tier!</p>
              <p>Your bank statement has been received and is under review.</p>
              <p><strong>We'll verify your funds within 24-48 hours.</strong></p>
              <p>Once approved, you can proceed with your subscription.</p>
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

  if (!user || !tier || !tierInfo[tier]) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const benefitsList = tier === "travelers" 
    ? [
        "Swap any car, anytime",
        "ALL vehicles in fleet",
        "Buyout anytime",
        "All 50 states",
        "$500/month payments",
        "Premium concierge"
      ]
    : [
        "$100k+ luxury vehicles",
        "$1k-$5k monthly payments",
        "White glove service",
        "Dedicated manager",
        "Money back guarantee",
        "Exclusive access"
      ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full text-orange-800 mb-4">
            <DollarSign className="w-5 h-5" />
            <span className="font-semibold">Funds Verification</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {tierInfo[tier].name} Plan Verification
          </h1>
          <p className="text-gray-600">
            Verify you have ${tierInfo[tier].amount.toLocaleString()} to proceed
          </p>
        </div>

        {success && (
          <Alert className="mb-8 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Verification submitted! We'll review and contact you within 24-48 hours.
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Bank Statement</h2>

          <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold mb-3 block">Bank Statement (Last 30 Days) *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-500 transition-colors">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  className="hidden"
                  id="bank-statement"
                />
                <label htmlFor="bank-statement" className="cursor-pointer">
                  {bankStatement ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="w-6 h-6" />
                      <span>Bank Statement Uploaded</span>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">Click to upload bank statement</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Must show at least ${tierInfo[tier].amount.toLocaleString()} available
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <Alert className="bg-orange-50 border-orange-200">
              <DollarSign className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Privacy Protected:</strong> Your financial documents are encrypted and will only be used for verification. They'll be securely deleted after approval.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleSubmit}
              disabled={loading || !bankStatement || success}
              className="w-full h-16 text-xl bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700"
            >
              {loading ? "Submitting..." : success ? "Verification Submitted!" : "Submit for Verification"}
            </Button>
          </div>
        </Card>

        <Card className="p-8 mt-8 bg-gradient-to-br from-orange-50 to-yellow-50 border-none">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">{tierInfo[tier].name} Benefits</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {benefitsList.map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}