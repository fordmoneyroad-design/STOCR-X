import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Book, Zap, Code, FileText, CheckCircle, AlertTriangle,
  Rocket, Database, Users, Car, DollarSign, Shield
} from "lucide-react";

export default function AppDocumentation() {
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 flex items-center gap-3">
            <Book className="w-12 h-12 text-blue-400" />
            STOCRX Complete Documentation
          </h1>
          <p className="text-xl text-gray-300">Everything you need to know about the platform</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-gray-800 border-gray-700 sticky top-6">
              <h3 className="font-bold text-white mb-4">Quick Nav</h3>
              <div className="space-y-2">
                <Button
                  variant={activeSection === "overview" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveSection("overview")}
                >
                  Overview
                </Button>
                <Button
                  variant={activeSection === "features" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveSection("features")}
                >
                  Features
                </Button>
                <Button
                  variant={activeSection === "architecture" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveSection("architecture")}
                >
                  Architecture
                </Button>
                <Button
                  variant={activeSection === "workflows" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveSection("workflows")}
                >
                  Workflows
                </Button>
                <Button
                  variant={activeSection === "shortcuts" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveSection("shortcuts")}
                >
                  Shortcuts
                </Button>
                <Button
                  variant={activeSection === "technical" ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveSection("technical")}
                >
                  Technical
                </Button>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="p-8 bg-gray-800 border-gray-700">
              
              {/* OVERVIEW */}
              {activeSection === "overview" && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-white mb-6">Platform Overview</h2>
                  
                  <Card className="p-6 bg-gradient-to-br from-blue-600 to-purple-600 border-none text-white">
                    <h3 className="text-2xl font-bold mb-4">🚗 STOCRX - Subscribe to Own Cars</h3>
                    <p className="text-lg mb-4">
                      A revolutionary car ownership platform that combines subscription flexibility with ownership potential.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>✅ Flexible 3-6 month contracts</div>
                      <div>✅ Build equity towards ownership</div>
                      <div>✅ Multiple subscription tiers</div>
                      <div>✅ AI-powered vehicle sourcing</div>
                      <div>✅ Comprehensive admin tools</div>
                      <div>✅ Automated approval workflows</div>
                    </div>
                  </Card>

                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="p-6 bg-gray-700 border-gray-600">
                      <Users className="w-10 h-10 text-blue-400 mb-3" />
                      <h4 className="font-bold text-white mb-2">User Roles</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Super Admin (Full Access)</li>
                        <li>• Admin (Management)</li>
                        <li>• Employee (Department)</li>
                        <li>• Customer (Subscriber)</li>
                        <li>• Tester (QA)</li>
                        <li>• Affiliate (Partner)</li>
                      </ul>
                    </Card>

                    <Card className="p-6 bg-gray-700 border-gray-600">
                      <Car className="w-10 h-10 text-orange-400 mb-3" />
                      <h4 className="font-bold text-white mb-2">Vehicle Types</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Standard (Sedan/SUV)</li>
                        <li>• Premium (Luxury)</li>
                        <li>• High-End (Exotic)</li>
                        <li>• Trucks & Vans</li>
                        <li>• Auction Vehicles</li>
                        <li>• AI-Generated Listings</li>
                      </ul>
                    </Card>

                    <Card className="p-6 bg-gray-700 border-gray-600">
                      <DollarSign className="w-10 h-10 text-green-400 mb-3" />
                      <h4 className="font-bold text-white mb-2">Revenue Streams</h4>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>• Subscription Fees</li>
                        <li>• Down Payments</li>
                        <li>• Insurance Premiums</li>
                        <li>• Late Fees</li>
                        <li>• Delivery Fees</li>
                        <li>• Early Buyout</li>
                      </ul>
                    </Card>
                  </div>
                </div>
              )}

              {/* FEATURES */}
              {activeSection === "features" && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-white mb-6">Platform Features</h2>
                  
                  <Tabs defaultValue="user">
                    <TabsList className="grid w-full grid-cols-4 bg-gray-700">
                      <TabsTrigger value="user">User</TabsTrigger>
                      <TabsTrigger value="admin">Admin</TabsTrigger>
                      <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
                      <TabsTrigger value="ai">AI Tools</TabsTrigger>
                    </TabsList>

                    <TabsContent value="user" className="space-y-4">
                      <h3 className="text-xl font-bold text-white">Customer Features</h3>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          Browse vehicles by location, price, category
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          Apply for subscriptions online
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          Upload KYC documents (license, selfie, insurance)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          Track approval status real-time
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          Manage payments and subscriptions
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          Request tier upgrades
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          Schedule vehicle delivery
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          Submit damage/incident reports
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          Access live chat support
                        </li>
                      </ul>
                    </TabsContent>

                    <TabsContent value="admin" className="space-y-4">
                      <h3 className="text-xl font-bold text-white">Admin Features</h3>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-400" />
                          Universal search (users, vehicles, payments, documents)
                        </li>
                        <li className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-400" />
                          Notification center (pending items)
                        </li>
                        <li className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-400" />
                          Quick approve vehicles & accounts
                        </li>
                        <li className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-400" />
                          Assign approval tasks to team members
                        </li>
                        <li className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-400" />
                          View detailed payment breakdowns
                        </li>
                        <li className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-400" />
                          Access customer profiles & history
                        </li>
                        <li className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-400" />
                          Manage employee payroll
                        </li>
                        <li className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-400" />
                          Create and assign job postings
                        </li>
                        <li className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-blue-400" />
                          Track activity logs
                        </li>
                      </ul>
                    </TabsContent>

                    <TabsContent value="vehicle" className="space-y-4">
                      <h3 className="text-xl font-bold text-white">Vehicle Management</h3>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-orange-400" />
                          Interactive map view (all 50 states)
                        </li>
                        <li className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-orange-400" />
                          Category filters (AI vs Manual, Status, Source)
                        </li>
                        <li className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-orange-400" />
                          Real-time activity feed
                        </li>
                        <li className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-orange-400" />
                          Bulk vehicle import (Copart email links)
                        </li>
                        <li className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-orange-400" />
                          AI-generated descriptions
                        </li>
                        <li className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-orange-400" />
                          Research & analytics dashboard
                        </li>
                        <li className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-orange-400" />
                          Price distribution analysis
                        </li>
                        <li className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-orange-400" />
                          Vehicle inspection tracking
                        </li>
                      </ul>
                    </TabsContent>

                    <TabsContent value="ai" className="space-y-4">
                      <h3 className="text-xl font-bold text-white">AI-Powered Tools</h3>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          AI chatbox with chat history
                        </li>
                        <li className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          Automatic task list generation
                        </li>
                        <li className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          Overdue item tracking
                        </li>
                        <li className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          Daily summary reports
                        </li>
                        <li className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          AI ID verification (fake detection)
                        </li>
                        <li className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          Smart vehicle descriptions
                        </li>
                        <li className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          Copart watchlist monitoring
                        </li>
                        <li className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          System health checks
                        </li>
                      </ul>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* ARCHITECTURE */}
              {activeSection === "architecture" && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-white mb-6">System Architecture</h2>
                  
                  <Card className="p-6 bg-gray-700 border-gray-600">
                    <h3 className="text-xl font-bold text-white mb-4">Tech Stack</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-blue-400 mb-2">Frontend</h4>
                        <ul className="text-sm text-gray-300 space-y-1">
                          <li>• React 18</li>
                          <li>• TailwindCSS</li>
                          <li>• shadcn/ui components</li>
                          <li>• React Router DOM</li>
                          <li>• React Query (data management)</li>
                          <li>• Framer Motion (animations)</li>
                          <li>• React Leaflet (maps)</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-green-400 mb-2">Backend (Base44 Platform)</h4>
                        <ul className="text-sm text-gray-300 space-y-1">
                          <li>• Entity-based database</li>
                          <li>• Built-in authentication</li>
                          <li>• File storage</li>
                          <li>• AI integrations</li>
                          <li>• Email service</li>
                          <li>• Activity logging</li>
                        </ul>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-gray-700 border-gray-600">
                    <h3 className="text-xl font-bold text-white mb-4">Database Entities (18)</h3>
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-300">
                      <div>
                        <Badge className="mb-2 bg-blue-600">Core</Badge>
                        <ul className="space-y-1">
                          <li>• User</li>
                          <li>• Vehicle</li>
                          <li>• Subscription</li>
                          <li>• Payment</li>
                        </ul>
                      </div>
                      <div>
                        <Badge className="mb-2 bg-purple-600">Management</Badge>
                        <ul className="space-y-1">
                          <li>• ActivityLog</li>
                          <li>• Document</li>
                          <li>• DamageReport</li>
                          <li>• VehicleInspection</li>
                        </ul>
                      </div>
                      <div>
                        <Badge className="mb-2 bg-green-600">Operations</Badge>
                        <ul className="space-y-1">
                          <li>• Payroll</li>
                          <li>• PayrollRequest</li>
                          <li>• Schedule</li>
                          <li>• TimeTracking</li>
                          <li>• JobPosting</li>
                          <li>• CareerApplication</li>
                        </ul>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* WORKFLOWS */}
              {activeSection === "workflows" && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-white mb-6">Key Workflows</h2>
                  
                  <Card className="p-6 bg-gradient-to-br from-blue-900 to-purple-900 border-blue-700">
                    <h3 className="text-xl font-bold text-white mb-4">Customer Subscription Flow</h3>
                    <div className="space-y-3 text-white">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-blue-600">1</Badge>
                        <p>Customer browses vehicles → Applies for subscription</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-blue-600">2</Badge>
                        <p>Uploads KYC documents (license front/back, selfie, insurance)</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-blue-600">3</Badge>
                        <p>AI verifies ID authenticity (fake detection)</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-blue-600">4</Badge>
                        <p>Admin reviews and approves/denies</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-blue-600">5</Badge>
                        <p>Customer makes down payment + selects payment frequency</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-blue-600">6</Badge>
                        <p>Vehicle scheduled for delivery</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-blue-600">7</Badge>
                        <p>Monthly payments tracked automatically</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-green-600">8</Badge>
                        <p>Customer owns vehicle after full payment!</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-gradient-to-br from-orange-900 to-red-900 border-orange-700">
                    <h3 className="text-xl font-bold text-white mb-4">Vehicle Approval Flow</h3>
                    <div className="space-y-3 text-white">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-orange-600">1</Badge>
                        <p>Vehicle added (Manual upload or AI-generated)</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-orange-600">2</Badge>
                        <p>Status: "pending_approval"</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-orange-600">3</Badge>
                        <p>Appears in Super Admin pending queue</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-orange-600">4</Badge>
                        <p>Admin reviews: price, condition, images, location</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-orange-600">5</Badge>
                        <p>Option A: Quick Approve (instant) | Option B: Assign to team member</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-green-600">6</Badge>
                        <p>Status: "available" → Visible to customers</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-gradient-to-br from-green-900 to-teal-900 border-green-700">
                    <h3 className="text-xl font-bold text-white mb-4">Payment Verification Flow</h3>
                    <div className="space-y-3 text-white">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-green-600">1</Badge>
                        <p>Customer makes payment (card, ACH, manual)</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-green-600">2</Badge>
                        <p>Payment status: "pending" (1-2 days for manual)</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-green-600">3</Badge>
                        <p>Admin views detailed payment info (customer, vehicle, subscription)</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-green-600">4</Badge>
                        <p>Admin clicks "View Full Payment Details"</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-green-600">5</Badge>
                        <p>Can navigate to: Customer Profile | Subscription | Vehicle</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-green-600">6</Badge>
                        <p>Admin approves → Status: "completed"</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-green-600">7</Badge>
                        <p>Amount applied to subscription balance</p>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* SHORTCUTS */}
              {activeSection === "shortcuts" && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-white mb-6">Keyboard Shortcuts & Quick Access</h2>
                  
                  <Card className="p-6 bg-gray-700 border-gray-600">
                    <h3 className="text-xl font-bold text-white mb-4">AI Chatbox Commands</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-blue-400 font-mono">/watchlist</p>
                        <p className="text-sm text-gray-300">Check Copart watchlist</p>
                      </div>
                      <div>
                        <p className="text-blue-400 font-mono">/generate-descriptions</p>
                        <p className="text-sm text-gray-300">Generate AI car descriptions</p>
                      </div>
                      <div>
                        <p className="text-blue-400 font-mono">/import-links</p>
                        <p className="text-sm text-gray-300">Import Copart email links</p>
                      </div>
                      <div>
                        <p className="text-blue-400 font-mono">/daily-summary</p>
                        <p className="text-sm text-gray-300">Get daily summary report</p>
                      </div>
                      <div>
                        <p className="text-blue-400 font-mono">/tasklist</p>
                        <p className="text-sm text-gray-300">Create AI task list</p>
                      </div>
                      <div>
                        <p className="text-blue-400 font-mono">/overdue</p>
                        <p className="text-sm text-gray-300">Check overdue items</p>
                      </div>
                      <div>
                        <p className="text-blue-400 font-mono">/assign</p>
                        <p className="text-sm text-gray-300">Assign jobs to team</p>
                      </div>
                      <div>
                        <p className="text-blue-400 font-mono">/analytics</p>
                        <p className="text-sm text-gray-300">View system analytics</p>
                      </div>
                      <div>
                        <p className="text-blue-400 font-mono">/health</p>
                        <p className="text-sm text-gray-300">System health check</p>
                      </div>
                      <div>
                        <p className="text-blue-400 font-mono">/help</p>
                        <p className="text-sm text-gray-300">Get help & ask questions</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-gray-700 border-gray-600">
                    <h3 className="text-xl font-bold text-white mb-4">Super Admin Quick Actions</h3>
                    <ul className="space-y-2 text-gray-300">
                      <li>• <Badge className="mr-2 bg-orange-600">Car Approvals</Badge> Button (top right) → Pending vehicle approvals</li>
                      <li>• <Badge className="mr-2 bg-blue-600">Account Approvals</Badge> Button (top right) → Pending KYC verifications</li>
                      <li>• <Badge className="mr-2 bg-yellow-600">Notifications</Badge> Bell icon → View all pending items</li>
                      <li>• <Badge className="mr-2 bg-purple-600">Universal Search</Badge> Left panel → Search everything</li>
                      <li>• <Badge className="mr-2 bg-green-600">Quick Filters</Badge> In search → One-click common searches</li>
                    </ul>
                  </Card>

                  <Card className="p-6 bg-gray-700 border-gray-600">
                    <h3 className="text-xl font-bold text-white mb-4">URL Parameters</h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-300">
                        <span className="text-blue-400 font-mono">?tab=users</span> → Open specific tab in Super Admin
                      </p>
                      <p className="text-gray-300">
                        <span className="text-blue-400 font-mono">?email=user@email.com</span> → Open user profile directly
                      </p>
                      <p className="text-gray-300">
                        <span className="text-blue-400 font-mono">?id=123</span> → Open specific vehicle/subscription/payment
                      </p>
                    </div>
                  </Card>
                </div>
              )}

              {/* TECHNICAL */}
              {activeSection === "technical" && (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-white mb-6">Technical Guide</h2>
                  
                  <Card className="p-6 bg-gray-700 border-gray-600">
                    <h3 className="text-xl font-bold text-white mb-4">Base44 Platform Optimization</h3>
                    <div className="space-y-4 text-gray-300">
                      <div>
                        <h4 className="font-semibold text-blue-400 mb-2">✅ Best Practices</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Use React Query for all data fetching (built-in caching)</li>
                          <li>• Parallel tool calls when possible (multiple API calls simultaneously)</li>
                          <li>• Entity references by ID (not embedded objects)</li>
                          <li>• Activity logging for all critical actions</li>
                          <li>• Client-side filtering for better performance</li>
                          <li>• LocalStorage for chat history and tasks</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-red-400 mb-2">❌ Avoid</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Try/catch blocks (errors should bubble up)</li>
                          <li>• Sequential API calls (use parallel when independent)</li>
                          <li>• Storing large data in entities (use file storage)</li>
                          <li>• Over-fetching (use filters instead of list-then-filter)</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-green-400 mb-2">🔧 Performance Tips</h4>
                        <ul className="space-y-1 text-sm">
                          <li>• Use initialData in useQuery to prevent loading flickers</li>
                          <li>• Implement pagination for large lists</li>
                          <li>• Lazy load components with React.lazy()</li>
                          <li>• Memoize expensive calculations with useMemo</li>
                          <li>• Debounce search inputs</li>
                        </ul>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 bg-gray-700 border-gray-600">
                    <h3 className="text-xl font-bold text-white mb-4">Integration Patterns</h3>
                    <div className="bg-gray-800 p-4 rounded-lg mb-4">
                      <p className="text-xs text-gray-500 mb-2">// AI LLM Integration</p>
                      <code className="text-green-400 text-sm">
{`const response = await base44.integrations.Core.InvokeLLM({
  prompt: "Your prompt here",
  add_context_from_internet: true,
  response_json_schema: { type: "object", properties: {...} }
});`}
                      </code>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg mb-4">
                      <p className="text-xs text-gray-500 mb-2">// Email Notification</p>
                      <code className="text-green-400 text-sm">
{`await base44.integrations.Core.SendEmail({
  to: "user@example.com",
  subject: "Subject",
  body: "Email content here"
});`}
                      </code>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg">
                      <p className="text-xs text-gray-500 mb-2">// File Upload</p>
                      <code className="text-green-400 text-sm">
{`const { file_url } = await base44.integrations.Core.UploadFile({ 
  file: fileObject 
});`}
                      </code>
                    </div>
                  </Card>
                </div>
              )}

            </Card>
          </div>
        </div>

        {/* Footer CTA */}
        <Card className="p-8 bg-gradient-to-br from-blue-600 to-purple-600 border-none text-white mt-8 text-center">
          <Rocket className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Ready to Build?</h2>
          <p className="text-lg mb-6">
            This documentation covers 95% of the platform. For specific questions, use the AI Assistant chatbox!
          </p>
          <Badge className="bg-white text-blue-600 text-lg px-6 py-3">
            🚀 Platform Status: PRODUCTION READY
          </Badge>
        </Card>
      </div>
    </div>
  );
}