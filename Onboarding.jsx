
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle, Video, Shield, FileText } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function Onboarding() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [aiVideoContent, setAiVideoContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  
  const urlParams = new URLSearchParams(window.location.search);
  const returnTo = urlParams.get('returnTo');
  const vehicleId = urlParams.get('vehicleId');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.onboarding_completed) {
          // Redirect to return URL or home
          window.location.href = returnTo || createPageUrl("Home");
          return;
        }
        setUser(currentUser);
        generateWelcomeVideo();
      } catch (err) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, [returnTo]);

  const generateWelcomeVideo = async () => {
    setLoading(true);
    try {
      const videoScript = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a compelling, authentic welcome video script for STOCRX - a subscription-to-own car platform.

        Include:
        1. Warm welcome message
        2. Our mission: Making car ownership accessible through flexible subscriptions
        3. How it works: Subscribe, build equity, own your car
        4. Key benefits: No credit checks, flexible terms, early buyout options
        5. Real customer success story (make it feel genuine)
        6. Our values: Transparency, flexibility, customer-first
        7. What to expect next
        
        Make it feel like a real founder talking to a new customer. Include pauses, emphasis, and personality.
        Format as a narrative script, 2-3 minutes when spoken.`,
        add_context_from_internet: false
      });

      setAiVideoContent(videoScript);
    } catch (error) {
      console.error(error);
      setAiVideoContent("Welcome to STOCRX! We're excited to have you join us on your journey to car ownership...");
    }
    setLoading(false);
  };

  const handleComplete = async () => {
    if (!agreed) {
      alert("Please agree to the platform rules to continue");
      return;
    }

    setLoading(true);
    try {
      await base44.auth.updateMe({
        onboarding_completed: true,
        rules_agreed: true
      });

      // Redirect based on context
      if (vehicleId) {
        window.location.href = createPageUrl("CarDetails") + `?id=${vehicleId}`;
      } else if (returnTo) {
        window.location.href = returnTo;
      } else {
        window.location.href = createPageUrl("BrowseCars");
      }
    } catch (error) {
      console.error(error);
      alert("Error completing onboarding");
    }
    setLoading(false);
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Preparing your welcome...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Step 1: Welcome Video */}
        {step === 1 && (
          <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20 text-white">
            <div className="text-center mb-8">
              <Video className="w-16 h-16 mx-auto mb-4 text-blue-300" />
              <h1 className="text-4xl font-bold mb-2">Welcome to STOCRX, {user.full_name || 'Friend'}!</h1>
              <p className="text-xl text-blue-200">Your journey to car ownership starts here</p>
            </div>

            {/* AI-Generated Video Content */}
            <div className="bg-black/30 rounded-xl p-8 mb-8 border-2 border-blue-400">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300">AI-Generated Welcome Message</span>
                </div>
                <div className="prose prose-invert max-w-none">
                  <div className="text-lg leading-relaxed whitespace-pre-wrap">
                    {aiVideoContent}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-4 pt-6 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm">No Credit Checks</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm">Flexible Terms</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-sm">Own in 3-6 Months</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setStep(2)}
              className="w-full h-16 text-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Continue
            </Button>
          </Card>
        )}

        {/* Step 2: Platform Rules */}
        {step === 2 && (
          <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20 text-white">
            <div className="text-center mb-8">
              <Shield className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
              <h2 className="text-3xl font-bold mb-2">Platform Rules & Guidelines</h2>
              <p className="text-lg text-blue-200">Please read and agree to continue</p>
            </div>

            <div className="bg-black/30 rounded-xl p-8 mb-8 max-h-96 overflow-y-auto">
              <div className="space-y-6 text-lg">
                <div>
                  <h3 className="font-bold text-yellow-300 mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    1. Payment Obligations
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 ml-4">
                    <li>All down payments and membership fees are NON-REFUNDABLE</li>
                    <li>Subscription payments must be made on time</li>
                    <li>Late payments incur additional fees</li>
                    <li>3 late payments may result in vehicle repossession</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-yellow-300 mb-2">2. Vehicle Care</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 ml-4">
                    <li>You are responsible for vehicle maintenance</li>
                    <li>Insurance is required (unless you're military VIP)</li>
                    <li>Report any accidents within 24 hours</li>
                    <li>Vehicle must be returned in similar condition</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-yellow-300 mb-2">3. Ownership Path</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 ml-4">
                    <li>Every payment builds equity toward ownership</li>
                    <li>Early buyout available with 25% discount</li>
                    <li>Contract completion transfers full ownership</li>
                    <li>Title transfer processed within 30 days</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-yellow-300 mb-2">4. Account Integrity</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 ml-4">
                    <li>One account per email address</li>
                    <li>Identity verification required</li>
                    <li>Provide accurate information</li>
                    <li>Account sharing is prohibited</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-yellow-300 mb-2">5. Prohibited Activities</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 ml-4">
                    <li>No illegal use of vehicles</li>
                    <li>No subletting or renting to others</li>
                    <li>No modifications without approval</li>
                    <li>No fraudulent documentation</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-yellow-300 mb-2">6. Termination</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 ml-4">
                    <li>STOCRX reserves the right to terminate accounts for violations</li>
                    <li>Down payments and fees remain non-refundable</li>
                    <li>Vehicle must be returned immediately upon termination</li>
                  </ul>
                </div>

                <div className="border-t border-white/20 pt-6">
                  <h3 className="font-bold text-green-300 mb-2">Our Commitment to You</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300 ml-4">
                    <li>Transparent pricing - no hidden fees</li>
                    <li>24/7 customer support</li>
                    <li>Fair treatment and respect</li>
                    <li>Clear path to ownership</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 mb-6 p-4 bg-yellow-900/30 rounded-lg border border-yellow-500">
              <Checkbox
                id="agree"
                checked={agreed}
                onCheckedChange={setAgreed}
                className="mt-1"
              />
              <label htmlFor="agree" className="cursor-pointer text-lg">
                I have read, understood, and agree to abide by all STOCRX platform rules and guidelines. I understand that violations may result in account termination and forfeiture of payments.
              </label>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 h-14 text-lg border-white/30 text-white hover:bg-white/10"
              >
                Back
              </Button>
              <Button
                onClick={handleComplete}
                disabled={!agreed || loading}
                className="flex-1 h-14 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                {loading ? "Processing..." : "Complete Onboarding"}
                <CheckCircle className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
