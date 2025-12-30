import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, Upload, FileText, Clipboard, DollarSign,
  AlertCircle, Calendar, Shield, Sparkles
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const ONBOARDING_STEPS = [
  { id: 1, name: "Welcome", icon: Sparkles, description: "Get started" },
  { id: 2, name: "Documents", icon: FileText, description: "Upload required docs" },
  { id: 3, name: "Background Check", icon: Shield, description: "Verification" },
  { id: 4, name: "Tax Forms", icon: Clipboard, description: "W-4 & I-9" },
  { id: 5, name: "Direct Deposit", icon: DollarSign, description: "Payment setup" }
];

export default function PreEmploymentOnboarding() {
  const [user, setUser] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const queryClient = useQueryClient();

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

  const { data: onboardingStatus } = useQuery({
    queryKey: ['pre-employment-status', user?.email],
    queryFn: async () => {
      const statuses = await base44.entities.PreEmploymentStatus.filter({
        applicant_email: user.email
      });
      
      if (statuses.length === 0) {
        // Create new onboarding record
        const newStatus = await base44.entities.PreEmploymentStatus.create({
          applicant_email: user.email,
          account_created: true,
          welcome_shown: false,
          onboarding_step: 0
        });
        setShowWelcome(true);
        return newStatus;
      }
      
      if (!statuses[0].welcome_shown) {
        setShowWelcome(true);
      }
      
      return statuses[0];
    },
    enabled: !!user
  });

  const updateOnboardingMutation = useMutation({
    mutationFn: (data) => base44.entities.PreEmploymentStatus.update(onboardingStatus.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['pre-employment-status']);
    }
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ file, docType }) => {
      const uploadResult = await base44.integrations.Core.UploadFile({ file });
      
      await base44.entities.Document.create({
        customer_email: user.email,
        document_type: docType,
        document_url: uploadResult.file_url,
        uploaded_by: user.email
      });

      const currentDocs = onboardingStatus.documents_submitted || [];
      await base44.entities.PreEmploymentStatus.update(onboardingStatus.id, {
        documents_submitted: [...currentDocs, docType]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pre-employment-status']);
      setSelectedFile(null);
    }
  });

  const dismissWelcomeMutation = useMutation({
    mutationFn: () => base44.entities.PreEmploymentStatus.update(onboardingStatus.id, {
      welcome_shown: true,
      onboarding_step: 1
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pre-employment-status']);
      setShowWelcome(false);
    }
  });

  if (!user || !onboardingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const progressPercent = (onboardingStatus.onboarding_step / 5) * 100;
  const currentStep = ONBOARDING_STEPS[onboardingStatus.onboarding_step - 1] || ONBOARDING_STEPS[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Modal */}
        {showWelcome && !onboardingStatus.welcome_shown && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <Card className="p-8 max-w-2xl w-full bg-gradient-to-br from-blue-600 to-purple-600 border-none text-white">
              <div className="text-center mb-6">
                <Sparkles className="w-16 h-16 mx-auto mb-4 animate-pulse" />
                <h1 className="text-4xl font-bold mb-2">Welcome to STOCRX! 🎉</h1>
                <p className="text-xl text-blue-100">
                  Congratulations on creating your account!
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4">What's Next?</h2>
                <ul className="space-y-3 text-blue-50">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    Complete pre-employment onboarding
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    Upload required documents
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    Set up direct deposit
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    Start your STOCRX journey!
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <Button
                  onClick={() => dismissWelcomeMutation.mutate()}
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 font-bold text-lg px-8"
                >
                  Let's Get Started!
                </Button>
                <p className="text-sm text-blue-100 mt-3">
                  This will only show once - you can find details in "How It Works" page
                </p>
              </div>
            </Card>
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Pre-Employment Onboarding</h1>
          <p className="text-gray-600">Complete these steps to join the STOCRX team</p>
        </div>

        {/* Progress Bar */}
        <Card className="p-6 mb-8 border-none shadow-lg">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-gray-900">
                Step {onboardingStatus.onboarding_step} of 5
              </span>
              <span className="text-sm font-semibold text-blue-600">
                {progressPercent.toFixed(0)}% Complete
              </span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>
          
          <div className="flex justify-between mt-6">
            {ONBOARDING_STEPS.map((step) => {
              const Icon = step.icon;
              const isCompleted = onboardingStatus.onboarding_step > step.id;
              const isCurrent = onboardingStatus.onboarding_step === step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    isCompleted ? 'bg-green-500' :
                    isCurrent ? 'bg-blue-600 animate-pulse' :
                    'bg-gray-300'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <Icon className={`w-6 h-6 ${isCurrent ? 'text-white' : 'text-gray-500'}`} />
                    )}
                  </div>
                  <p className={`text-xs font-semibold text-center ${
                    isCurrent ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {step.name}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Current Step Content */}
        {onboardingStatus.onboarding_step === 1 && (
          <Card className="p-8 border-none shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Step 1: Welcome to STOCRX</h2>
            <p className="text-gray-600 mb-6">
              You've successfully created your account! Now let's complete your onboarding process.
            </p>
            
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Important:</strong> You'll need the following documents ready:
                <ul className="list-disc ml-5 mt-2">
                  <li>Government-issued ID</li>
                  <li>Social Security Card</li>
                  <li>Banking information for direct deposit</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Button
              onClick={() => updateOnboardingMutation.mutate({ onboarding_step: 2 })}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Continue to Documents
            </Button>
          </Card>
        )}

        {onboardingStatus.onboarding_step === 2 && (
          <Card className="p-8 border-none shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Step 2: Upload Documents</h2>
            <p className="text-gray-600 mb-6">
              Please upload the required documents to continue
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {['drivers_license', 'social_security_card', 'void_check'].map((docType) => {
                const isUploaded = onboardingStatus.documents_submitted?.includes(docType);
                
                return (
                  <Card key={docType} className={`p-6 ${isUploaded ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900 capitalize">
                        {docType.replace('_', ' ')}
                      </h3>
                      {isUploaded && (
                        <Badge className="bg-green-600">Uploaded</Badge>
                      )}
                    </div>
                    
                    {!isUploaded && (
                      <>
                        <input
                          type="file"
                          onChange={(e) => setSelectedFile({ file: e.target.files[0], type: docType })}
                          className="hidden"
                          id={`upload-${docType}`}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                        <label htmlFor={`upload-${docType}`}>
                          <Button
                            type="button"
                            onClick={() => document.getElementById(`upload-${docType}`).click()}
                            variant="outline"
                            className="w-full"
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Select File
                          </Button>
                        </label>
                        
                        {selectedFile && selectedFile.type === docType && (
                          <Button
                            onClick={() => uploadDocumentMutation.mutate({
                              file: selectedFile.file,
                              docType: docType
                            })}
                            disabled={uploadDocumentMutation.isLoading}
                            className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
                          >
                            {uploadDocumentMutation.isLoading ? "Uploading..." : "Upload"}
                          </Button>
                        )}
                      </>
                    )}
                  </Card>
                );
              })}
            </div>

            {onboardingStatus.documents_submitted?.length >= 3 && (
              <Button
                onClick={() => updateOnboardingMutation.mutate({ 
                  onboarding_step: 3,
                  status: "background_check"
                })}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                Continue to Background Check
              </Button>
            )}
          </Card>
        )}

        {onboardingStatus.onboarding_step === 3 && (
          <Card className="p-8 border-none shadow-lg text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-blue-600" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Step 3: Background Check</h2>
            <p className="text-gray-600 mb-6">
              We're processing your background check. This typically takes 2-3 business days.
            </p>
            
            <Badge className="bg-yellow-600 text-white text-lg px-6 py-3 mb-6">
              {onboardingStatus.background_check_status.toUpperCase()}
            </Badge>

            <p className="text-sm text-gray-500 mb-6">
              You'll receive an email once the background check is complete
            </p>

            <Button
              onClick={() => updateOnboardingMutation.mutate({ 
                onboarding_step: 4,
                background_check_status: "cleared"
              })}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Continue (For Testing)
            </Button>
          </Card>
        )}

        {onboardingStatus.onboarding_step === 4 && (
          <Card className="p-8 border-none shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Step 4: Tax Forms</h2>
            <p className="text-gray-600 mb-6">
              Complete your W-4 and I-9 forms
            </p>

            <div className="space-y-6 mb-8">
              <Card className="p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">W-4 Form (Tax Withholding)</h3>
                  <Badge className={onboardingStatus.w4_completed ? 'bg-green-600' : 'bg-gray-600'}>
                    {onboardingStatus.w4_completed ? 'Completed' : 'Pending'}
                  </Badge>
                </div>
                {!onboardingStatus.w4_completed && (
                  <Button
                    onClick={() => updateOnboardingMutation.mutate({ w4_completed: true })}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Complete W-4
                  </Button>
                )}
              </Card>

              <Card className="p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">I-9 Form (Employment Eligibility)</h3>
                  <Badge className={onboardingStatus.i9_completed ? 'bg-green-600' : 'bg-gray-600'}>
                    {onboardingStatus.i9_completed ? 'Completed' : 'Pending'}
                  </Badge>
                </div>
                {!onboardingStatus.i9_completed && (
                  <Button
                    onClick={() => updateOnboardingMutation.mutate({ i9_completed: true })}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Complete I-9
                  </Button>
                )}
              </Card>
            </div>

            {onboardingStatus.w4_completed && onboardingStatus.i9_completed && (
              <Button
                onClick={() => updateOnboardingMutation.mutate({ onboarding_step: 5 })}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                Continue to Direct Deposit
              </Button>
            )}
          </Card>
        )}

        {onboardingStatus.onboarding_step === 5 && (
          <Card className="p-8 border-none shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Step 5: Direct Deposit Setup</h2>
            <p className="text-gray-600 mb-6">
              Set up your direct deposit for payroll
            </p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name
                </label>
                <Input placeholder="e.g., Chase Bank" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Routing Number
                </label>
                <Input placeholder="9 digits" maxLength="9" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number
                </label>
                <Input placeholder="Your account number" />
              </div>
            </div>

            <Button
              onClick={() => updateOnboardingMutation.mutate({
                direct_deposit_setup: true,
                onboarding_completed: true,
                status: "ready_to_start"
              })}
              size="lg"
              className="bg-green-600 hover:bg-green-700 w-full"
            >
              Complete Onboarding
            </Button>
          </Card>
        )}

        {onboardingStatus.onboarding_completed && (
          <Card className="p-8 border-none shadow-lg text-center bg-gradient-to-br from-green-50 to-blue-50">
            <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-600" />
            <h2 className="text-4xl font-bold text-gray-900 mb-4">🎉 Onboarding Complete!</h2>
            <p className="text-xl text-gray-600 mb-6">
              You're all set to start at STOCRX!
            </p>
            
            <div className="bg-white rounded-lg p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4">What's Next?</h3>
              <ul className="text-left space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Wait for your start date confirmation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  You'll receive an email with next steps
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Your supervisor will contact you soon
                </li>
              </ul>
            </div>

            <Button
              onClick={() => window.location.href = '/'}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to Homepage
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}