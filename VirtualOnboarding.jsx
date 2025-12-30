import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, CheckCircle, Play, Book, ArrowRight, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function VirtualOnboarding() {
  const [user, setUser] = useState(null);
  const [currentModule, setCurrentModule] = useState(0);
  const [completedModules, setCompletedModules] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        if (currentUser.onboarding_modules_completed) {
          setCompletedModules(currentUser.onboarding_modules_completed);
        }
      } catch (err) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  const modules = [
    {
      id: 1,
      title: "Welcome to STOCRX",
      duration: "5 min",
      description: "Introduction to our subscription-to-own model",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      topics: [
        "How subscription-to-own works",
        "Building equity with each payment",
        "Your path to ownership",
        "Platform features overview"
      ]
    },
    {
      id: 2,
      title: "Choosing Your Plan",
      duration: "8 min",
      description: "Understanding subscription tiers and benefits",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      topics: [
        "Subscription tier comparison",
        "Payment frequency options",
        "Insurance requirements",
        "Early buyout benefits"
      ]
    },
    {
      id: 3,
      title: "Vehicle Selection",
      duration: "10 min",
      description: "How to browse and choose your perfect car",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      topics: [
        "Using search and filters",
        "Understanding vehicle conditions",
        "Reading vehicle details",
        "Nearby vehicles feature"
      ]
    },
    {
      id: 4,
      title: "Application Process",
      duration: "7 min",
      description: "Step-by-step application walkthrough",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      topics: [
        "Required documents",
        "Identity verification (KYC)",
        "Payment setup",
        "Contract terms"
      ]
    },
    {
      id: 5,
      title: "Managing Your Account",
      duration: "6 min",
      description: "Using your dashboard and making payments",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      topics: [
        "Dashboard overview",
        "Making payments",
        "Viewing ownership progress",
        "Requesting swaps/upgrades"
      ]
    },
    {
      id: 6,
      title: "Maintenance & Care",
      duration: "5 min",
      description: "Keeping your vehicle in great condition",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      topics: [
        "Maintenance responsibilities",
        "Reporting incidents",
        "Insurance requirements",
        "Vehicle return conditions"
      ]
    },
    {
      id: 7,
      title: "Path to Ownership",
      duration: "8 min",
      description: "Completing your journey to full ownership",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      topics: [
        "Ownership progress tracking",
        "Early buyout options",
        "Final payment",
        "Title transfer process"
      ]
    },
    {
      id: 8,
      title: "Support & Resources",
      duration: "4 min",
      description: "Getting help when you need it",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      topics: [
        "AI chat support",
        "Submitting tickets",
        "Partner network",
        "FAQ and resources"
      ]
    }
  ];

  const handleCompleteModule = async (moduleId) => {
    const updated = [...completedModules, moduleId];
    setCompletedModules(updated);
    
    if (user) {
      await base44.auth.updateMe({
        onboarding_modules_completed: updated
      });
    }
    
    if (currentModule < modules.length - 1) {
      setCurrentModule(currentModule + 1);
    }
  };

  const progress = (completedModules.length / modules.length) * 100;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Video className="w-16 h-16 mx-auto mb-4 text-blue-300" />
          <h1 className="text-4xl font-bold text-white mb-2">
            Virtual Onboarding Class
          </h1>
          <p className="text-blue-200 text-lg">
            Master STOCRX in 8 comprehensive modules
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-semibold">Overall Progress</span>
            <span className="text-blue-200">{completedModules.length} / {modules.length} modules</span>
          </div>
          <Progress value={progress} className="h-3 mb-2" />
          <p className="text-sm text-blue-200">{progress.toFixed(0)}% Complete</p>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Module List */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white/10 backdrop-blur-md border-white/20 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Book className="w-5 h-5" />
                Course Modules
              </h2>
              <div className="space-y-3">
                {modules.map((module, idx) => (
                  <button
                    key={module.id}
                    onClick={() => setCurrentModule(idx)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      currentModule === idx
                        ? 'bg-blue-500 text-white'
                        : completedModules.includes(module.id)
                        ? 'bg-green-500/20 text-green-200'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{module.title}</span>
                      {completedModules.includes(module.id) && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <span className="text-xs opacity-75">{module.duration}</span>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Current Module */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-white/10 backdrop-blur-md border-white/20">
              <div className="flex items-center justify-between mb-6">
                <Badge className="bg-blue-500 text-white text-lg px-4 py-2">
                  Module {modules[currentModule].id} of {modules.length}
                </Badge>
                <Badge className="bg-purple-500 text-white px-3 py-1">
                  {modules[currentModule].duration}
                </Badge>
              </div>

              <h2 className="text-3xl font-bold text-white mb-3">
                {modules[currentModule].title}
              </h2>
              <p className="text-blue-200 text-lg mb-6">
                {modules[currentModule].description}
              </p>

              {/* Video Player */}
              <div className="aspect-video bg-black rounded-xl mb-6 overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src={modules[currentModule].videoUrl}
                  title={modules[currentModule].title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              {/* Topics Covered */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-3">Topics Covered:</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {modules[currentModule].topics.map((topic, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-blue-200">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                {!completedModules.includes(modules[currentModule].id) && (
                  <Button
                    onClick={() => handleCompleteModule(modules[currentModule].id)}
                    className="flex-1 h-14 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Mark as Complete
                  </Button>
                )}
                
                {currentModule < modules.length - 1 && (
                  <Button
                    onClick={() => setCurrentModule(currentModule + 1)}
                    className="flex-1 h-14 text-lg bg-blue-500 hover:bg-blue-600"
                  >
                    Next Module
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                )}

                {currentModule === modules.length - 1 && completedModules.length === modules.length && (
                  <Button
                    onClick={() => window.location.href = '/BrowseCars'}
                    className="flex-1 h-14 text-lg bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                  >
                    <Award className="w-5 h-5 mr-2" />
                    Complete Onboarding
                  </Button>
                )}
              </div>
            </Card>

            {/* Completion Badge */}
            {completedModules.length === modules.length && (
              <Card className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 border-none mt-6 text-center">
                <Award className="w-16 h-16 mx-auto mb-4 text-white" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  🎉 Congratulations!
                </h3>
                <p className="text-white text-lg">
                  You've completed all onboarding modules. You're ready to start your journey!
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}