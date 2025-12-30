
import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Minimize2, Maximize2, X, ExternalLink, CheckCircle, Clock, AlertTriangle, List, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const QUICK_ACTIONS = [
  { label: "Check Copart Watchlist", command: "/watchlist", icon: "👁️" },
  { label: "Generate Car Descriptions", command: "/generate-descriptions", icon: "📝" },
  { label: "Import Copart Links", command: "/import-links", icon: "🔗" },
  { label: "Daily Summary", command: "/daily-summary", icon: "📊" },
  { label: "Create Task List", command: "/tasklist", icon: "✅" },
  { label: "Check Overdue Items", command: "/overdue", icon: "⏰" },
  { label: "Assign Jobs", command: "/assign", icon: "👥" },
  { label: "View Analytics", command: "/analytics", icon: "📈" },
  { label: "System Health", command: "/health", icon: "💚" },
  { label: "Payment Overview", command: "/payments", icon: "💰" },
];

export default function AIAssistantChatBox({ user }) {
  // Don't render if no user
  if (!user) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [taskList, setTaskList] = useState([]);
  const [currentContext, setCurrentContext] = useState(""); // This will now store rolling conversation or command topic
  const [loading, setLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.email) return;

    // Load chat history from localStorage
    const savedHistory = localStorage.getItem(`ai-chat-history-${user.email}`);
    if (savedHistory) {
      setChatHistory(JSON.parse(savedHistory));
    }

    // Load task list
    const savedTasks = localStorage.getItem(`ai-tasks-${user.email}`);
    if (savedTasks) {
      setTaskList(JSON.parse(savedTasks));
    }

    // Load current context (now possibly rolling history)
    const savedContext = localStorage.getItem(`ai-context-${user.email}`);
    if (savedContext) {
      setCurrentContext(savedContext);
    }
  }, [user?.email]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const saveChatHistory = (newHistory) => {
    if (!user?.email) return;
    localStorage.setItem(`ai-chat-history-${user.email}`, JSON.stringify(newHistory));
    setChatHistory(newHistory);
  };

  const saveTaskList = (newTasks) => {
    if (!user?.email) return;
    localStorage.setItem(`ai-tasks-${user.email}`, JSON.stringify(newTasks));
    setTaskList(newTasks);
  };

  const saveContext = (context) => {
    if (!user?.email) return;
    localStorage.setItem(`ai-context-${user.email}`, context);
    setCurrentContext(context);
  };

  const addTask = (task, priority = "medium", dueDate = null) => {
    const newTask = {
      id: Date.now(),
      task,
      priority,
      status: "incomplete",
      createdAt: new Date().toISOString(),
      dueDate,
      createdBy: user?.email || 'unknown'
    };
    saveTaskList([...taskList, newTask]);
    return newTask;
  };

  const toggleTaskStatus = (taskId) => {
    const updated = taskList.map(t =>
      t.id === taskId ? { ...t, status: t.status === "complete" ? "incomplete" : "complete" } : t
    );
    saveTaskList(updated);
  };

  const extractTasksFromResponse = (text) => {
    const lines = text.split('\n');
    const tasks = [];

    lines.forEach(line => {
      // Check for common task indicators (numbers, bullets, or specific keywords)
      if (line.match(/^\d+\.\s+/) || line.match(/^[-•]\s+/) || line.toLowerCase().includes('todo:') || line.toLowerCase().includes('task:') || line.toLowerCase().includes('action:')) {
        const taskText = line.replace(/^\d+\.\s+/, '').replace(/^[-•]\s+/, '').replace(/todo:/i, '').replace(/task:/i, '').replace(/action:/i, '').trim();
        if (taskText && taskText.length > 5) { // Ensure task is substantial
          const isPriority = line.toLowerCase().includes('urgent') || line.toLowerCase().includes('high priority') || line.toLowerCase().includes('overdue') || line.toLowerCase().includes('🔴');
          tasks.push({
            text: taskText,
            priority: isPriority ? 'high' : 'medium'
          });
        }
      }
    });

    return tasks;
  };

  const handleSendMessage = async () => {
    if (!message.trim() || loading || !user) return;

    const userMessage = { role: "user", content: message, timestamp: new Date().toISOString() };
    const updatedHistory = [...chatHistory, userMessage];
    saveChatHistory(updatedHistory); // Save updated history

    setMessage("");
    setLoading(true);

    let response = "";
    let autoGeneratedTasks = [];
    let isCommand = false;
    let contextSetByCommand = false; // Flag to know if a command overwrote the rolling context

    try {
      // Handle commands first
      if (message.startsWith("/")) {
        isCommand = true;
        const command = message.toLowerCase().trim();

        if (command === "/watchlist") {
          response = "🔍 **COPART WATCHLIST CHECK**\n\n✅ Found 3 vehicles matching your criteria:\n\n1. 2020 Toyota Camry - Lot #12345678 - $8,500\n2. 2019 Honda Civic - Lot #87654321 - $7,200\n3. 2021 Tesla Model 3 - Lot #45678912 - $22,000\n\n📋 **Action Items:**\n- Review and approve for import\n- Check condition reports\n- Verify pricing alignment\n\nWould you like me to import these?";
          saveContext("Copart vehicle watchlist review"); // Sets semantic context
          contextSetByCommand = true;

        } else if (command === "/generate-descriptions") {
          response = "📝 **AI DESCRIPTION GENERATION**\n\n✅ Processing 5 vehicles:\n\n1. ✅ 2020 Toyota Camry - Description updated\n2. ✅ 2019 Honda Civic - Description updated\n3. ✅ 2021 Tesla Model 3 - Description updated\n4. ✅ 2018 Ford F-150 - Description updated\n5. ✅ 2022 Nissan Altima - Description updated\n\n📋 **Next Steps:**\n- Review descriptions for accuracy\n- Publish to live inventory\n- Update pricing if needed\n\nAll descriptions optimized for SEO and customer appeal!";
          saveContext("Vehicle description generation"); // Sets semantic context
          contextSetByCommand = true;

        } else if (command === "/import-links") {
          response = "🔗 **COPART LINK IMPORT**\n\n✅ Email scan complete:\n- Found 8 new auction links\n- Imported: 6 vehicles\n- Duplicates skipped: 2\n\n📋 **To-Do:**\n1. Approve imported vehicles (6 pending)\n2. Set pricing for new inventory\n3. Generate descriptions\n4. Schedule photography\n\nAll vehicles added to pending approval queue.";
          saveContext("Copart import processing"); // Sets semantic context
          contextSetByCommand = true;

          autoGeneratedTasks = [
            { text: "Approve 6 imported vehicles", priority: "high" },
            { text: "Set pricing for new inventory", priority: "medium" },
            { text: "Generate AI descriptions for imports", priority: "medium" }
          ];

        } else if (command === "/daily-summary") {
          response = "📊 **DAILY SUMMARY - " + new Date().toLocaleDateString() + "**\n\n✅ **Completed Today:**\n- Approved 12 vehicles\n- Processed 8 subscriptions\n- Verified 15 payments ($12,450)\n- Resolved 6 support tickets\n\n⏳ **Still Pending:**\n- 5 vehicle approvals\n- 3 KYC verifications\n- 2 payment confirmations\n\n🚨 **Urgent Items:**\n- 1 overdue payment (john@email.com)\n- 2 customer support escalations\n- Vehicle inspection due (2020 Honda)\n\n📋 **Tomorrow's Priority:**\n1. Follow up on overdue payment\n2. Complete KYC reviews\n3. Schedule vehicle deliveries\n\n**Overall Status: ✅ GOOD**";
          saveContext("Daily operations review"); // Sets semantic context
          contextSetByCommand = true;

          autoGeneratedTasks = [
            { text: "Follow up on overdue payment from john@email.com", priority: "high" },
            { text: "Complete 3 KYC verifications", priority: "high" },
            { text: "Schedule vehicle deliveries", priority: "medium" }
          ];

        } else if (command === "/tasklist") {
          response = "✅ **SMART TASK LIST GENERATED**\n\n🔴 **HIGH PRIORITY:**\n1. Review pending vehicle approvals (5 items)\n2. Process KYC verifications (3 users)\n3. Follow up on late payments (1 customer)\n\n🟡 **MEDIUM PRIORITY:**\n4. Update vehicle descriptions (8 cars)\n5. Review employee timesheets\n6. Respond to customer inquiries (4 pending)\n\n🔵 **LOW PRIORITY:**\n7. Update website content\n8. Plan next week's schedule\n\n**All tasks added to your tracker! 📋**";
          saveContext("Task list generation"); // Sets semantic context
          contextSetByCommand = true;

          autoGeneratedTasks = [
            { text: "Review pending vehicle approvals (5 items)", priority: "high" },
            { text: "Process KYC verifications (3 users)", priority: "high" },
            { text: "Follow up on late payments", priority: "high" },
            { text: "Update vehicle descriptions (8 cars)", priority: "medium" },
            { text: "Review employee timesheets", priority: "medium" },
            { text: "Respond to customer inquiries (4 pending)", priority: "medium" }
          ];

        } else if (command === "/overdue") {
          response = "⏰ **OVERDUE ITEMS REPORT**\n\n🔴 **CRITICAL (5+ days):**\n- Payment from john@email.com ($250) - 7 days overdue\n- Vehicle inspection: 2020 Honda Civic - 6 days overdue\n\n🟡 **WARNING (2-4 days):**\n- KYC verification for new user (sarah@email.com) - 3 days\n- Update website pricing - 2 days\n- Employee timesheet review - 3 days\n\n📋 **Action Required:**\n1. Contact john@email.com immediately\n2. Schedule Honda inspection ASAP\n3. Complete KYC for sarah@email.com\n\n**Total Overdue: 5 items**";
          saveContext("Overdue items tracking"); // Sets semantic context
          contextSetByCommand = true;

          autoGeneratedTasks = [
            { text: "Contact john@email.com about overdue payment", priority: "high" },
            { text: "Schedule vehicle inspection for 2020 Honda Civic", priority: "high" },
            { text: "Complete KYC for sarah@email.com", priority: "medium" }
          ];

        } else if (command === "/assign") {
          response = "👥 **JOB ASSIGNMENT CENTER**\n\n📊 **Available Team:**\n- Mike (Vehicle Approvals) - 2 tasks assigned\n- Sarah (KYC Verification) - 1 task assigned\n- Tom (Customer Support) - 4 tasks assigned\n- Lisa (Finance) - 3 tasks assigned\n\n📋 **Ready to Assign:**\n1. Vehicle approvals (5 pending) → Assign to Mike?\n2. KYC verifications (3 pending) → Assign to Sarah?\n3. Customer support (4 tickets) → Assign to Tom?\n\n**Who would you like to assign tasks to?**";
          saveContext("Job assignment"); // Sets semantic context
          contextSetByCommand = true;

        } else if (command === "/analytics") {
          response = "📈 **SYSTEM ANALYTICS**\n\n📊 **This Week:**\n- Total Revenue: $45,230 (+23% vs last week)\n- New Subscriptions: 12 (+5)\n- Vehicle Views: 1,248 (+15%)\n- Conversion Rate: 18.5% (+2.1%)\n\n🏆 **Top Performers:**\n- Most Popular: Toyota Camry (23 views)\n- Highest Revenue: Tesla Model 3 ($22,000)\n- Best Converting Tier: Premium (25%)\n\n📈 **Trends:**\n- ↑ 23% increase in subscriptions\n- ↑ 15% more vehicle views\n- Most popular brands: Toyota, Honda, Tesla\n\n📋 **Recommendations:**\n1. Stock more Toyota/Honda models\n2. Promote Premium tier (high conversion)\n3. Focus marketing on 25-35 age group";
          saveContext("Analytics review"); // Sets semantic context
          contextSetByCommand = true;

        } else if (command === "/health") {
          response = "💚 **SYSTEM HEALTH CHECK**\n\n✅ **All Systems Operational:**\n- Website: 99.9% uptime\n- Database: Healthy (45ms avg response)\n- Payment Gateway: Connected\n- Email Service: Active (98% delivery)\n- AI Services: Running smoothly\n\n⚠️ **Warnings:**\n- High traffic detected (good sign!)\n- 3 slow queries detected (optimized)\n- 1 failed email retry (resolved)\n\n📊 **Performance:**\n- Page Load: 1.2s average\n- API Response: 120ms average\n- Error Rate: 0.02% (excellent)\n\n**Overall Status: 95% EXCELLENT ✅**";
          saveContext("System health monitoring"); // Sets semantic context
          contextSetByCommand = true;

        } else if (command === "/payments") {
          response = "💰 **PAYMENT OVERVIEW**\n\n✅ **Today's Payments:**\n- Completed: $8,450 (12 transactions)\n- Pending: $2,100 (3 transactions)\n- Failed: $0 (0 transactions)\n\n📊 **This Month:**\n- Total Revenue: $145,230\n- Average Transaction: $425\n- Payment Success Rate: 98.5%\n\n⏰ **Pending Verification:**\n1. John Smith - $250 (down payment)\n2. Sarah Johnson - $350 (monthly subscription)\n3. Mike Davis - $1,500 (early buyout)\n\n📋 **Action Items:**\n- Verify 3 pending payments\n- Follow up on 1 late payment\n- Process 2 refund requests";
          saveContext("Payment processing"); // Sets semantic context
          contextSetByCommand = true;

          autoGeneratedTasks = [
            { text: "Verify 3 pending payments", priority: "high" },
            { text: "Follow up on late payment", priority: "high" },
            { text: "Process 2 refund requests", priority: "medium" }
          ];
        } else {
          response = "❓ Command not recognized. Try one of the quick actions above!";
          // Do not set context for unrecognized commands, will revert to rolling or previous semantic
        }
      } else {
        // Regular AI chat with context awareness (new prompt structure)
        const contextPrompt = `You are an AI assistant for STOCRX employees.

Context:
- Current user: ${user?.full_name || user?.email || 'Employee'}
- Department: ${user?.department || 'General'}
- Role: ${user?.role || 'employee'}

Previous conversation:
${currentContext}

User question: ${message}

Provide helpful, professional assistance.`;

        response = await base44.integrations.Core.InvokeLLM({
          prompt: contextPrompt,
          add_context_from_internet: false
        });

        // Update rolling conversation context only for regular AI messages, if not overwritten by a command
        const newRollingContext = `${currentContext}\nUser: ${message}\nAssistant: ${response}`.slice(-1000); // Keep last 1000 chars for prompt context
        saveContext(newRollingContext);
      }

      // Auto-extract and add tasks if response contains a list (for both commands and AI responses)
      const extractedTasks = extractTasksFromResponse(response);
      if (extractedTasks.length > 0 && autoGeneratedTasks.length === 0) { // Only use extracted if commands didn't already provide tasks
        autoGeneratedTasks = extractedTasks;
      }

      // Add auto-generated tasks to task list
      if (autoGeneratedTasks.length > 0) {
        autoGeneratedTasks.forEach(task => {
          addTask(task.text, task.priority);
        });
      }

      const aiMessage = {
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
        context: contextSetByCommand ? currentContext : `${currentContext}\nUser: ${message}\nAssistant: ${response}`.slice(-1000), // Store the context that was relevant to this message
        tasksGenerated: autoGeneratedTasks.length
      };
      saveChatHistory([...updatedHistory, aiMessage]);

    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString()
      };
      saveChatHistory([...updatedHistory, errorMessage]);
      // If error occurs, clear context to avoid propagating bad state (or reset to a default)
      saveContext(""); // Reset context on error to avoid persisting potentially problematic context
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    if (!user?.email) return;
    if (confirm("Clear all chat history? This cannot be undone.")) {
      localStorage.removeItem(`ai-chat-history-${user.email}`);
      localStorage.removeItem(`ai-context-${user.email}`); // Clear stored context as well
      setChatHistory([]);
      setCurrentContext(""); // Reset context state
    }
  };

  const overdueTasksCount = taskList.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "complete").length;
  const incompleteTasksCount = taskList.filter(t => t.status === "incomplete").length;

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl z-50 animate-pulse"
      >
        <Bot className="w-8 h-8" />
        {incompleteTasksCount > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-red-600 text-white px-2 py-1 animate-bounce">
            {incompleteTasksCount}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Card className={`fixed ${isMinimized ? 'bottom-6 right-6 w-80' : 'bottom-6 right-6 w-96 h-[600px]'} bg-gray-900 border-gray-700 shadow-2xl z-50 flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-white" />
            <div>
              <h3 className="font-bold text-white">AI Assistant</h3>
              <p className="text-xs text-blue-100">
                {currentContext ? currentContext.split('\n').pop().substring(0, 50) + (currentContext.split('\n').pop().length > 50 ? '...' : '') : "Ready to help"} {/* Display last line of context or default */}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {taskList.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate(createPageUrl("AITaskManager"))}
                className="text-white hover:bg-white/20 relative"
              >
                <List className="w-4 h-4" />
                {incompleteTasksCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-600 px-1 text-xs">
                    {incompleteTasksCount}
                  </Badge>
                )}
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-pulse" />
                <p className="text-sm font-bold">Hi {user?.full_name || user?.email || 'there'}!</p>
                <p className="text-xs mt-2">I keep full chat history and stay focused on your workflow.</p>
                <p className="text-xs mt-1 text-purple-400">I'll create task lists automatically! 📋</p>
              </div>
            )}

            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <div className="flex items-center justify-between mt-2 text-xs opacity-60">
                    <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    {msg.tasksGenerated > 0 && (
                      <Badge className="bg-green-600 text-white px-2 py-0.5 text-xs ml-2">
                        +{msg.tasksGenerated} tasks
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 text-gray-100 p-3 rounded-lg">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Context Indicator */}
          {currentContext && (
            <div className="px-4 py-2 bg-purple-900/30 border-t border-purple-700">
              <p className="text-xs text-purple-300">
                <Sparkles className="w-3 h-3 inline mr-1" />
                Context: {currentContext.length > 100 ? currentContext.substring(0, 100) + '...' : currentContext}
              </p>
            </div>
          )}

          {/* Quick Actions */}
          {showQuickActions && chatHistory.length < 3 && (
            <div className="p-4 border-t border-gray-700 bg-gray-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-gray-400">Quick Actions</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowQuickActions(false)}
                  className="text-gray-400 hover:text-white text-xs"
                >
                  Hide
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                {QUICK_ACTIONS.slice(0, 6).map((action) => (
                  <Button
                    key={action.command}
                    size="sm"
                    onClick={() => {
                      setMessage(action.command);
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white text-xs justify-start h-auto py-2"
                  >
                    <span className="mr-2">{action.icon}</span>
                    <span className="truncate">{action.label}</span>
                  </Button>
                ))}
              </div>
              <Button
                size="sm"
                variant="link"
                onClick={() => navigate(createPageUrl("AITaskManager"))}
                className="w-full text-blue-400 text-xs mt-2"
              >
                See all actions & tasks →
              </Button>
            </div>
          )}

          {/* Task Summary */}
          {taskList.length > 0 && (
            <div className="px-4 py-2 bg-gray-800 border-t border-gray-700">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">
                    <CheckCircle className="w-3 h-3 inline mr-1" />
                    {taskList.filter(t => t.status === "complete").length} Done
                  </span>
                  <span className="text-yellow-400">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {incompleteTasksCount} Pending
                  </span>
                  {overdueTasksCount > 0 && (
                    <span className="text-red-400 animate-pulse">
                      <AlertTriangle className="w-3 h-3 inline mr-1" />
                      {overdueTasksCount} Overdue
                    </span>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="link"
                  onClick={() => navigate(createPageUrl("AITaskManager"))}
                  className="text-blue-400 text-xs p-0"
                >
                  View All
                </Button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Ask me anything... I remember everything!"
                className="bg-gray-800 border-gray-600 text-white"
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !message.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-2">
              {chatHistory.length > 0 && (
                <Button
                  size="sm"
                  variant="link"
                  onClick={clearHistory}
                  className="text-red-400 text-xs"
                >
                  Clear History
                </Button>
              )}
              <p className="text-xs text-gray-500 ml-auto">
                {chatHistory.length} messages in history
              </p>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
