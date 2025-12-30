import { CheckCircle, AlertCircle, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import HowItWorksSection from "../components/home/HowItWorksSection";

const policies = [
  {
    title: "Ownership Structure",
    description: "No lump sum buyout required — ownership comes through subscription payments",
    icon: CheckCircle,
    color: "text-green-600"
  },
  {
    title: "Contract Terms",
    description: "Flexible contracts from 3-6 months",
    icon: Info,
    color: "text-blue-600"
  },
  {
    title: "Late Policy",
    description: "Week 1-4 flat fees (editable per week). After 30 days delinquency → vehicle suspension and collections",
    icon: AlertCircle,
    color: "text-red-600"
  },
  {
    title: "Early Buyout",
    description: "25% discount on remaining balance (editable per car)",
    icon: CheckCircle,
    color: "text-purple-600"
  },
  {
    title: "Delivery",
    description: "Free local delivery within 25 miles / paid long distance (added to payments)",
    icon: CheckCircle,
    color: "text-green-600"
  },
  {
    title: "Termination",
    description: "Free pick-up, must provide release & police report after 4 weeks delinquency",
    icon: Info,
    color: "text-orange-600"
  },
  {
    title: "Insurance",
    description: "Optional or mandatory (toggle per car)",
    icon: AlertCircle,
    color: "text-blue-600"
  },
  {
    title: "Education",
    description: "Multi-language education course available (with captions & transcripts)",
    icon: Info,
    color: "text-indigo-600"
  }
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            How It Works
          </h1>
          <p className="text-xl text-green-50 max-w-2xl mx-auto">
            Your complete guide to subscription-to-own car rentals
          </p>
        </div>
      </div>

      {/* Process Steps */}
      <div className="py-16">
        <HowItWorksSection />
      </div>

      {/* Policy Highlights */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Policy Highlights
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about our terms and policies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {policies.map((policy, index) => (
              <Card key={index} className="p-6 hover:shadow-xl transition-shadow duration-300 border-none">
                <policy.icon className={`w-8 h-8 ${policy.color} mb-4`} />
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {policy.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {policy.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Fees Breakdown */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Fee Structure
            </h2>
          </div>

          <div className="space-y-6">
            <Card className="p-6 border-l-4 border-green-500">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Down Payment</h3>
                  <p className="text-gray-600">Minimum $1,000 • NON-REFUNDABLE</p>
                </div>
                <span className="text-2xl font-bold text-green-600">Required</span>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-blue-500">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Finance Fee</h3>
                  <p className="text-gray-600">One-time flat fee • NON-REFUNDABLE</p>
                </div>
                <span className="text-2xl font-bold text-blue-600">$500</span>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-purple-500">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-xl text-gray-900 mb-2">Platform Fee</h3>
                  <p className="text-gray-600">Applied to all recurring payments</p>
                </div>
                <span className="text-2xl font-bold text-purple-600">0.6%</span>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}