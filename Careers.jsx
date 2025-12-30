
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Briefcase, MapPin, Clock, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert"; // This import is no longer strictly needed if the Alert section is removed. Keeping for completeness if other parts of the code might implicitly use it.
import { Button } from "@/components/ui/button"; // Added Button component

// Helper function to create page URLs
const createPageUrl = (pageName) => {
  switch (pageName) {
    case "CareerApplication":
      return "/career-application"; // Adjust this path as per your routing setup
    default:
      return `/${pageName.toLowerCase()}`;
  }
};

const positions = [
  {
    title: "Incident Manager & Roadside Assistance",
    department: "Accidents, Damages, Tow Reporting",
    description: "Handles incident management, damage claims, and roadside assistance coordination",
    location: "On-site / Hybrid",
    type: "Full-time"
  },
  {
    title: "Operations Manager & E-commerce Specialist",
    department: "Logins, Account Operations & E-commerce",
    description: "Manages Shopify store, subscription app, customer account portal, and website performance. Acts as internal project lead for all tech integrations. Oversees Web Dev, UI/UX, QA, Customer Success, and Order Processing",
    location: "Remote / Hybrid",
    type: "Full-time"
  },
  {
    title: "Fleet & Logistics Coordinator",
    department: "Inventory Fleet & Logistics",
    description: "Manages car fleet, coordinates vehicle acquisition/disposal, schedules maintenance, and organizes all customer deliveries and pickups. Oversees physical assets and delivery process",
    location: "On-site",
    type: "Full-time"
  },
  {
    title: "Payroll, Finance & HR Administrator",
    department: "Back Office",
    description: "Handles payroll, manages employee onboarding/offboarding, tracks company financials, and ensures basic legal/compliance documentation is in order. Manages the company's money and people",
    location: "Remote / Hybrid",
    type: "Full-time"
  },
  {
    title: "Customer Experience & Support Representative",
    department: "Customer Service & Light Admin",
    description: "Main customer-facing role. Handles all customer inquiries (pre- and post-subscription), manages subscription changes in admin, and helps with basic billing/account issues",
    location: "Remote",
    type: "Full-time"
  },
  {
    title: "Digital Marketing & Content Specialist",
    department: "Marketing",
    description: "Runs all online ad campaigns, manages social media, creates website copy, and tracks SEO/analytics for growth. Focused on customer acquisition and brand building",
    location: "Remote / Hybrid",
    type: "Full-time"
  },
  {
    title: "Live Chat Agent",
    department: "Customer Support",
    description: "Provides real-time customer support through live chat, handles inquiries, and assists with basic troubleshooting",
    location: "Remote",
    type: "Part-time (40%)"
  }
];

export default function Careers() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Join Our Team
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Help us revolutionize the way people own cars
          </p>
        </div>

        {/* The "Currently No Openings" Alert component has been removed as positions are now available */}

        {/* Mission & Values */}
        <div className="mb-16 max-w-4xl mx-auto">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-blue-50 to-purple-50 border-none shadow-xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              At STOCRX, we're transforming car ownership by making it accessible, 
              flexible, and transparent. We believe everyone deserves the freedom to drive without 
              the burden of traditional car financing.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Innovation</h3>
                <p className="text-gray-600 text-sm">Pioneering new ways to own</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Customer First</h3>
                <p className="text-gray-600 text-sm">Your success is our success</p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Transparency</h3>
                <p className="text-gray-600 text-sm">Honest, clear, and fair</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Departments Overview */}
        <div className="mb-12 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Our Departments
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Incidents & Roadside", icon: "🚨" },
              { name: "Tech & E-commerce", icon: "💻" },
              { name: "Fleet & Logistics", icon: "🚗" },
              { name: "Finance & HR", icon: "💼" },
              { name: "Customer Support", icon: "🤝" },
              { name: "Marketing", icon: "📱" }
            ].map((dept, idx) => (
              <Card key={idx} className="p-4 border-none shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{dept.icon}</span>
                  <span className="font-semibold text-gray-900">{dept.name}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Open Positions */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Current Opportunities
          </h2>

          <div className="space-y-4">
            {positions.map((position, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow border-none"> {/* Removed opacity-60 */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {position.title}
                          </h3>
                          <p className="text-sm text-blue-600 font-semibold mb-2">
                            {position.department}
                          </p>
                          <p className="text-sm text-gray-600 mb-3">
                            {position.description}
                          </p>
                        </div>
                        <Button
                          onClick={() => window.location.href = createPageUrl("CareerApplication")}
                          className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                        >
                          Apply Now
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="border-gray-300">
                          <MapPin className="w-3 h-3 mr-1" />
                          {position.location}
                        </Badge>
                        <Badge variant="outline" className="border-gray-300">
                          <Clock className="w-3 h-3 mr-1" />
                          {position.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 max-w-4xl mx-auto text-center">
          <Card className="p-12 bg-gradient-to-br from-gray-900 to-gray-800 text-white border-none shadow-2xl">
            <h2 className="text-3xl font-bold mb-4">
              Don't See the Right Fit?
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              We're always looking for talented individuals. Send us your resume and we'll keep you in mind for future opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.location.href = createPageUrl("CareerApplication")}
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                Submit Application
              </Button>
              <a href="mailto:careers@stocrx.com">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  Email careers@stocrx.com
                </Button>
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
