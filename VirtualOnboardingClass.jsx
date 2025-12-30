import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  PlayCircle, CheckCircle, Lock, Book, Video, 
  FileText, Award, ArrowRight, Clock
} from "lucide-react";

const TRAINING_MODULES = [
  {
    id: 1,
    title: "Welcome to STOCRX",
    duration: "10 min",
    type: "video",
    icon: Video,
    description: "Introduction to our company culture and mission",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" // Replace with real video
  },
  {
    id: 2,
    title: "Safety & Compliance",
    duration: "15 min",
    type: "video",
    icon: FileText,
    description: "OSHA requirements, workplace safety, and legal compliance",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: 3,
    title: "System Training",
    duration: "20 min",
    type: "interactive",
    icon: Book,
    description: "How to use STOCRX platform and tools",
    content: `
# System Training

## Platform Overview

### Dashboard
Your dashboard shows:
- Current tasks
- Messages
- Schedule
- Performance metrics

### Key Features
1. **Time Tracking**: Clock in/out, breaks
2. **Dispatch System**: View and manage requests
3. **Customer Portal**: Access customer info
4. **Reporting**: Submit incidents, maintenance

### Navigation
- Top menu: Main sections
- Sidebar: Quick actions
- Profile: Settings & preferences

### Best Practices
- Check messages daily
- Update status regularly
- Document everything
- Ask questions when unsure

### Support
- AI Assistant: 24/7 help
- Manager: Department issues
- IT Support: Technical problems
- HR: Policy questions
    `
  },
  {
    id: 4,
    title: "Customer Service Excellence",
    duration: "15 min",
    type: "video",
    icon: Video,
    description: "How to provide exceptional customer service",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: 5,
    title: "Department-Specific Training",
    duration: "25 min",
    type: "interactive",
    icon: Book,
    description: "Training specific to your department",
    content: `
# Department Training

## Choose Your Department

### Incidents & Roadside
- Emergency response procedures
- Tow truck coordination
- Incident documentation
- Customer communication

### Operations & E-commerce
- Inventory management
- Order processing
- Website operations
- Customer accounts

### Fleet & Logistics
- Vehicle maintenance
- Delivery scheduling
- GPS tracking
- Inspection procedures

### Finance & HR
- Payroll processing
- Tax forms
- Employee records
- Financial reporting

### Customer Support
- Support ticket handling
- Live chat protocols
- Escalation procedures
- FAQ knowledge base

### Marketing
- Brand guidelines
- Social media policies
- Campaign management
- Analytics tracking
    `
  },
  {
    id: 6,
    title: "Policies & Procedures",
    duration: "10 min",
    type: "document",
    icon: FileText,
    description: "Company policies and employee handbook",
    content: `
# STOCRX Employee Policies

## Work Schedule
- Standard hours: 9 AM - 5 PM (may vary by department)
- Breaks: Two 15-min + one 30-min lunch
- Time tracking required
- Overtime must be approved

## Attendance
- Notify supervisor if absent
- Use PTO system for time off
- 3 late arrivals = written warning
- Excessive absences = termination

## Dress Code
- Business casual
- STOCRX branded shirts provided
- Safety equipment required for field work
- Clean, professional appearance

## Conduct
- Respect all colleagues
- No harassment or discrimination
- Professional communication
- Confidentiality required

## Technology Use
- Company devices for work only
- No personal social media during work
- Password security
- Report IT issues immediately

## Performance
- 90-day probation period
- Quarterly reviews
- Annual raises based on performance
- Promotion opportunities

## Benefits
- Health insurance (after 90 days)
- Paid time off
- Sick leave
- Employee discounts
- Professional development

## Termination
- Two weeks notice preferred
- Exit interview required
- Return all company property
- Final paycheck within 14 days
    `
  },
  {
    id: 7,
    title: "Final Assessment",
    duration: "15 min",
    type: "quiz",
    icon: Award,
    description: "Test your knowledge to complete onboarding",
    questions: [
      {
        q: "What is the mission of STOCRX?",
        options: ["Sell cars", "Subscription-to-own model", "Car rental", "Auto repair"],
        correct: 1
      },
      {
        q: "Who should you contact for technical issues?",
        options: ["HR", "Manager", "IT Support", "CEO"],
        correct: 2
      },
      {
        q: "How often should you clock in/out?",
        options: ["Never", "Daily", "Weekly", "Monthly"],
        correct: 1
      },
      {
        q: "What happens after 3 late arrivals?",
        options: ["Nothing", "Verbal warning", "Written warning", "Termination"],
        correct: 2
      },
      {
        q: "When do health benefits start?",
        options: ["Immediately", "30 days", "90 days", "1 year"],
        correct: 2
      }
    ]
  }
];

export default function VirtualOnboardingClass() {
  const [user, setUser] = useState(null);
  const [currentModule, setCurrentModule] = useState(1);
  const [completedModules, setCompletedModules] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Load progress
        const progress = currentUser.onboarding_progress || [];
        setCompletedModules(progress);
      } catch (err) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  const completeModuleMutation = useMutation({
    mutationFn: async (moduleId) => {
      const newCompleted = [...completedModules, moduleId];
      
      await base44.auth.updateMe({
        onboarding_progress: newCompleted,
        onboarding_completed: newCompleted.length === TRAINING_MODULES.length
      });

      await base44.entities.ActivityLog.create({
        user_email: user.email,
        action_type: "complete_training_module",
        action_details: `Completed module ${moduleId}: ${TRAINING_MODULES.find(m => m.id === moduleId)?.title}`
      });

      return newCompleted;
    },
    onSuccess: (data) => {
      setCompletedModules(data);
      
      if (data.length === TRAINING_MODULES.length) {
        // All modules complete!
        base44.integrations.Core.SendEmail({
          to: user.email,
          subject: "🎓 Congratulations! Onboarding Complete",
          body: `
            Great job ${user.full_name}!
            
            You've successfully completed all onboarding modules.
            
            You're now ready to start your role at STOCRX!
            
            Next steps:
            - Meet with your supervisor
            - Get your equipment
            - Start your first day!
            
            Welcome to the team!
          `
        });
      }
    }
  });

  const handleCompleteModule = () => {
    completeModuleMutation.mutate(currentModule);
    if (currentModule < TRAINING_MODULES.length) {
      setCurrentModule(currentModule + 1);
    }
  };

  const handleQuizSubmit = () => {
    const module = TRAINING_MODULES.find(m => m.id === currentModule);
    let correct = 0;
    
    module.questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correct) {
        correct++;
      }
    });

    const score = (correct / module.questions.length) * 100;
    
    if (score >= 70) {
      setShowResults(true);
      setTimeout(() => {
        handleCompleteModule();
        setShowResults(false);
        setQuizAnswers({});
      }, 3000);
    } else {
      alert(`Score: ${score.toFixed(0)}%. You need 70% to pass. Please review and try again.`);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const progress = (completedModules.length / TRAINING_MODULES.length) * 100;
  const module = TRAINING_MODULES.find(m => m.id === currentModule);
  const ModuleIcon = module?.icon || Book;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Virtual Onboarding Class</h1>
          <p className="text-gray-600">Complete all modules to finish your training</p>
        </div>

        {/* Progress Bar */}
        <Card className="p-6 mb-8 border-none shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-900">
              Module {currentModule} of {TRAINING_MODULES.length}
            </span>
            <span className="text-sm font-semibold text-blue-600">
              {progress.toFixed(0)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-3 mb-4" />
          <p className="text-sm text-gray-600">
            {completedModules.length} modules completed • {TRAINING_MODULES.length - completedModules.length} remaining
          </p>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Module List */}
          <div className="lg:col-span-1">
            <Card className="p-6 border-none shadow-lg sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Training Modules</h2>
              <div className="space-y-3">
                {TRAINING_MODULES.map((mod) => {
                  const Icon = mod.icon;
                  const isCompleted = completedModules.includes(mod.id);
                  const isCurrent = currentModule === mod.id;
                  const isLocked = mod.id > currentModule && !isCompleted;

                  return (
                    <button
                      key={mod.id}
                      onClick={() => !isLocked && setCurrentModule(mod.id)}
                      disabled={isLocked}
                      className={`w-full text-left p-4 rounded-lg transition-all ${
                        isCurrent ? 'bg-blue-600 text-white' :
                        isCompleted ? 'bg-green-50 border-2 border-green-500' :
                        isLocked ? 'bg-gray-100 opacity-50 cursor-not-allowed' :
                        'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : isLocked ? (
                          <Lock className="w-5 h-5 text-gray-400" />
                        ) : (
                          <Icon className={`w-5 h-5 ${isCurrent ? 'text-white' : 'text-gray-600'}`} />
                        )}
                        <div className="flex-1">
                          <p className={`font-semibold text-sm ${isCurrent ? 'text-white' : 'text-gray-900'}`}>
                            {mod.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className={`w-3 h-3 ${isCurrent ? 'text-blue-200' : 'text-gray-500'}`} />
                            <span className={`text-xs ${isCurrent ? 'text-blue-200' : 'text-gray-500'}`}>
                              {mod.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Module Content */}
          <div className="lg:col-span-2">
            <Card className="p-8 border-none shadow-lg">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <ModuleIcon className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <Badge className="mb-2 bg-blue-600">{module?.type}</Badge>
                  <h2 className="text-3xl font-bold text-gray-900">{module?.title}</h2>
                  <p className="text-gray-600">{module?.description}</p>
                </div>
              </div>

              {/* Video Module */}
              {module?.type === 'video' && (
                <div>
                  <div className="aspect-video bg-gray-900 rounded-lg mb-6 overflow-hidden">
                    <iframe
                      src={module.videoUrl}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <Button
                    onClick={handleCompleteModule}
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Mark as Complete
                  </Button>
                </div>
              )}

              {/* Interactive/Document Module */}
              {(module?.type === 'interactive' || module?.type === 'document') && (
                <div>
                  <div className="prose max-w-none mb-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <pre className="whitespace-pre-wrap font-sans text-gray-900">
                        {module.content}
                      </pre>
                    </div>
                  </div>
                  <Button
                    onClick={handleCompleteModule}
                    size="lg"
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Mark as Complete & Continue
                  </Button>
                </div>
              )}

              {/* Quiz Module */}
              {module?.type === 'quiz' && (
                <div>
                  {showResults ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-600" />
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Great Job!</h3>
                      <p className="text-gray-600">You passed the assessment. Moving to completion...</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {module.questions?.map((question, idx) => (
                        <Card key={idx} className="p-6 bg-gray-50">
                          <p className="font-semibold text-gray-900 mb-4">
                            {idx + 1}. {question.q}
                          </p>
                          <div className="space-y-2">
                            {question.options.map((option, optIdx) => (
                              <button
                                key={optIdx}
                                onClick={() => setQuizAnswers({...quizAnswers, [idx]: optIdx})}
                                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                  quizAnswers[idx] === optIdx
                                    ? 'border-blue-600 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </Card>
                      ))}

                      <Button
                        onClick={handleQuizSubmit}
                        disabled={Object.keys(quizAnswers).length < module.questions.length}
                        size="lg"
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Submit Assessment (70% to pass)
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Completion Message */}
            {completedModules.length === TRAINING_MODULES.length && (
              <Card className="p-8 mt-8 bg-gradient-to-br from-green-50 to-blue-50 border-none shadow-lg text-center">
                <Award className="w-20 h-20 mx-auto mb-4 text-yellow-600" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  🎓 Congratulations!
                </h2>
                <p className="text-xl text-gray-600 mb-6">
                  You've completed all onboarding modules!
                </p>
                <Button
                  size="lg"
                  onClick={() => window.location.href = '/'}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Go to Dashboard
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}