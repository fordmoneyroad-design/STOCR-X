import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Briefcase, Upload, CheckCircle, AlertCircle, UserPlus, ArrowLeft } from "lucide-react";

export default function CareerApplication() {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(true);
  const [formData, setFormData] = useState({
    applicant_name: "",
    applicant_email: "",
    applicant_phone: "",
    position_applied: "",
    department: "operations",
    years_experience: "",
    why_join: "",
    availability: ""
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showAccountPrompt, setShowAccountPrompt] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
          setIsGuest(false);
          setFormData({
            ...formData,
            applicant_name: currentUser.full_name || "",
            applicant_email: currentUser.email || ""
          });
        }
      } catch (err) {
        // Guest mode
        setIsGuest(true);
      }
    };
    checkAuth();
  }, []);

  const submitApplicationMutation = useMutation({
    mutationFn: async () => {
      let resumeUrl = "";
      
      if (resumeFile) {
        const uploadResult = await base44.integrations.Core.UploadFile({ file: resumeFile });
        resumeUrl = uploadResult.file_url;
      }

      const autoDeleteDate = new Date();
      autoDeleteDate.setDate(autoDeleteDate.getDate() + 30);

      const application = await base44.entities.CareerApplication.create({
        ...formData,
        resume_url: resumeUrl,
        status: "pending",
        days_until_deletion: 30,
        auto_delete_date: autoDeleteDate.toISOString().split('T')[0]
      });

      // Send confirmation to applicant
      await base44.integrations.Core.SendEmail({
        to: formData.applicant_email,
        subject: "Application Received - STOCRX Careers",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Application Received! ✅</h1>
            </div>
            <div style="padding: 30px; background: white;">
              <p>Dear ${formData.applicant_name},</p>
              <p>Thank you for applying for the <strong>${formData.position_applied}</strong> position at STOCRX!</p>
              
              <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #374151;"><strong>Application Details:</strong></p>
                <p style="margin: 5px 0 0 0; color: #6b7280;">Position: ${formData.position_applied}</p>
                <p style="margin: 5px 0 0 0; color: #6b7280;">Department: ${formData.department}</p>
                <p style="margin: 5px 0 0 0; color: #6b7280;">Status: Under Review</p>
              </div>

              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e;"><strong>⏰ Important:</strong></p>
                <p style="margin: 5px 0 0 0; color: #92400e; font-size: 14px;">
                  Your application will be automatically deleted after 30 days if not reviewed.
                  We typically review applications within 1-2 weeks.
                </p>
              </div>

              ${!user ? `
              <div style="background: #dbeafe; border: 2px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: bold;">💡 Create a STOCRX Account</p>
                <p style="margin: 0 0 15px 0; color: #1e3a8a; font-size: 14px;">
                  Track your application status and start pre-employment onboarding!
                </p>
                <a href="${process.env.APP_URL || window.location.origin}/app/PreEmploymentOnboarding" 
                   style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Create Account Now
                </a>
              </div>
              ` : ''}

              <p>What happens next:</p>
              <ol style="color: #374151;">
                <li>Our hiring team will review your application</li>
                <li>If selected, we'll contact you for an interview</li>
                <li>Background check and onboarding (if hired)</li>
              </ol>

              <p>Thank you for your interest in joining the STOCRX team!</p>
              <p>Best regards,<br/>STOCRX Careers Team</p>
            </div>
          </div>
        `
      });

      // Notify admin
      await base44.integrations.Core.SendEmail({
        to: "fordmoneyroad@gmail.com",
        subject: `New Application: ${formData.position_applied}`,
        body: `
          New Career Application Received
          
          Applicant: ${formData.applicant_name}
          Email: ${formData.applicant_email}
          Phone: ${formData.applicant_phone}
          Position: ${formData.position_applied}
          Department: ${formData.department}
          Experience: ${formData.years_experience}
          
          ${!user ? '⚠️ Guest Application - User has no account' : '✅ User has STOCRX account'}
          
          Auto-delete date: ${autoDeleteDate.toLocaleDateString()}
          
          View in Hire or Fire: ${process.env.APP_URL || window.location.origin}/app/HireOrFire
        `
      });

      return application;
    },
    onSuccess: () => {
      setSuccess(true);
      if (isGuest) {
        setShowAccountPrompt(true);
      }
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitApplicationMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-8">
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Apply to Join STOCRX</h1>
          <p className="text-xl text-gray-600">Start your career with us today</p>
          {isGuest && (
            <Badge className="mt-3 bg-blue-600 text-white px-4 py-2">
              ✨ No Account Required
            </Badge>
          )}
        </div>

        {/* Success Message with Account Prompt */}
        {success && showAccountPrompt && (
          <Card className="p-8 mb-8 bg-gradient-to-br from-green-50 to-blue-50 border-none shadow-xl">
            <div className="text-center mb-6">
              <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-600" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Application Submitted! 🎉</h2>
              <p className="text-gray-600">
                We've received your application and will review it within 1-2 weeks.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 border-2 border-blue-300 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <UserPlus className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Create Your STOCRX Account</h3>
                  <p className="text-sm text-gray-600">Unlock these benefits:</p>
                </div>
              </div>
              
              <ul className="space-y-2 mb-6 text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  Track your application status in real-time
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  Start pre-employment onboarding immediately
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  Upload documents ahead of time
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  Receive instant notifications
                </li>
              </ul>

              <Button
                onClick={() => {
                  base44.auth.redirectToLogin(window.location.origin + "/app/PreEmploymentOnboarding");
                }}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Create Account & Start Onboarding
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-500 mb-3">
                Or continue without an account (you can create one later)
              </p>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
              >
                Return to Homepage
              </Button>
            </div>
          </Card>
        )}

        {!success && (
          <Card className="p-8 border-none shadow-xl">
            <Alert className="mb-6 bg-orange-50 border-orange-200">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Important:</strong> Applications are automatically deleted after 30 days if not reviewed. 
                We typically respond within 1-2 weeks.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <Input
                    value={formData.applicant_name}
                    onChange={(e) => setFormData({...formData, applicant_name: e.target.value})}
                    required
                    placeholder="John Doe"
                    disabled={!isGuest}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.applicant_email}
                    onChange={(e) => setFormData({...formData, applicant_email: e.target.value})}
                    required
                    placeholder="john@example.com"
                    disabled={!isGuest}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={formData.applicant_phone}
                    onChange={(e) => setFormData({...formData, applicant_phone: e.target.value})}
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position Applying For *
                  </label>
                  <Input
                    value={formData.position_applied}
                    onChange={(e) => setFormData({...formData, position_applied: e.target.value})}
                    required
                    placeholder="e.g., Fleet Coordinator"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full p-2 border rounded-lg"
                    required
                  >
                    <option value="incidents">Incidents & Roadside</option>
                    <option value="operations">Operations & E-commerce</option>
                    <option value="fleet">Fleet & Logistics</option>
                    <option value="finance">Finance & HR</option>
                    <option value="support">Customer Support</option>
                    <option value="marketing">Marketing</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <Input
                    value={formData.years_experience}
                    onChange={(e) => setFormData({...formData, years_experience: e.target.value})}
                    placeholder="e.g., 3 years"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    When Can You Start?
                  </label>
                  <Input
                    value={formData.availability}
                    onChange={(e) => setFormData({...formData, availability: e.target.value})}
                    placeholder="e.g., Immediately, 2 weeks notice"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Why Do You Want to Join STOCRX? *
                  </label>
                  <Textarea
                    value={formData.why_join}
                    onChange={(e) => setFormData({...formData, why_join: e.target.value})}
                    required
                    placeholder="Tell us what interests you about this position and our company..."
                    className="h-32"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Resume (Optional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                    accept=".pdf,.doc,.docx"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Accepted formats: PDF, DOC, DOCX
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitApplicationMutation.isLoading}
                className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
              >
                {submitApplicationMutation.isLoading ? (
                  "Submitting..."
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Submit Application
                  </>
                )}
              </Button>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}