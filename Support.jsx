
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Mail, Phone, MessageCircle, Search, ChevronDown, ChevronUp } from "lucide-react";
import { base44 } from "@/api/base44Client";

const faqs = [
  {
    question: "How does the subscription-to-own model work?",
    answer: "You pay a down payment to start, then make regular subscription payments. Every payment goes toward building ownership of the vehicle. Once you've paid the full vehicle price, it's yours!"
  },
  {
    question: "What happens if I'm late on a payment?",
    answer: "Flat late fees are applied weekly (Week 1-4). After 30 days of delinquency (4 missed payments), the vehicle may be suspended/disabled and sent to collections."
  },
  {
    question: "Can I swap or upgrade my vehicle?",
    answer: "Yes! Planned trade-ins are allowed starting one month (or 4 weekly periods) after your down payment. Upgrades are allowed only at the completion of a full subscription cycle (minimum 91 days)."
  },
  {
    question: "Is insurance required?",
    answer: "Insurance requirements vary by vehicle. Some vehicles require mandatory insurance, while others have it as optional. You must upload proof of coverage before your subscription activates if it's required."
  },
  {
    question: "What is the early buyout discount?",
    answer: "If you want to complete ownership early, you receive a 25% discount on the remaining balance (default rate, may vary per vehicle)."
  },
  {
    question: "How does delivery work?",
    answer: "Free delivery within 25 miles of our location. Delivery beyond 25 miles incurs a fee that's added to your next payment. Delivery typically takes 2-7 days."
  },
  {
    question: "What if I need to terminate my subscription?",
    answer: "After 4 weeks of delinquency, you can request free termination with a police report and signed release. Vehicle pickup is free."
  },
  {
    question: "Are the down payment and finance fees refundable?",
    answer: "No, both the down payment and finance fee are NON-REFUNDABLE once the subscription term begins."
  }
];

export default function Support() {
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendEmail = async () => {
    if (!email || !message) return;
    
    setSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: "support@stocrx.com", // Changed email address
        subject: `Support Request from ${email}`,
        body: message
      });
      setSent(true);
      setEmail("");
      setMessage("");
      setTimeout(() => setSent(false), 3000);
    } catch (error) {
      console.error("Error sending email:", error);
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Support Center
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're here to help you every step of the way
          </p>
        </div>

        {/* Contact Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-16"> {/* Changed grid-cols to 2 */}
          <Card className="p-8 text-center hover:shadow-xl transition-shadow border-none">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI Chatbot</h3>
            <p className="text-gray-600 mb-4">24/7 instant support for common questions</p>
            <Button variant="outline" className="w-full">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat Now
            </Button>
          </Card>

          <Card className="p-8 text-center hover:shadow-xl transition-shadow border-none">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"> {/* Changed background color */}
              <Mail className="w-8 h-8 text-purple-600" /> {/* Changed icon color */}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">Response within 24 hours</p>
            <a href="mailto:info@stocrx.com"> {/* Changed mailto link */}
              <Button variant="outline" className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Email Us
              </Button>
            </a>
          </Card>
          {/* Phone Support card removed as per outline */}
        </div>

        {/* FAQs */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <Card key={index} className="overflow-hidden border-none shadow-md">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-lg pr-4">
                    {faq.question}
                  </span>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-6 text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto mt-16">
          <Card className="p-8 shadow-xl border-none">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Still Have Questions?
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you?"
                  rows={6}
                />
              </div>
              <Button
                onClick={handleSendEmail}
                disabled={sending || !email || !message}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 h-12"
              >
                {sending ? "Sending..." : sent ? "Message Sent!" : "Send Message"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
