import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Bot, User as UserIcon, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LiveChat() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatStarted, setChatStarted] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
        }
      } catch (err) {
        // Not authenticated - can still use chat
      }
    };
    checkAuth();

    // Welcome message
    setMessages([{
      role: 'assistant',
      content: 'Hello! 👋 I\'m your STOCRX AI assistant. How can I help you today?',
      timestamp: new Date()
    }]);
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);
    setChatStarted(true);

    try {
      // Use AI to respond
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful customer support assistant for STOCRX, a subscription-to-own car rental platform. 
        
        Context about STOCRX:
        - Subscription-to-own model: customers pay down payment + weekly/monthly subscriptions
        - Every payment builds equity toward ownership
        - 3-6 month contract terms
        - Can swap or upgrade vehicles
        - 25% early buyout discount
        - FREE military VIP tier
        - Standard, Premium, Travelers, High End tiers
        - AI instant approval
        - 0.6% platform fee on payments
        
        Customer message: "${inputMessage}"
        
        Provide a helpful, friendly response. If they need human support, direct them to email stocrx@gmail.com or mention they'll be connected to a live agent soon.`,
        add_context_from_internet: false
      });

      const assistantMessage = {
        role: 'assistant',
        content: response || 'I apologize, but I\'m having trouble responding right now. Please email us at stocrx@gmail.com or try again.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please email us at stocrx@gmail.com for immediate assistance.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setLoading(false);
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  const quickQuestions = [
    "How does subscription-to-own work?",
    "What are the subscription tiers?",
    "Can I swap my vehicle?",
    "What's the early buyout discount?",
    "Do I need insurance?"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full text-blue-800 mb-4">
            <MessageCircle className="w-5 h-5" />
            <span className="font-semibold">Live Support</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            How Can We Help?
          </h1>
          <p className="text-gray-600">
            Chat with our AI assistant or request a live agent
          </p>
        </div>

        {!chatStarted && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Bot className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>AI Assistant available 24/7.</strong> For complex issues, we'll connect you with a live agent during business hours.
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-none shadow-2xl overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">STOCRX Support</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-blue-100">Online</span>
                  </div>
                </div>
              </div>
              {user && (
                <Badge className="bg-white text-blue-600">
                  {user.email}
                </Badge>
              )}
            </div>
          </div>

          {/* Quick Questions */}
          {!chatStarted && (
            <div className="p-6 bg-gray-50 border-b">
              <p className="text-sm text-gray-600 mb-3">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((q, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickQuestion(q)}
                    className="text-xs"
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`flex items-start gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' ? 'bg-blue-600' : 'bg-gray-200'
                  }`}>
                    {message.role === 'user' ? (
                      <UserIcon className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  
                  <div>
                    <div className={`rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 px-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl p-4">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-6 bg-white border-t">
            <div className="flex gap-3">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 h-12"
                disabled={loading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={loading || !inputMessage.trim()}
                className="h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Need immediate help? Email us at <a href="mailto:stocrx@gmail.com" className="text-blue-600 underline">stocrx@gmail.com</a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}