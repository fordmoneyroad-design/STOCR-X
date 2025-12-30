import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, Smartphone, DollarSign, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MakePayment() {
  const [user, setUser] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Payment details
  const [cardNumber, setCardNumber] = useState("");
  const [cashAppTag, setCashAppTag] = useState("");
  const [applePayEmail, setApplePayEmail] = useState("");
  const [googlePayEmail, setGooglePayEmail] = useState("");

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

  const { data: subscriptions } = useQuery({
    queryKey: ['subscriptions', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ customer_email: user?.email }, "-created_date"),
    enabled: !!user,
    initialData: []
  });

  const activeSubscription = subscriptions?.find(sub => sub.status === "active" || sub.status === "pending");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !activeSubscription) return;

    setLoading(true);
    setError(null);

    try {
      // Create payment record with pending approval
      await base44.entities.Payment.create({
        subscription_id: activeSubscription.id,
        amount: parseFloat(amount),
        payment_type: "subscription",
        status: "pending",
        payment_method: paymentMethod,
        notes: `${paymentMethod}: ${
          paymentMethod === "credit_card" ? cardNumber :
          paymentMethod === "cash_app" ? cashAppTag :
          paymentMethod === "apple_pay" ? applePayEmail :
          googlePayEmail
        }`
      });

      // Send email notification to admin
      await base44.integrations.Core.SendEmail({
        to: "stocrx@gmail.com",
        subject: `Payment Pending Approval - ${user.email}`,
        body: `
          Payment Details:
          - Customer: ${user.email}
          - Amount: $${amount}
          - Payment Method: ${paymentMethod}
          - Details: ${
            paymentMethod === "credit_card" ? `Card: ${cardNumber}` :
            paymentMethod === "cash_app" ? `Cash App: ${cashAppTag}` :
            paymentMethod === "apple_pay" ? `Apple Pay: ${applePayEmail}` :
            `Google Pay: ${googlePayEmail}`
          }
          
          Please review and approve/deny this payment.
        `
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.href = createPageUrl("MyAccount");
      }, 3000);
    } catch (err) {
      setError("Error submitting payment. Please try again.");
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Make a Payment
          </h1>
          <p className="text-gray-600">
            Submit your payment for manual approval
          </p>
        </div>

        {success ? (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Payment submitted successfully! We'll review and approve it shortly. Redirecting...
            </AlertDescription>
          </Alert>
        ) : error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        {activeSubscription && (
          <Card className="p-8 border-none shadow-xl">
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-4">Next Payment Due</h3>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-3xl font-bold text-blue-600">
                  ${activeSubscription.next_payment_amount?.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Due: {activeSubscription.next_payment_date && new Date(activeSubscription.next_payment_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label className="text-lg font-semibold mb-3 block">Payment Amount</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="h-12 text-lg"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <Label className="text-lg font-semibold mb-3 block">Payment Method</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="credit_card" id="credit" />
                      <Label htmlFor="credit" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                        <span>Credit/Debit Card</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="apple_pay" id="apple" />
                      <Label htmlFor="apple" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Smartphone className="w-5 h-5 text-gray-700" />
                        <span>Apple Pay</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="cash_app" id="cash" />
                      <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span>Cash App</span>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value="google_pay" id="google" />
                      <Label htmlFor="google" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Smartphone className="w-5 h-5 text-red-600" />
                        <span>Google Pay</span>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Payment Details */}
              <div>
                <Label className="text-lg font-semibold mb-3 block">Payment Details</Label>
                {paymentMethod === "credit_card" && (
                  <Input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="Card number (last 4 digits)"
                    className="h-12"
                    required
                  />
                )}
                {paymentMethod === "cash_app" && (
                  <Input
                    value={cashAppTag}
                    onChange={(e) => setCashAppTag(e.target.value)}
                    placeholder="Your Cash App tag ($username)"
                    className="h-12"
                    required
                  />
                )}
                {paymentMethod === "apple_pay" && (
                  <Input
                    value={applePayEmail}
                    onChange={(e) => setApplePayEmail(e.target.value)}
                    placeholder="Apple Pay email"
                    type="email"
                    className="h-12"
                    required
                  />
                )}
                {paymentMethod === "google_pay" && (
                  <Input
                    value={googlePayEmail}
                    onChange={(e) => setGooglePayEmail(e.target.value)}
                    placeholder="Google Pay email"
                    type="email"
                    className="h-12"
                    required
                  />
                )}
              </div>

              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Your payment will be manually reviewed and approved by our team. You'll receive a confirmation email once approved.
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                disabled={loading || !amount}
                className="w-full h-14 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                {loading ? "Submitting..." : "Submit Payment for Approval"}
              </Button>
            </form>
          </Card>
        )}

        {!activeSubscription && (
          <Card className="p-12 text-center border-none shadow-xl">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Active Subscription</h3>
            <p className="text-gray-600 mb-6">You don't have an active subscription to make payments for.</p>
            <Button onClick={() => window.location.href = createPageUrl("BrowseCars")}>
              Browse Available Cars
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}