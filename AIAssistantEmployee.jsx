import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Search, Folder, FileText, ArrowLeft, Sparkles, Download, TestTube, Zap, TrendingUp, Bell, AlertCircle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

const FILE_CATEGORIES = {
  operations: {
    name: "Operations",
    color: "bg-blue-600",
    files: [
      { name: "Vehicle Management Guide", type: "PDF", url: "#" },
      { name: "Inventory SOPs", type: "PDF", url: "#" },
      { name: "Copart Integration Manual", type: "PDF", url: "#" },
      { name: "AI Vehicle Sourcing Guide", type: "PDF", url: "#" }
    ]
  },
  finance: {
    name: "Finance & Accounting",
    color: "bg-green-600",
    files: [
      { name: "Payment Processing Guide", type: "PDF", url: "#" },
      { name: "Payroll Instructions", type: "PDF", url: "#" },
      { name: "IRS Tax Forms Guide", type: "PDF", url: "#" },
      { name: "Financing Options Overview", type: "PDF", url: "#" }
    ]
  },
  customer_service: {
    name: "Customer Service",
    color: "bg-purple-600",
    files: [
      { name: "Customer Support Scripts", type: "PDF", url: "#" },
      { name: "KYC Verification Process", type: "PDF", url: "#" },
      { name: "Subscription Approval Workflow", type: "PDF", url: "#" },
      { name: "Issue Resolution Guide", type: "PDF", url: "#" }
    ]
  },
  fleet: {
    name: "Fleet & Maintenance",
    color: "bg-orange-600",
    files: [
      { name: "Maintenance Tracking Manual", type: "PDF", url: "#" },
      { name: "Vehicle Inspection Checklist", type: "PDF", url: "#" },
      { name: "Incident Report Forms", type: "PDF", url: "#" },
      { name: "Delivery Procedures", type: "PDF", url: "#" }
    ]
  },
  legal: {
    name: "Legal & Compliance",
    color: "bg-red-600",
    files: [
      { name: "Terms of Service", type: "PDF", url: "#" },
      { name: "Privacy Policy", type: "PDF", url: "#" },
      { name: "License Requirements by State", type: "PDF", url: "#" },
      { name: "Contract Templates", type: "PDF", url: "#" }
    ]
  },
  hr: {
    name: "Human Resources",
    color: "bg-indigo-600",
    files: [
      { name: "Employee Handbook", type: "PDF", url: "#" },
      { name: "Onboarding Checklist", type: "PDF", url: "#" },
      { name: "Benefits Overview", type: "PDF", url: "#" },
      { name: "Time Tracking Guide", type: "PDF", url: "#" }
    ]
  },
  marketing: {
    name: "Marketing & Sales",
    color: "bg-pink-600",
    files: [
      { name: "Brand Guidelines", type: "PDF", url: "#" },
      { name: "Social Media Strategy", type: "PDF", url: "#" },
      { name: "Sales Scripts", type: "PDF", url: "#" },
      { name: "Partner Marketing Materials", type: "PDF", url: "#" }
    ]
  },
  technical: {
    name: "Technical Documentation",
    color: "bg-teal-600",
    files: [
      { name: "Platform User Guide", type: "PDF", url: "#" },
      { name: "API Documentation", type: "PDF", url: "#" },
      { name: "System Architecture", type: "PDF", url: "#" },
      { name: "Troubleshooting Guide", type: "PDF", url: "#" }
    ]
  }
};

const TEST_QUESTIONS = [
  "How do I approve a subscription?",
  "What's the KYC verification process?",
  "How to track vehicle maintenance?",
  "Payment processing guidelines?",
  "How do I add a new vehicle to inventory?",
  "What are the steps for payroll processing?",
  "How to handle customer complaints?",
  "What's the early buyout calculation?"
];

export default function AIAssistantEmployee() {
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [testResults, setTestResults] = useState(null);
  const [runningTests, setRunningTests] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.email !== SUPER_ADMIN_EMAIL && currentUser.role !== 'admin' && !currentUser.department) {
          window.location.href = '/';
          return;
        }
        setUser(currentUser);
      } catch (err) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  // Fetch real-time data for monitoring
  const { data: pendingApprovals } = useQuery({
    queryKey: ['pending-approvals-count'],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.filter({ admin_approved: false });
      return subs.length;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    initialData: 0
  });

  const { data: pendingPayments } = useQuery({
    queryKey: ['pending-payments-count'],
    queryFn: async () => {
      const payments = await base44.entities.Payment.filter({ status: "pending" });
      return payments.length;
    },
    refetchInterval: 30000,
    initialData: 0
  });

  const { data: activeDispatches } = useQuery({
    queryKey: ['active-dispatches-count'],
    queryFn: async () => {
      const dispatches = await base44.entities.DispatchRequest.filter({ 
        status: { $in: ["pending", "assigned", "in_transit"] }
      });
      return dispatches.length;
    },
    refetchInterval: 30000,
    initialData: 0
  });

  // Monitor for issues
  useEffect(() => {
    const newNotifications = [];
    
    if (pendingApprovals > 5) {
      newNotifications.push({
        type: "warning",
        title: "High Pending Approvals",
        message: `${pendingApprovals} subscriptions waiting for approval`,
        action: "Go to Pending Approvals"
      });
    }

    if (pendingPayments > 10) {
      newNotifications.push({
        type: "warning",
        title: "Payment Backlog",
        message: `${pendingPayments} payments need review`,
        action: "Review Payments"
      });
    }

    if (activeDispatches > 15) {
      newNotifications.push({
        type: "info",
        title: "Busy Dispatch",
        message: `${activeDispatches} active dispatch requests`,
        action: "View Dispatches"
      });
    }

    setNotifications(newNotifications);
  }, [pendingApprovals, pendingPayments, activeDispatches]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const userMessage = { role: "user", content: query };
    setChatHistory([...chatHistory, userMessage]);

    try {
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an advanced AI assistant for STOCRX employees with deep knowledge of:

🚗 VEHICLE MANAGEMENT:
- Adding vehicles via SuperAdminCars page with AI sourcing
- Copart integration and vehicle locator by state/city
- Maintenance tracking and auto-removal after 90 days
- Nearby vehicles with GPS tracking

💰 FINANCIAL OPERATIONS:
- Payment processing (credit, ACH, PayPal, Apple/Google Pay, Cash App, Zelle)
- Buy Now Pay Later options (Snap Loans, Koalafi, ReLease 90)
- Payroll processing with W-2/1099 generation
- IRS tax calculator and company management

👥 CUSTOMER MANAGEMENT:
- Subscription approval workflow
- KYC verification (manual + AI-powered fake ID detection)
- Document retention (3 years)
- Early buyout, swap/upgrade, delivery scheduling

🚨 OPERATIONS:
- Call Center Dispatch for tow trucks/deliveries
- Incident reporting and damage claims
- License and certification management
- Job board and career applications

📊 ANALYTICS & MONITORING:
- Search analytics tracking
- Activity logging
- User profiles with SSN protection
- Real-time notifications

AI CAPABILITIES:
- AI Vehicle Sourcing from Copart (searches for photos and details)
- AI ID Verification (detects fake IDs before human review)
- AI Chat Support for customers
- AI Employee Assistant (you!)

Employee question: ${query}

Provide a detailed, actionable answer with:
1. Step-by-step instructions if applicable
2. Which page/tool to use
3. Tips for efficiency
4. Related features they should know about

Format with clear sections and bullet points.`,
        add_context_from_internet: false
      });

      const assistantMessage = { role: "assistant", content: aiResponse };
      setChatHistory([...chatHistory, userMessage, assistantMessage]);
      setResponse(aiResponse);
      setQuery("");
    } catch (err) {
      console.error(err);
      const errorMessage = { role: "assistant", content: "Sorry, I encountered an error. Please try again." };
      setChatHistory([...chatHistory, userMessage, errorMessage]);
    }
    
    setLoading(false);
  };

  const handleQuickQuestion = async (question) => {
    setQuery(question);
    // Auto-submit after setting
    setTimeout(() => {
      const form = document.getElementById('ai-chat-form');
      if (form) form.requestSubmit();
    }, 100);
  };

  const runAITests = async () => {
    setRunningTests(true);
    setTestResults([]);
    
    const results = [];
    
    for (let i = 0; i < TEST_QUESTIONS.length; i++) {
      const question = TEST_QUESTIONS[i];
      
      try {
        const startTime = Date.now();
        const aiResponse = await base44.integrations.Core.InvokeLLM({
          prompt: `You are an AI assistant for STOCRX employees. Answer this question concisely: ${question}`,
          add_context_from_internet: false
        });
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        results.push({
          question,
          response: aiResponse,
          status: "success",
          responseTime: responseTime
        });
      } catch (err) {
        results.push({
          question,
          response: err.message,
          status: "error",
          responseTime: 0
        });
      }
      
      setTestResults([...results]);
    }
    
    setRunningTests(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Bot className="w-10 h-10 text-blue-400" />
              AI Employee Assistant
            </h1>
            <p className="text-gray-400">Advanced AI-powered support with real-time monitoring</p>
            <div className="flex gap-2 mt-2">
              <Badge className="bg-purple-600 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                AI-Powered
              </Badge>
              <Badge className="bg-green-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Real-time Monitoring
              </Badge>
            </div>
          </div>
          
          {(user.role === 'admin' || user.email === SUPER_ADMIN_EMAIL) && (
            <Button
              onClick={runAITests}
              disabled={runningTests}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              <TestTube className="w-5 h-5 mr-2" />
              {runningTests ? "Running Tests..." : "Run AI Tests"}
            </Button>
          )}
        </div>

        {/* Real-time Notifications */}
        {notifications.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {notifications.map((notif, idx) => (
              <Alert key={idx} className={
                notif.type === 'warning' ? 'bg-yellow-900 border-yellow-700' : 'bg-blue-900 border-blue-700'
              }>
                <Bell className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-bold text-white">{notif.title}</p>
                  <p className="text-sm text-gray-300">{notif.message}</p>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* System Status */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-gray-800 border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Pending Approvals</p>
            <p className="text-3xl font-bold text-yellow-400">{pendingApprovals}</p>
          </Card>
          <Card className="p-4 bg-gray-800 border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Pending Payments</p>
            <p className="text-3xl font-bold text-green-400">{pendingPayments}</p>
          </Card>
          <Card className="p-4 bg-gray-800 border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Active Dispatches</p>
            <p className="text-3xl font-bold text-orange-400">{activeDispatches}</p>
          </Card>
          <Card className="p-4 bg-green-900 border-green-700">
            <p className="text-green-200 text-sm mb-1">AI Status</p>
            <p className="text-2xl font-bold text-green-400">Operational</p>
          </Card>
        </div>

        {/* Test Results */}
        {testResults && (
          <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">AI Test Results</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4 bg-green-900 border-green-700">
                <p className="text-green-200 text-sm">Successful</p>
                <p className="text-3xl font-bold text-green-400">
                  {testResults.filter(r => r.status === 'success').length}
                </p>
              </Card>
              <Card className="p-4 bg-red-900 border-red-700">
                <p className="text-red-200 text-sm">Failed</p>
                <p className="text-3xl font-bold text-red-400">
                  {testResults.filter(r => r.status === 'error').length}
                </p>
              </Card>
              <Card className="p-4 bg-blue-900 border-blue-700">
                <p className="text-blue-200 text-sm">Avg Response Time</p>
                <p className="text-3xl font-bold text-blue-400">
                  {(testResults.reduce((sum, r) => sum + r.responseTime, 0) / testResults.length / 1000).toFixed(2)}s
                </p>
              </Card>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults.map((result, idx) => (
                <Card key={idx} className={`p-4 ${
                  result.status === 'success' ? 'bg-gray-700' : 'bg-red-900/30'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-white">{result.question}</p>
                    <div className="flex gap-2">
                      <Badge className={result.status === 'success' ? 'bg-green-600' : 'bg-red-600'}>
                        {result.status}
                      </Badge>
                      <Badge className="bg-blue-600">{result.responseTime}ms</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 line-clamp-2">{result.response}</p>
                </Card>
              ))}
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* AI Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-gray-800 border-gray-700 h-[600px] flex flex-col">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-700">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">AI Assistant Chat</h2>
                <Badge className="bg-purple-600 ml-auto">Advanced Mode</Badge>
              </div>

              {/* Chat History */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {chatHistory.length === 0 ? (
                  <div className="text-center py-8">
                    <Bot className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 mb-2 text-lg font-bold">Ask me anything about STOCRX!</p>
                    <p className="text-gray-500 text-sm mb-6">I have deep knowledge of all systems and operations</p>
                    <div className="grid md:grid-cols-2 gap-3 text-left">
                      {TEST_QUESTIONS.slice(0, 4).map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickQuestion(suggestion)}
                          className="p-3 bg-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-600 transition-colors text-left"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className={`max-w-[80%] p-4 rounded-lg ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-200'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold">{user.full_name?.charAt(0) || 'U'}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
                {loading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form id="ai-chat-form" onSubmit={handleSearch} className="flex gap-3">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask me anything..."
                  className="bg-gray-700 border-gray-600 text-white flex-1"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Search className="w-5 h-5" />
                </Button>
              </form>
            </Card>
          </div>

          {/* File Library */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-gray-800 border-gray-700 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Folder className="w-5 h-5 text-yellow-400" />
                <h2 className="text-xl font-bold text-white">Resource Library</h2>
              </div>

              <div className="max-h-[500px] overflow-y-auto space-y-4">
                {Object.entries(FILE_CATEGORIES).map(([key, category]) => (
                  <div key={key}>
                    <div className={`${category.color} rounded-t-lg px-3 py-2`}>
                      <h3 className="text-white font-bold text-sm">{category.name}</h3>
                    </div>
                    <div className="bg-gray-700 rounded-b-lg p-3 space-y-2">
                      {category.files.map((file, idx) => (
                        <button
                          key={idx}
                          className="w-full flex items-center justify-between p-2 hover:bg-gray-600 rounded transition-colors text-left"
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <FileText className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-gray-200">{file.name}</span>
                          </div>
                          <Download className="w-4 h-4 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}