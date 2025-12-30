import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Send password reset email
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: "STOCRX Password Reset Request",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Password Reset Request</h1>
            </div>
            <div style="padding: 30px; background: white;">
              <p>Hello,</p>
              <p>We received a request to reset your password for your STOCRX account.</p>
              
              <p><strong>Your email:</strong> ${email}</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1f2937;">What to do next:</h3>
                <ol style="color: #4b5563; line-height: 1.8;">
                  <li>Contact STOCRX support to verify your identity</li>
                  <li>Provide proof of account ownership (ID, subscription info, etc.)</li>
                  <li>Admin will reset your password and email you new credentials</li>
                  <li>Log in with new password and change it immediately</li>
                </ol>
              </div>
              
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e;">
                  <strong>⚠️ Security Note:</strong> For your protection, password resets require admin verification. 
                  This prevents unauthorized access to your account.
                </p>
              </div>
              
              <p><strong>Contact Support:</strong></p>
              <ul style="list-style: none; padding: 0;">
                <li>📧 Email: <a href="mailto:support@stocrx.com">support@stocrx.com</a></li>
                <li>📱 Call: 1-800-STOCRX</li>
                <li>💬 Live Chat: <a href="${window.location.origin}/app/SupportLiveChat">Visit Support</a></li>
              </ul>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                If you didn't request this password reset, please ignore this email or contact support if you're concerned about account security.
              </p>
            </div>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
              <p>© 2025 STOCRX INC. All rights reserved.</p>
            </div>
          </div>
        `
      });

      // Notify admin
      await base44.integrations.Core.SendEmail({
        to: "fordmoneyroad@gmail.com",
        subject: `🔐 Password Reset Request - ${email}`,
        body: `
          Password reset requested for: ${email}
          
          Time: ${new Date().toLocaleString()}
          
          Action Required:
          1. Verify user identity
          2. Check account status
          3. Reset password via Account Recovery page
          4. Send new credentials to user
          
          Go to: ${window.location.origin}/app/AccountRecovery
        `
      });

      // Log activity
      await base44.entities.ActivityLog.create({
        user_email: email,
        action_type: "password_reset_request",
        action_details: `Password reset requested for ${email}`
      });

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Failed to send reset email. Please try again or contact support.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="p-8 bg-gray-800 border-gray-700">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-400">
              Enter your email and we'll help you reset your password
            </p>
          </div>

          {success ? (
            <div className="space-y-6">
              <Alert className="bg-green-900 border-green-700">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-200">
                  <strong>Request Sent!</strong> Check your email for next steps.
                </AlertDescription>
              </Alert>

              <div className="bg-gray-700 p-6 rounded-lg">
                <h3 className="font-bold text-white mb-4">What happens next?</h3>
                <ol className="space-y-3 text-gray-300 text-sm">
                  <li className="flex gap-3">
                    <span className="font-bold text-blue-400">1.</span>
                    <span>You'll receive an email with instructions</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-blue-400">2.</span>
                    <span>Contact support to verify your identity</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-blue-400">3.</span>
                    <span>Admin will reset your password</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-blue-400">4.</span>
                    <span>You'll receive new login credentials</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-blue-400">5.</span>
                    <span>Log in and change your password</span>
                  </li>
                </ol>
              </div>

              <div className="text-center">
                <Button
                  onClick={() => window.location.href = createPageUrl("SupportLiveChat")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Contact Support Now
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="bg-red-900 border-red-700">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-200">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div>
                <label className="text-gray-300 text-sm mb-2 block">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  className="bg-gray-700 border-gray-600 text-white h-12"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter the email address associated with your STOCRX account
                </p>
              </div>

              <Alert className="bg-blue-900 border-blue-700">
                <Mail className="h-4 w-4 text-blue-400" />
                <AlertDescription className="text-blue-200">
                  <strong>Security:</strong> Password resets require admin verification to protect your account.
                </AlertDescription>
              </Alert>

              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
              >
                {loading ? "Sending..." : "Send Reset Instructions"}
              </Button>

              <div className="text-center text-sm">
                <p className="text-gray-400 mb-2">
                  Remember your password?
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => base44.auth.redirectToLogin()}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Back to Login
                </Button>
              </div>
            </form>
          )}
        </Card>

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>Need immediate help?</p>
          <p className="mt-2">
            Contact: <a href="mailto:support@stocrx.com" className="text-blue-400 hover:text-blue-300">support@stocrx.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}