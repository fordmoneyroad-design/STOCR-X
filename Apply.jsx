
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Upload, Camera, CheckCircle, AlertCircle, 
  FileText, User as UserIcon, CreditCard, ArrowRight
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Apply() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const vehicleId = urlParams.get('vehicleId');
  const tier = urlParams.get('tier');
  
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form data
  const [contractMonths, setContractMonths] = useState(3);
  const [paymentFrequency, setPaymentFrequency] = useState("monthly");
  const [licenseFront, setLicenseFront] = useState(null);
  const [licenseBack, setLicenseBack] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [insuranceDoc, setInsuranceDoc] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [insuranceSelected, setInsuranceSelected] = useState(false);
  const [childrenCount, setChildrenCount] = useState(0);
  const [zipCode, setZipCode] = useState("");
  const [zipCodeValid, setZipCodeValid] = useState(true);
  const [companyName, setCompanyName] = useState("");
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        
        // Enforce onboarding
        if (!currentUser.onboarding_completed) {
          navigate(createPageUrl("Onboarding"));
          return;
        }
        
        setUser(currentUser);
        // Delivery address is no longer collected here
      } catch (err) {
        base44.auth.redirectToLogin(window.location.href);
      }
    };
    checkAuth();
  }, [navigate]);

  const { data: vehicle } = useQuery({
    queryKey: ['vehicle', vehicleId],
    queryFn: async () => {
      const vehicles = await base44.entities.Vehicle.filter({ id: vehicleId });
      return vehicles[0];
    },
    enabled: !!vehicleId
  });

  const allowedZipCodes = ["48201", "48202", "48226", "48127"]; // Michigan example
  
  const validateZipCode = (zip) => {
    // For now, allow all 5-digit zip codes but track them
    // In production, you'd check against service areas (e.g., allowedZipCodes.includes(zip))
    return zip.length === 5;
  };

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
    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions");
      return;
    }

    if (!licenseFront || !licenseBack || !selfie) {
      setError("Please upload all required verification documents (License front, back, and selfie)");
      return;
    }

    if (!zipCode || !validateZipCode(zipCode)) {
      setError("Please enter a valid 5-digit zip code");
      return;
    }

    if ((vehicle.insurance_required || insuranceSelected) && !insuranceDoc) {
      setError("Insurance proof is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Hardcoded fees as per outline
      const membershipFee = 2500;
      const insuranceCostPerMonth = insuranceSelected ? 150 : 0;
      const totalChildrenFeeForContract = childrenCount * 25; // total for the entire contract
      const childrenFeePerMonth = totalChildrenFeeForContract / contractMonths; // monthly portion of total children fee

      let baseSubAmountPerPeriod;
      let periodsPerMonth;

      if (paymentFrequency === "weekly") {
        baseSubAmountPerPeriod = vehicle.weekly_subscription;
        periodsPerMonth = 4; // Approx 4 weeks in a month
      } else if (paymentFrequency === "bi-weekly") {
        baseSubAmountPerPeriod = vehicle.monthly_subscription / 2;
        periodsPerMonth = 2; // 2 bi-weekly periods in a month
      } else { // monthly
        baseSubAmountPerPeriod = vehicle.monthly_subscription;
        periodsPerMonth = 1;
      }
      
      const insurancePerPeriod = insuranceCostPerMonth / periodsPerMonth;
      const childrenFeePerPeriodAmount = childrenFeePerMonth / periodsPerMonth;
      const nextPaymentAmount = baseSubAmountPerPeriod + insurancePerPeriod + childrenFeePerPeriodAmount;
      
      // Create subscription with ALL verification data
      const subscription = await base44.entities.Subscription.create({
        vehicle_id: vehicleId,
        customer_email: user.email,
        subscription_tier: tier || "standard",
        status: "pending",
        contract_length_months: contractMonths,
        payment_frequency: paymentFrequency,
        down_payment_paid: vehicle.down_payment,
        membership_fee: membershipFee,
        insurance_selected: insuranceSelected || vehicle.insurance_required,
        insurance_cost: insuranceCostPerMonth, // Storing the monthly insurance cost
        total_paid: 0,
        remaining_balance: vehicle.price,
        next_payment_amount: nextPaymentAmount,
        // delivery_address removed
        kyc_verified: false,
        license_front_url: licenseFront,
        license_back_url: licenseBack,
        selfie_url: selfie,
        insurance_doc_url: insuranceDoc,
        insurance_verified: !!insuranceDoc,
        admin_approved: false,
        children_count: childrenCount,
        children_fee: totalChildrenFeeForContract, // Storing the total children fee for the contract
        zip_code: zipCode,
        company_name: companyName || null,
      });

      // Track application in search/activity
      await base44.entities.SearchTracking.create({
        user_email: user.email,
        search_query: `Applied: ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        price_range_min: vehicle.price,
        price_range_max: vehicle.price,
        results_count: 1,
        user_subscription_tier: tier,
        zip_code: zipCode
      });

      // Update user with zip code and tier
      await base44.auth.updateMe({
        zip_code: zipCode,
        subscription_tier: tier || "standard",
        phone: user.phone || ""
      });

      // Create down payment record
      await base44.entities.Payment.create({
        subscription_id: subscription.id,
        amount: vehicle.down_payment,
        payment_type: "down_payment",
        status: "pending",
        platform_fee: 0
      });

      // Create membership fee record
      await base44.entities.Payment.create({
        subscription_id: subscription.id,
        amount: membershipFee,
        payment_type: "finance_fee",
        status: "pending",
        platform_fee: 0
      });

      // Update vehicle status
      await base44.entities.Vehicle.update(vehicleId, { status: "reserved" });

      // Create document records for 3-year retention
      const retentionDate = new Date();
      retentionDate.setFullYear(retentionDate.getFullYear() + 3);

      await base44.entities.Document.create({
        subscription_id: subscription.id,
        customer_email: user.email,
        document_type: "license_front",
        document_url: licenseFront,
        uploaded_by: user.email,
        retention_until: retentionDate.toISOString().split('T')[0]
      });

      await base44.entities.Document.create({
        subscription_id: subscription.id,
        customer_email: user.email,
        document_type: "license_back",
        document_url: licenseBack,
        uploaded_by: user.email,
        retention_until: retentionDate.toISOString().split('T')[0]
      });

      await base44.entities.Document.create({
        subscription_id: subscription.id,
        customer_email: user.email,
        document_type: "selfie",
        document_url: selfie,
        uploaded_by: user.email,
        retention_until: retentionDate.toISOString().split('T')[0]
      });

      if (insuranceDoc) {
        await base44.entities.Document.create({
          subscription_id: subscription.id,
          customer_email: user.email,
          document_type: "insurance",
          document_url: insuranceDoc,
          uploaded_by: user.email,
          retention_until: retentionDate.toISOString().split('T')[0]
        });
      }

      // Send confirmation email with logo
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: "STOCRX - Application Received",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fedac268a06fe88d74977e/0f2d8e915_IMG_3409.png" alt="STOCRX" style="height: 60px;" />
              <h1 style="color: white; margin-top: 10px;">Application Received!</h1>
            </div>
            <div style="padding: 30px; background: white;">
              <p>Thank you for applying!</p>
              <p>Your application for the ${vehicle.year} ${vehicle.make} ${vehicle.model} has been received.</p>
              <p><strong>We'll review your documents MANUALLY and send an approval email within 24 hours.</strong></p>
              <p><strong>Important:</strong> Down payment ($${vehicle.down_payment.toLocaleString()}) and membership fee ($${membershipFee.toLocaleString()}) are NON-REFUNDABLE.</p>
              <p>Thank you for choosing STOCRX! We're so happy to help you get back on the road. Our mission is to make car ownership accessible and flexible for everyone.</p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 12px;">STOCRX - Subscription to Own</p>
              </div>
            </div>
          </div>
        `
      });

      // Send notification to admin for MANUAL review
      await base44.integrations.Core.SendEmail({
        to: "fordmoneyroad@gmail.com",
        subject: `🚨 NEW APPLICATION - MANUAL REVIEW REQUIRED - ${user.email}`,
        body: `
          <div style="font-family: monospace; background: #000; color: #0f0; padding: 20px;">
            <h2>⚠️ NEW SUBSCRIPTION APPLICATION - MANUAL REVIEW REQUIRED</h2>
            
            <hr style="border-color: #0f0;" />
            
            <h3>📋 Application Details:</h3>
            <p>Customer: ${user.full_name || user.email}</p>
            <p>Email: ${user.email}</p>
            <p>Phone: ${user.phone || 'Not provided'}</p>
            <p>Tier: ${tier?.toUpperCase() || 'STANDARD'}</p>
            <p>Zip Code: ${zipCode}</p>
            ${companyName ? `<p>Company: ${companyName}</p>` : ''}
            
            <h3>🚗 Vehicle:</h3>
            <p>${vehicle.year} ${vehicle.make} ${vehicle.model}</p>
            <p>Price: $${vehicle.price?.toLocaleString()}</p>
            <p>VIN: ${vehicle.vin || 'N/A'}</p>
            
            <h3>📄 Documents to Review:</h3>
            <p>✓ License Front: <a href="${licenseFront}" style="color: #0ff;">VIEW</a></p>
            <p>✓ License Back: <a href="${licenseBack}" style="color: #0ff;">VIEW</a></p>
            <p>✓ Selfie: <a href="${selfie}" style="color: #0ff;">VIEW</a></p>
            ${insuranceDoc ? `<p>✓ Insurance: <a href="${insuranceDoc}" style="color: #0ff;">VIEW</a></p>` : '<p>⚠ Insurance: Not provided</p>'}
            
            <h3>💰 Financial:</h3>
            <p>Down Payment: $${vehicle.down_payment.toLocaleString()}</p>
            <p>Membership Fee: $${membershipFee.toLocaleString()}</p>
            <p>Next Payment Amount (${paymentFrequency}): $${nextPaymentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p>Contract Length: ${contractMonths} months</p>
            <p>Insurance Selected: ${insuranceSelected ? `Yes ($${insuranceCostPerMonth}/month)` : 'No'}</p>
            <p>Children on Subscription: ${childrenCount} (Total Children Fee: $${totalChildrenFeeForContract})</p>

            <hr style="border-color: #0f0;" />
            
            <h3>👨‍💼 ACTION REQUIRED:</h3>
            <p>1. Review all documents above</p>
            <p>2. Verify identity matches across all documents</p>
            <p>3. Check for any red flags</p>
            <p>4. Go to Super Admin Dashboard to approve/deny</p>
            
            <p style="color: #ff0;">⚠️ DO NOT AUTO-APPROVE - MANUAL REVIEW REQUIRED</p>
          </div>
        `
      });

      // Log activity
      await base44.entities.ActivityLog.create({
        user_email: user.email,
        action_type: "apply_subscription",
        action_details: `Applied for ${tier} tier subscription for ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
        related_entity_id: subscription.id,
        entity_type: "Subscription"
      });

      window.location.href = `/MyAccount?success=true`; // Redirect via window.location for full page refresh
    } catch (err) {
      setError("Error submitting application. Please try again.");
      console.error(err);
    }
    setLoading(false);
  };

  // Calculations for JSX display
  const membershipFeeForDisplay = 2500;
  const insuranceCostPerMonthForDisplay = insuranceSelected ? 150 : 0;
  const totalChildrenFeeForContractForDisplay = childrenCount * 25;
  const childrenFeePerMonthForDisplay = totalChildrenFeeForContractForDisplay / contractMonths;

  let baseSubAmountPerPeriodForDisplay;
  let periodsPerMonthForDisplay;

  if (paymentFrequency === "weekly") {
    baseSubAmountPerPeriodForDisplay = vehicle?.weekly_subscription || 0;
    periodsPerMonthForDisplay = 4;
  } else if (paymentFrequency === "bi-weekly") {
    baseSubAmountPerPeriodForDisplay = (vehicle?.monthly_subscription || 0) / 2;
    periodsPerMonthForDisplay = 2;
  } else { // monthly
    baseSubAmountPerPeriodForDisplay = vehicle?.monthly_subscription || 0;
    periodsPerMonthForDisplay = 1;
  }
  
  const insurancePerPeriodForDisplay = insuranceCostPerMonthForDisplay / periodsPerMonthForDisplay;
  const childrenFeePerPeriodForDisplay = childrenFeePerMonthForDisplay / periodsPerMonthForDisplay;
  const nextPaymentAmountForDisplay = baseSubAmountPerPeriodForDisplay + insurancePerPeriodForDisplay + childrenFeePerPeriodForDisplay;
  
  const totalDueTodayForDisplay = vehicle?.down_payment + membershipFeeForDisplay + nextPaymentAmountForDisplay;


  if (!vehicle || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Complete Your Application
          </h1>
          <p className="text-gray-600">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-16 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-16 mt-2">
            <span className="text-sm text-gray-600">Contract</span>
            <span className="text-sm text-gray-600">Verification</span>
            <span className="text-sm text-gray-600">Review</span>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Contract Terms */}
        {step === 1 && (
          <Card className="p-8 border-none shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Choose Your Terms
            </h2>

            <div className="space-y-6">
              {/* Add Zip Code Field */}
              <div>
                <Label className="text-lg font-semibold mb-3 block">Zip Code *</Label>
                <Input
                  value={zipCode}
                  onChange={(e) => {
                    setZipCode(e.target.value);
                    setZipCodeValid(validateZipCode(e.target.value));
                  }}
                  placeholder="Enter your 5-digit zip code"
                  maxLength={5}
                  className={`h-12 ${!zipCodeValid && zipCode.length === 5 ? 'border-red-500' : ''}`}
                />
                {!zipCodeValid && zipCode.length === 5 && (
                  <p className="text-red-600 text-sm mt-1">Please enter a valid 5-digit zip code</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  We'll verify service availability in your area.
                </p>
              </div>

              {/* Company Name for High-End */}
              {tier === 'high_end' && (
                <div>
                  <Label className="text-lg font-semibold mb-3 block">Company Name (Optional)</Label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your company name"
                    className="h-12"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    For business accounts.
                  </p>
                </div>
              )}

              <div>
                <Label className="text-lg font-semibold mb-3 block">Contract Length</Label>
                <div className="grid grid-cols-4 gap-3">
                  {[3, 4, 5, 6].map((months) => (
                    <button
                      key={months}
                      onClick={() => setContractMonths(months)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        contractMonths === months
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="text-2xl font-bold">{months}</p>
                      <p className="text-sm text-gray-600">months</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-lg font-semibold mb-3 block">Payment Frequency</Label>
                <Tabs value={paymentFrequency} onValueChange={setPaymentFrequency}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="bi-weekly">Bi-Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Children Add-on */}
              <div>
                <Label className="text-lg font-semibold mb-3 block">Children on Subscription</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={childrenCount}
                    onChange={(e) => setChildrenCount(parseInt(e.target.value) || 0)}
                    className="w-24 h-12"
                  />
                  <span className="text-gray-600">children</span>
                </div>
                {childrenCount > 0 && (
                  <Alert className="mt-3 bg-blue-50 border-blue-200">
                    <AlertDescription className="text-blue-800">
                      <strong>Additional Fee:</strong> $25 per child (Total $${totalChildrenFeeForContractForDisplay} spread across contract).
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Insurance Option */}
              {!vehicle.insurance_required && (
                <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-none">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="insurance"
                      checked={insuranceSelected}
                      onCheckedChange={(checked) => setInsuranceSelected(!!checked)}
                      className="mt-1"
                    />
                    <label htmlFor="insurance" className="cursor-pointer">
                      <p className="font-bold text-gray-900 mb-1">Add Insurance Protection</p>
                      <p className="text-sm text-gray-600">
                        ${insuranceCostPerMonthForDisplay}/month - Comprehensive coverage for your peace of mind.
                      </p>
                    </label>
                  </div>
                </Card>
              )}

              {/* Pricing Summary */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-none">
                <h3 className="font-bold text-lg mb-4">Pricing Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Down Payment (NON-REFUNDABLE)</span>
                    <span className="font-bold">${vehicle.down_payment?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Membership Subscription (NON-REFUNDABLE)</span>
                    <span className="font-bold">${membershipFeeForDisplay.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Subscription</span>
                    <span className="font-bold">${(paymentFrequency === "weekly" ? vehicle?.weekly_subscription : paymentFrequency === "bi-weekly" ? vehicle?.monthly_subscription / 2 : vehicle?.monthly_subscription)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/{paymentFrequency === "weekly" ? "week" : paymentFrequency === "bi-weekly" ? "bi-week" : "month"}</span>
                  </div>
                  {insuranceSelected && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Insurance</span>
                      <span className="font-bold">${insurancePerPeriodForDisplay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/{paymentFrequency === "weekly" ? "week" : paymentFrequency === "bi-weekly" ? "bi-week" : "month"}</span>
                    </div>
                  )}
                  {childrenCount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Children Fee ({childrenCount})</span>
                      <span className="font-bold">${childrenFeePerPeriodForDisplay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/{paymentFrequency === "weekly" ? "week" : paymentFrequency === "bi-weekly" ? "bi-week" : "month"}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-gray-600">Estimated {paymentFrequency.charAt(0).toUpperCase() + paymentFrequency.slice(1)} Payment</span>
                    <span className="font-bold text-blue-600">
                      ${nextPaymentAmountForDisplay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </Card>

              <Button
                onClick={() => setStep(2)}
                disabled={!zipCode || !zipCodeValid}
                className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Continue to Verification
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: KYC Verification */}
        {step === 2 && (
          <Card className="p-8 border-none shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <UserIcon className="w-6 h-6 text-blue-600" />
              Identity Verification
            </h2>

            <div className="space-y-6">
              {/* License Front */}
              <div>
                <Label className="text-lg font-semibold mb-3 block">Driver's License (Front) *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files[0], setLicenseFront)}
                    className="hidden"
                    id="license-front"
                  />
                  <label htmlFor="license-front" className="cursor-pointer">
                    {licenseFront ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle className="w-6 h-6" />
                        <span>Uploaded</span>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-600">Click to upload front of license</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* License Back */}
              <div>
                <Label className="text-lg font-semibold mb-3 block">Driver's License (Back) *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e.target.files[0], setLicenseBack)}
                    className="hidden"
                    id="license-back"
                  />
                  <label htmlFor="license-back" className="cursor-pointer">
                    {licenseBack ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle className="w-6 h-6" />
                        <span>Uploaded</span>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-600">Click to upload back of license</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Selfie */}
              <div>
                <Label className="text-lg font-semibold mb-3 block">Selfie for Verification *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={(e) => handleFileUpload(e.target.files[0], setSelfie)}
                    className="hidden"
                    id="selfie"
                  />
                  <label htmlFor="selfie" className="cursor-pointer">
                    {selfie ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle className="w-6 h-6" />
                        <span>Uploaded</span>
                      </div>
                    ) : (
                      <div>
                        <Camera className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-600">Take a selfie</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Insurance (if required or selected) */}
              {(vehicle.insurance_required || insuranceSelected) && (
                <div>
                  <Label className="text-lg font-semibold mb-3 block">Insurance Proof *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload(e.target.files[0], setInsuranceDoc)}
                      className="hidden"
                      id="insurance-doc"
                    />
                    <label htmlFor="insurance-doc" className="cursor-pointer">
                      {insuranceDoc ? (
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <CheckCircle className="w-6 h-6" />
                          <span>Uploaded</span>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p className="text-gray-600">Upload insurance proof</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              )}

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Your documents will be verified using AI. This typically takes just a few minutes.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 h-14 text-lg"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!licenseFront || !licenseBack || !selfie || ((vehicle.insurance_required || insuranceSelected) && !insuranceDoc)}
                  className="flex-1 h-14 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Continue to Review
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <Card className="p-8 border-none shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-600" />
              Review & Confirm
            </h2>

            <div className="space-y-6">
              <Card className="p-6 bg-gray-50 border-none">
                <h3 className="font-bold text-lg mb-4">Application Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle</span>
                    <span className="font-semibold">{vehicle.year} {vehicle.make} {vehicle.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contract Length</span>
                    <span className="font-semibold">{contractMonths} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Frequency</span>
                    <span className="font-semibold capitalize">{paymentFrequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Zip Code</span>
                    <span className="font-semibold">{zipCode}</span>
                  </div>
                  {companyName && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Company Name</span>
                      <span className="font-semibold">{companyName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Children on Subscription</span>
                    <span className="font-semibold">{childrenCount}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-none">
                <h3 className="font-bold text-lg mb-4">Payment Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Down Payment</span>
                    <span className="font-bold">${vehicle.down_payment?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Membership Subscription</span>
                    <span className="font-bold">${membershipFeeForDisplay.toLocaleString()}</span>
                  </div>
                  {insuranceSelected && (
                    <div className="flex justify-between">
                      <span>Insurance ({paymentFrequency})</span>
                      <span className="font-bold">${insurancePerPeriodForDisplay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  {childrenCount > 0 && (
                    <div className="flex justify-between">
                      <span>Children Fee ({paymentFrequency})</span>
                      <span className="font-bold">${childrenFeePerPeriodForDisplay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-3">
                    <span>First Payment ({paymentFrequency})</span>
                    <span className="font-bold text-blue-600">
                      ${nextPaymentAmountForDisplay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-3 text-lg">
                    <span className="font-bold">Due Today</span>
                    <span className="font-bold text-xl">
                      ${totalDueTodayForDisplay.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </Card>

              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>IMPORTANT:</strong> Down payment and membership subscription are NON-REFUNDABLE
                </AlertDescription>
              </Alert>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={setAgreedToTerms}
                />
                <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                  I agree to the <a href={createPageUrl("Terms")} target="_blank" className="text-blue-600 underline">Terms of Service</a> and understand that the down payment and membership subscription are non-refundable. I authorize STOCRX to verify my identity and process payments according to the subscription schedule.
                </label>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 h-14 text-lg"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!agreedToTerms || loading}
                  className="flex-1 h-14 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                >
                  {loading ? "Processing..." : "Submit Application"}
                  {!loading && <CheckCircle className="ml-2 w-5 h-5" />}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
