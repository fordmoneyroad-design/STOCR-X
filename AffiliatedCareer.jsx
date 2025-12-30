import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  UserPlus, TrendingUp, DollarSign, Users, Star, 
  CheckCircle, ArrowRight, Zap, Target, Award
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AffiliatedCareer() {
  const [user, setUser] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    affiliate_name: "",
    affiliate_email: "",
    phone: "",
    program_type: "sales_affiliate",
    why_join: "",
    experience: "",
    social_media: {
      instagram: "",
      facebook: "",
      twitter: "",
      tiktok: "",
      youtube: ""
    }
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
          setFormData(prev => ({
            ...prev,
            affiliate_name: currentUser.full_name || "",
            affiliate_email: currentUser.email || ""
          }));
        }
      } catch (err) {
        // Not authenticated
      }
    };
    checkAuth();
  }, []);

  const applyMutation = useMutation({
    mutationFn: async (data) => {
      // Generate unique referral code
      const referralCode = `STOCRX${Date.now().toString(36).toUpperCase()}`;
      
      // Create affiliate application
      const affiliate = await base44.entities.AffiliateProgram.create({
        ...data,
        referral_code: referralCode,
        status: "pending_approval",
        agreement_signed: true
      });

      // Create payroll request
      await base44.entities.PayrollRequest.create({
        employee_email: data.affiliate_email,
        employee_name: data.affiliate_name,
        request_type: "affiliate_addition",
        department: data.program_type,
        payment_structure: "commission",
        justification: `New affiliate application: ${data.program_type}`,
        requested_by: data.affiliate_email,
        related_entity_id: affiliate.id,
        entity_type: "AffiliateProgram",
        priority: "medium"
      });

      // Send confirmation email
      await base44.integrations.Core.SendEmail({
        to: data.affiliate_email,
        subject: "STOCRX Affiliate Application Received",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">🎉 Application Received!</h1>
            </div>
            <div style="padding: 30px; background: white;">
              <p>Dear ${data.affiliate_name},</p>
              
              <p>Thank you for applying to the <strong>STOCRX Affiliate Program</strong>!</p>
              
              <h3>Application Details:</h3>
              <ul>
                <li><strong>Program:</strong> ${data.program_type.replace('_', ' ').toUpperCase()}</li>
                <li><strong>Your Referral Code:</strong> ${referralCode}</li>
                <li><strong>Status:</strong> Pending Super Admin Approval</li>
              </ul>

              <div style="background: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0;">
                <h3 style="color: #1976D2; margin-top: 0;">💰 Earning Potential</h3>
                <ul style="color: #1565C0;">
                  <li>5-15% commission per referral</li>
                  <li>Bonus for high performers</li>
                  <li>Monthly payouts</li>
                  <li>Performance-based raises</li>
                </ul>
              </div>

              <h3>What's Next?</h3>
              <ol>
                <li>Super Admin will review your application</li>
                <li>You'll receive approval within 2-3 business days</li>
                <li>Once approved, you'll get access to your dashboard</li>
                <li>Start earning commissions immediately!</li>
              </ol>

              <p>We'll notify you once your application is approved.</p>

              <p>Best regards,<br/>STOCRX Affiliate Team</p>
            </div>
          </div>
        `
      });

      // Notify super admin
      await base44.integrations.Core.SendEmail({
        to: "fordmoneyroad@gmail.com",
        subject: `New Affiliate Application - ${data.affiliate_name}`,
        body: `
          New affiliate application requires your approval:
          
          Name: ${data.affiliate_name}
          Email: ${data.affiliate_email}
          Program: ${data.program_type}
          
          Login to review: https://stocrx.com/AffiliateManagement
        `
      });

      return affiliate;
    },
    onSuccess: () => {
      setSubmitted(true);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    applyMutation.mutate(formData);
  };

  const programs = [
    {
      type: "sales_affiliate",
      title: "Sales Affiliate",
      commission: "10-15%",
      icon: TrendingUp,
      description: "Earn commission on every vehicle sale you refer",
      benefits: ["High commission rate", "Recurring income", "Performance bonuses", "No cap on earnings"]
    },
    {
      type: "marketing_partner",
      title: "Marketing Partner",
      commission: "8-12%",
      icon: Target,
      description: "Promote STOCRX through your marketing channels",
      benefits: ["Flexible schedule", "Marketing materials provided", "Training included", "Team support"]
    },
    {
      type: "influencer",
      title: "Influencer / Content Creator",
      commission: "5-10%",
      icon: Star,
      description: "Create content and share your unique referral code",
      benefits: ["Creative freedom", "Exclusive content access", "Brand partnership", "Growing audience"]
    },
    {
      type: "referral_agent",
      title: "Referral Agent",
      commission: "5-8%",
      icon: Users,
      description: "Simply refer customers and earn passive income",
      benefits: ["Easy to start", "No experience needed", "Work from anywhere", "Part-time friendly"]
    },
    {
      type: "brand_ambassador",
      title: "Brand Ambassador",
      commission: "8-12%",
      icon: Award,
      description: "Represent STOCRX at events and in your community",
      benefits: ["Event opportunities", "Networking", "Free merchandise", "Leadership path"]
    }
  ];

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full p-12 bg-white text-center">
          <CheckCircle className="w-20 h-20 mx-auto mb-6 text-green-600" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Application Submitted!</h1>
          <p className="text-xl text-gray-600 mb-6">
            Your affiliate application is being reviewed by our Super Admin team.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-blue-900 mb-2">What Happens Next?</h3>
            <ul className="text-left text-blue-800 space-y-2">
              <li>✅ Application review (1-3 business days)</li>
              <li>📧 Email notification when approved</li>
              <li>🎯 Access to your affiliate dashboard</li>
              <li>💰 Start earning commissions immediately</li>
            </ul>
          </div>
          <Button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="bg-purple-600 text-white px-6 py-2 text-lg mb-4">
            💼 Join Our Team
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            STOCRX Affiliate Program
          </h1>
          <p className="text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Earn commission by referring customers to STOCRX. Turn your network into income!
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="flex items-center gap-2 text-white">
              <DollarSign className="w-6 h-6 text-green-400" />
              <span className="text-xl font-semibold">5-15% Commission</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Zap className="w-6 h-6 text-yellow-400" />
              <span className="text-xl font-semibold">Fast Approval</span>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Users className="w-6 h-6 text-blue-400" />
              <span className="text-xl font-semibold">Growing Community</span>
            </div>
          </div>
        </div>

        {/* Program Options */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Choose Your Program</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => {
              const Icon = program.icon;
              return (
                <Card
                  key={program.type}
                  className={`p-6 cursor-pointer transition-all ${
                    formData.program_type === program.type
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600 border-blue-400 text-white'
                      : 'bg-gray-800 border-gray-700 hover:border-blue-500'
                  }`}
                  onClick={() => setFormData({...formData, program_type: program.type})}
                >
                  <Icon className={`w-12 h-12 mb-4 ${
                    formData.program_type === program.type ? 'text-white' : 'text-blue-400'
                  }`} />
                  <h3 className={`text-xl font-bold mb-2 ${
                    formData.program_type === program.type ? 'text-white' : 'text-white'
                  }`}>
                    {program.title}
                  </h3>
                  <Badge className={`mb-3 ${
                    formData.program_type === program.type ? 'bg-white text-blue-600' : 'bg-green-600'
                  }`}>
                    {program.commission} Commission
                  </Badge>
                  <p className={`text-sm mb-4 ${
                    formData.program_type === program.type ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {program.description}
                  </p>
                  <ul className="space-y-2">
                    {program.benefits.map((benefit, idx) => (
                      <li key={idx} className={`text-sm flex items-center gap-2 ${
                        formData.program_type === program.type ? 'text-blue-100' : 'text-gray-300'
                      }`}>
                        <CheckCircle className="w-4 h-4" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Application Form */}
        <Card className="p-8 bg-gray-800 border-gray-700 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-2">
            <UserPlus className="w-8 h-8 text-green-400" />
            Apply Now
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Full Name *</label>
                <Input
                  value={formData.affiliate_name}
                  onChange={(e) => setFormData({...formData, affiliate_name: e.target.value})}
                  required
                  placeholder="John Doe"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Email *</label>
                <Input
                  type="email"
                  value={formData.affiliate_email}
                  onChange={(e) => setFormData({...formData, affiliate_email: e.target.value})}
                  required
                  placeholder="john@example.com"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-2 block">Phone Number *</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
                placeholder="(555) 123-4567"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-2 block">Why do you want to join? *</label>
              <Textarea
                value={formData.why_join}
                onChange={(e) => setFormData({...formData, why_join: e.target.value})}
                required
                placeholder="Tell us why you're interested in the STOCRX affiliate program..."
                className="bg-gray-700 border-gray-600 text-white h-24"
              />
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-2 block">Relevant Experience</label>
              <Textarea
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                placeholder="Previous sales, marketing, or affiliate experience..."
                className="bg-gray-700 border-gray-600 text-white h-24"
              />
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-2 block">Social Media (Optional)</label>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  value={formData.social_media.instagram}
                  onChange={(e) => setFormData({...formData, social_media: {...formData.social_media, instagram: e.target.value}})}
                  placeholder="Instagram username"
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Input
                  value={formData.social_media.facebook}
                  onChange={(e) => setFormData({...formData, social_media: {...formData.social_media, facebook: e.target.value}})}
                  placeholder="Facebook profile"
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Input
                  value={formData.social_media.tiktok}
                  onChange={(e) => setFormData({...formData, social_media: {...formData.social_media, tiktok: e.target.value}})}
                  placeholder="TikTok username"
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <Input
                  value={formData.social_media.youtube}
                  onChange={(e) => setFormData({...formData, social_media: {...formData.social_media, youtube: e.target.value}})}
                  placeholder="YouTube channel"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <Alert className="bg-blue-900/30 border-blue-700">
              <AlertDescription className="text-blue-200">
                <strong>Note:</strong> Your application will be reviewed by our Super Admin team. 
                Once approved, you'll be added to payroll and can start earning commissions immediately!
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              disabled={applyMutation.isLoading}
              className="w-full h-14 text-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {applyMutation.isLoading ? "Submitting..." : "Submit Application"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}