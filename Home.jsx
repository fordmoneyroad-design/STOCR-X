
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Car, CheckCircle, TrendingUp, Shield, Zap, ArrowRight, AlertCircle, Briefcase, Smartphone, Users, DollarSign } from "lucide-react";
import HeroSection from "../components/home/HeroSection";
import CalculatorPreview from "../components/home/CalculatorPreview";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import PWAInstallPrompt from "./PWAInstallPrompt";

export default function Home() {
  const [user, setUser] = useState(null);
  const [showMobileInstall, setShowMobileInstall] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
        }
      } catch (err) {
        // Not authenticated
      }
    };
    checkAuth();

    // Check if mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setShowMobileInstall(isMobile);
  }, []);

  const handleSubscriptionClick = () => {
    if (!user) {
      base44.auth.redirectToLogin(createPageUrl("SubscriptionPlans"));
    } else {
      window.location.href = createPageUrl("SubscriptionPlans");
    }
  };

  return (
    <div className="min-h-screen">
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Mobile App Install Banner */}
      {showMobileInstall && (
        <div className="max-w-7xl mx-auto mt-8 mx-4">
          <Alert className="bg-gradient-to-r from-blue-600 to-purple-600 border-none">
            <Smartphone className="h-4 w-4 text-white" />
            <AlertDescription className="text-white">
              <strong>Install STOCRX App:</strong> Get native app experience on your phone!
              <Link to={createPageUrl("MobileAppPromo")}>
                <Button size="sm" variant="ghost" className="ml-2 text-white hover:bg-white/20">
                  Learn How →
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <HeroSection />

      {/* How It Works Section - ALL CLICKABLE */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 text-center mb-16">
            Drive now, own later with our simple 4-step process
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            <Card
              onClick={() => navigate(createPageUrl("BrowseCars"))}
              className="p-8 text-center hover:shadow-2xl transition-all hover:scale-105 cursor-pointer border-2 border-transparent hover:border-blue-500"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Browse Cars</h3>
              <p className="text-gray-600 mb-4">
                Choose from our selection of quality vehicles
              </p>
              <p className="text-sm text-blue-600 font-semibold">Click to browse →</p>
            </Card>

            <Card
              onClick={() => navigate(createPageUrl("SubscriptionPlans"))}
              className="p-8 text-center hover:shadow-2xl transition-all hover:scale-105 cursor-pointer border-2 border-transparent hover:border-blue-500"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Choose Plan</h3>
              <p className="text-gray-600 mb-4">
                Select a subscription plan that fits your budget
              </p>
              <p className="text-sm text-green-600 font-semibold">View plans →</p>
            </Card>

            <Card
              onClick={() => navigate(createPageUrl("Apply"))}
              className="p-8 text-center hover:shadow-2xl transition-all hover:scale-105 cursor-pointer border-2 border-transparent hover:border-blue-500"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Apply</h3>
              <p className="text-gray-600 mb-4">
                Quick approval process with minimal paperwork
              </p>
              <p className="text-sm text-orange-600 font-semibold">Apply now →</p>
            </Card>

            <Card
              onClick={() => navigate(createPageUrl("HowItWorks"))}
              className="p-8 text-center hover:shadow-2xl transition-all hover:scale-105 cursor-pointer border-2 border-transparent hover:border-blue-500"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">4</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Drive & Own</h3>
              <p className="text-gray-600 mb-4">
                Start driving and build equity towards ownership
              </p>
              <p className="text-sm text-purple-600 font-semibold">Learn more →</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section - ALL CLICKABLE */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose STOCRX?</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <Card
              onClick={() => navigate(createPageUrl("SubscriptionPlans"))}
              className="p-8 hover:shadow-2xl transition-all hover:scale-105 cursor-pointer"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Build Equity</h3>
                <p className="text-gray-600 mb-4">
                  Every payment brings you closer to owning your vehicle
                </p>
                <p className="text-sm text-blue-600 font-semibold">See plans →</p>
              </div>
            </Card>

            <Card
              onClick={() => navigate(createPageUrl("Calculator"))}
              className="p-8 hover:shadow-2xl transition-all hover:scale-105 cursor-pointer"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Affordable Payments</h3>
                <p className="text-gray-600 mb-4">
                  Low down payments and flexible weekly/monthly options
                </p>
                <p className="text-sm text-green-600 font-semibold">Calculate →</p>
              </div>
            </Card>

            <Card
              onClick={() => navigate(createPageUrl("HowItWorks"))}
              className="p-8 hover:shadow-2xl transition-all hover:scale-105 cursor-pointer"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Quick Approval</h3>
                <p className="text-gray-600 mb-4">
                  Fast, easy approval process with minimal credit requirements
                </p>
                <p className="text-sm text-purple-600 font-semibold">Learn how →</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <CalculatorPreview />

      {/* Partnership CTA Section - NEW */}
      <section className="py-16 bg-gradient-to-br from-cyan-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-r from-cyan-600 to-blue-600 border-none shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
              <div className="text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-10 h-10" />
                  <h2 className="text-3xl md:text-4xl font-bold">Become a Partner</h2>
                </div>
                <p className="text-lg text-cyan-100 mb-6">
                  Join our partnership program and help revolutionize car ownership.
                  Access exclusive tools, resources, and collaboration opportunities!
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span className="text-cyan-50">Access to partnership platform</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span className="text-cyan-50">Collaborate with STOCRX team</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span className="text-cyan-50">Custom permission levels</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span className="text-cyan-50">Secure 2FA authentication</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span className="text-cyan-50">🆕 Community chat & support!</span>
                  </div>
                </div>
                <Link to={createPageUrl("RequestPartnerAccess")}>
                  <Button
                    size="lg"
                    className="bg-white text-cyan-600 hover:bg-gray-100 shadow-xl font-bold"
                  >
                    Request Partner Access
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>

              <div className="hidden md:flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                    <p className="text-sm text-cyan-200">Active Partners</p>
                    <p className="text-3xl font-bold text-white">15+</p>
                  </Card>
                  <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                    <p className="text-sm text-cyan-200">Access Roles</p>
                    <p className="text-3xl font-bold text-white">6</p>
                  </Card>
                  <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                    <p className="text-sm text-cyan-200">Secure 2FA</p>
                    <p className="text-3xl font-bold text-white">100%</p>
                  </Card>
                  <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                    <p className="text-sm text-cyan-200">Setup Time</p>
                    <p className="text-3xl font-bold text-white">5min</p>
                  </Card>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur px-8 py-4 border-t border-white/20">
              <p className="text-center text-cyan-100 text-sm">
                🔐 <strong>Secure Access:</strong> All partners must enable 2FA • Custom permissions • 90-day activity check • Easy approval process
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Careers CTA Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 border-none shadow-2xl overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12">
              <div className="text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Briefcase className="w-10 h-10" />
                  <h2 className="text-3xl md:text-4xl font-bold">Join Our Team</h2>
                </div>
                <p className="text-lg text-indigo-100 mb-6">
                  We're hiring talented individuals to help revolutionize car ownership.
                  No experience required for entry-level positions!
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span className="text-indigo-50">Competitive salary & benefits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span className="text-indigo-50">Remote & hybrid positions available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span className="text-indigo-50">Fast-paced startup environment</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span className="text-indigo-50">Career growth opportunities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-300" />
                    <span className="text-indigo-50">🆕 Bookkeeping & Payroll roles open!</span>
                  </div>
                </div>
                <Link to={createPageUrl("Careers")}>
                  <Button
                    size="lg"
                    className="bg-white text-indigo-600 hover:bg-gray-100 shadow-xl font-bold"
                  >
                    View Open Positions
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>

              <div className="hidden md:flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                    <p className="text-sm text-indigo-200">Open Positions</p>
                    <p className="text-3xl font-bold text-white">8+</p>
                  </Card>
                  <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                    <p className="text-sm text-indigo-200">Departments</p>
                    <p className="text-3xl font-bold text-white">7</p>
                  </Card>
                  <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                    <p className="text-sm text-indigo-200">Team Size</p>
                    <p className="text-3xl font-bold text-white">20+</p>
                  </Card>
                  <Card className="p-4 bg-white/10 backdrop-blur border-white/20">
                    <p className="text-sm text-indigo-200">Apply in</p>
                    <p className="text-3xl font-bold text-white">5min</p>
                  </Card>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur px-8 py-4 border-t border-white/20">
              <p className="text-center text-indigo-100 text-sm">
                ⏰ <strong>Fast Process:</strong> Applications reviewed within 1-2 weeks • Quick hiring decisions • 30-day application window
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Drive Your Dream Car?
          </h2>
          <p className="text-xl text-blue-50 mb-4">
            Start building ownership today with flexible subscription plans
          </p>
          <p className="text-sm text-blue-100 mb-8">
            * All vehicles are used cars sold as-is • Inspection recommended
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("BrowseCars")}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl text-lg px-8">
                Browse Cars
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 text-lg px-8"
              onClick={handleSubscriptionClick}
            >
              Join Subscription
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
