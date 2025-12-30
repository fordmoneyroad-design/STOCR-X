import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Bot, User, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SupportLiveChat() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatActive, setChatActive] = useState(true);
  
  // Support ticket form
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
          setMessages([
            {
              role: "assistant",
              content: `Hi ${currentUser.full_name || 'there'}! 👋 I'm your STOCRX AI assistant. How can I help you today?`
            }
          ]);
        } else {
          setMessages([
            {
              role: "assistant",
              content: "Welcome to STOCRX Support! Please sign in to start a chat, or submit a support ticket below."
            }
          ]);
          setChatActive(false);
        }
      } catch (err) {
        setChatActive(false);
      }
    };
    checkAuth();
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = inputMessage;
    setInputMessage("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful customer support agent for STOCRX, a subscription-to-own car rental platform.

Customer context:
- Name: ${user?.full_name || 'Guest'}
- Email: ${user?.email || 'Not signed in'}
- Tier: ${user?.subscription_tier || 'free'}

Platform details:
- Subscription-to-own model (rent and build equity)
- Multiple tiers: Free, Standard, Premium, Military VIP, Travelers, High-End, Lifetime
- Down payments are NON-REFUNDABLE
- Membership fees are NON-REFUNDABLE
- 25% early buyout discount available
- All vehicles are USED CARS - sold AS-IS
- Insurance required (except Military VIP)
- Contract lengths: 3-6 months
- Payment options: weekly, bi-weekly, monthly

Customer question: ${userMessage}

Provide a helpful, friendly, and accurate response. Be concise but thorough.`,
        add_context_from_internet: false
      });

      setMessages(prev => [...prev, {
        role: "assistant",
        content: response || "I apologize, but I'm having trouble responding right now. Please try again or contact support@stocrx.com"
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please email support@stocrx.com for immediate assistance."
      }]);
    }
    setLoading(false);
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await base44.integrations.Core.SendEmail({
        to: "support@stocrx.com",
        subject: `Support Ticket: ${ticketSubject}`,
        body: `
          Support Ticket Received
          
          From: ${user?.email || 'Anonymous'}
          Name: ${user?.full_name || 'Not provided'}
          
          Subject: ${ticketSubject}
          
          Message:
          ${ticketMessage}
          
          User Tier: ${user?.subscription_tier || 'Not logged in'}
        `
      });

      if (user?.email) {
        await base44.integrations.Core.SendEmail({
          to: user.email,
          subject: "STOCRX Support - Ticket Received",
          body: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <h1 style="color: white;">Support Ticket Received</h1>
              </div>
              <div style="padding: 30px; background: white;">
                <p>Hi ${user.full_name},</p>
                <p>We've received your support ticket and will respond within 24 hours.</p>
                
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Subject:</strong> ${ticketSubject}</p>
                  <p><strong>Your Message:</strong></p>
                  <p>${ticketMessage}</p>
                </div>
                
                <p>Thank you for your patience!</p>
                <p style="margin-top: 20px;">Best regards,<br>STOCRX Support Team</p>
              </div>
            </div>
          `
        });
      }

      setTicketSubmitted(true);
      setTicketSubject("");
      setTicketMessage("");
    } catch (err) {
      alert("Error submitting ticket. Please email support@stocrx.com directly.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-12">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Support & Live Chat
          </h1>
          <p className="text-gray-600">
            Get instant help or submit a support ticket
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Live Chat */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col border-none shadow-xl">
              <div className="p-6 border-b bg-gradient-to-r from-blue-500 to-purple-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bot className="w-8 h-8 text-white" />
                    <div>
                      <h2 className="text-xl font-bold text-white">AI Support Assistant</h2>
                      <Badge className="bg-green-500 text-white">
                        Online 24/7
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        {msg.role === 'assistant' ? (
                          <Bot className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        ) : (
                          <User className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="font-semibold text-sm">
                          {msg.role === 'assistant' ? 'AI Assistant' : user?.full_name || 'You'}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl p-4">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t">
                {chatActive ? (
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1"
                      disabled={loading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={loading || !inputMessage.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">Sign in to use live chat</p>
                    <Button
                      onClick={() => base44.auth.redirectToLogin()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Sign In
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Support Ticket Form */}
          <div>
            <Card className="p-6 border-none shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="w-6 h-6 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">Submit Support Ticket</h3>
              </div>

              {ticketSubmitted ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Ticket submitted! We'll respond within 24 hours.
                  </AlertDescription>
                </Alert>
              ) : (
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Subject</label>
                    <Input
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      required
                      placeholder="Brief description..."
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block">Message</label>
                    <Textarea
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      required
                      className="h-32"
                      placeholder="Describe your issue..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? "Submitting..." : "Submit Ticket"}
                  </Button>
                </form>
              )}

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Email Support:</strong>
                </p>
                <a
                  href="mailto:support@stocrx.com"
                  className="text-blue-600 hover:underline"
                >
                  support@stocrx.com
                </a>
              </div>
            </Card>

            <Card className="p-6 mt-6 bg-blue-50 border-blue-200">
              <h4 className="font-bold text-gray-900 mb-3">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <a href="/HowItWorks" className="block text-blue-600 hover:underline">
                  How It Works
                </a>
                <a href="/Calculator" className="block text-blue-600 hover:underline">
                  Payment Calculator
                </a>
                <a href="/Terms" className="block text-blue-600 hover:underline">
                  Terms of Service
                </a>
                <a href="/Privacy" className="block text-blue-600 hover:underline">
                  Privacy Policy
                </a>
                <a href="/Careers" className="block text-blue-600 hover:underline">
                  Careers
                </a>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}