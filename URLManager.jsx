import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Link as LinkIcon, Copy, ExternalLink, Search, Trash2, CheckCircle } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function URLManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedUrl, setCopiedUrl] = useState("");

  // Get all pages dynamically
  const allPages = [
    // Public Pages
    { name: "Home", path: "Home", category: "Public", description: "Landing page" },
    { name: "Browse Cars", path: "BrowseCars", category: "Public", description: "Vehicle inventory" },
    { name: "Car Details", path: "CarDetails", category: "Public", description: "Vehicle details + ?id=" },
    { name: "Subscription Plans", path: "SubscriptionPlans", category: "Public", description: "Pricing tiers" },
    { name: "Calculator", path: "Calculator", category: "Public", description: "Payment calculator" },
    { name: "How It Works", path: "HowItWorks", category: "Public", description: "Process explanation" },
    { name: "Careers", path: "Careers", category: "Public", description: "Job openings" },
    { name: "Career Application", path: "CareerApplication", category: "Public", description: "Apply for jobs" },
    { name: "Terms", path: "Terms", category: "Public", description: "Terms of service" },
    { name: "Privacy", path: "Privacy", category: "Public", description: "Privacy policy" },
    
    // Customer Pages
    { name: "My Account", path: "MyAccount", category: "Customer", description: "Account dashboard" },
    { name: "Account Approval Status", path: "AccountApprovalStatus", category: "Customer", description: "KYC status" },
    { name: "Customer Returns", path: "CustomerReturns", category: "Customer", description: "Manage returns" },
    { name: "Make Payment", path: "MakePayment", category: "Customer", description: "Payment portal" },
    { name: "Early Buyout", path: "EarlyBuyout", category: "Customer", description: "Early purchase" },
    { name: "Swap/Upgrade", path: "SwapUpgrade", category: "Customer", description: "Vehicle swap" },
    { name: "Report Incident", path: "ReportIncident", category: "Customer", description: "Damage reports" },
    { name: "Schedule Delivery", path: "ScheduleDelivery", category: "Customer", description: "Delivery scheduling" },
    { name: "Onboarding", path: "Onboarding", category: "Customer", description: "New user setup" },
    
    // Employee Pages
    { name: "Employee Dashboard", path: "EmployeeDashboard", category: "Employee", description: "Employee home" },
    { name: "My Shifts", path: "MyShifts", category: "Employee", description: "Time clock" },
    { name: "AI Assistant", path: "AIAssistantEmployee", category: "Employee", description: "AI helper" },
    
    // Manager Pages
    { name: "Manager Dashboard", path: "ManagerDashboard", category: "Manager", description: "Manager tools" },
    { name: "Payroll Dashboard", path: "PayrollDashboard", category: "Manager", description: "Payroll management" },
    { name: "Financing Management", path: "FinancingManagement", category: "Manager", description: "Financing options" },
    { name: "Job Management", path: "JobManagement", category: "Manager", description: "Job postings" },
    { name: "Hire or Fire", path: "HireOrFire", category: "Manager", description: "Applications review" },
    { name: "Theme Manager", path: "ThemeManager", category: "Manager", description: "Theme settings" },
    
    // Super Admin Pages
    { name: "Super Admin", path: "SuperAdmin", category: "Super Admin", description: "Master control" },
    { name: "Super Admin Cars", path: "SuperAdminCars", category: "Super Admin", description: "Add vehicles" },
    { name: "Pending Approvals", path: "PendingApprovals", category: "Super Admin", description: "KYC approvals" },
    { name: "Pending Vehicle Approvals", path: "PendingVehicleApprovals", category: "Super Admin", description: "Car approvals" },
    { name: "Vehicle Management", path: "VehicleManagement", category: "Super Admin", description: "Full vehicle control" },
    { name: "Employee Timeout Monitor", path: "EmployeeTimeoutMonitor", category: "Super Admin", description: "Break monitoring" },
    { name: "Store Credit Management", path: "StoreCreditManagement", category: "Super Admin", description: "Credits & refunds" },
    { name: "Vehicle Inspection", path: "VehicleInspection", category: "Super Admin", description: "Inspection reports" },
    { name: "Call Center Dispatch", path: "CallCenterDispatch", category: "Super Admin", description: "Dispatch system" },
    { name: "System Testing", path: "SystemTesting", category: "Super Admin", description: "Test features" },
    { name: "Account Recovery", path: "AccountRecovery", category: "Super Admin", description: "Password reset" },
    { name: "Create Employee", path: "CreateEmployee", category: "Super Admin", description: "Add team members" },
    { name: "Company Management", path: "CompanyManagement", category: "Super Admin", description: "Manage companies" },
    { name: "Search Analytics", path: "SearchAnalytics", category: "Super Admin", description: "Search data" },
    { name: "Inventory Supply List", path: "InventorySupplyList", category: "Super Admin", description: "Supplies" },
    { name: "Vehicle Auto Removal", path: "VehicleAutoRemoval", category: "Super Admin", description: "Auto deletion" },
    { name: "Auction Assessment", path: "AuctionAssessment", category: "Super Admin", description: "Auction tools" },
    { name: "Partner Account Creation", path: "PartnerAccountCreation", category: "Super Admin", description: "Add partners" },
    { name: "Affiliate Management", path: "AffiliateManagement", category: "Super Admin", description: "Affiliate program" },
    { name: "License Management", path: "LicenseManagement", category: "Super Admin", description: "Certifications" },
    { name: "Maintenance Tracking", path: "MaintenanceTracking", category: "Super Admin", description: "Vehicle service" },
    { name: "Copart Locator", path: "CopartLocator", category: "Super Admin", description: "Vehicle sourcing" },
    { name: "IRS Tax Calculator", path: "IRSTaxCalculator", category: "Super Admin", description: "Tax tools" },
    { name: "PWA Analytics Dashboard", path: "PWAAnalyticsDashboard", category: "Super Admin", description: "App installs" },
    
    // Support & Special
    { name: "Support Live Chat", path: "SupportLiveChat", category: "Support", description: "Customer support" },
    { name: "PWA Install Guide", path: "PWAInstallGuide", category: "Special", description: "App installation" },
    { name: "Military Verification", path: "MilitaryVerification", category: "Special", description: "Military VIP" },
    
    // Documentation
    { name: "App Documentation", path: "AppDocumentation", category: "Tech", description: "Full guide" },
    { name: "Platform Narrative", path: "PlatformNarrative", category: "Tech", description: "System story" },
    { name: "Technical Guide", path: "TechnicalGuide", category: "Tech", description: "Backend docs" },
    { name: "Shortcuts Cheat Sheet", path: "ShortcutsCheatSheet", category: "Tech", description: "Keyboard shortcuts" },
    { name: "Code Exporter", path: "CodeExporter", category: "Tech", description: "Export files" },
    { name: "Tech File Manager", path: "TechFileManager", category: "Tech", description: "AI doc sync" },
    { name: "URL Manager", path: "URLManager", category: "Tech", description: "This page" },
  ];

  const filteredPages = allPages.filter(page => 
    page.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [...new Set(allPages.map(p => p.category))].sort();

  const copyToClipboard = (path) => {
    const fullUrl = `${window.location.origin}${createPageUrl(path)}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(path);
    setTimeout(() => setCopiedUrl(""), 2000);
  };

  const openInNewTab = (path) => {
    window.open(createPageUrl(path), '_blank');
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Public": "bg-blue-100 text-blue-800 border-blue-300",
      "Customer": "bg-green-100 text-green-800 border-green-300",
      "Employee": "bg-purple-100 text-purple-800 border-purple-300",
      "Manager": "bg-orange-100 text-orange-800 border-orange-300",
      "Super Admin": "bg-red-100 text-red-800 border-red-300",
      "Support": "bg-cyan-100 text-cyan-800 border-cyan-300",
      "Special": "bg-pink-100 text-pink-800 border-pink-300",
      "Tech": "bg-gray-100 text-gray-800 border-gray-300"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

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

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <LinkIcon className="w-10 h-10 text-blue-400" />
            URL Manager
          </h1>
          <p className="text-gray-400">Manage and access all application URLs</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-blue-900 border-blue-700">
            <p className="text-blue-200 text-sm mb-1">Total Pages</p>
            <p className="text-4xl font-bold text-blue-400">{allPages.length}</p>
          </Card>
          <Card className="p-6 bg-green-900 border-green-700">
            <p className="text-green-200 text-sm mb-1">Categories</p>
            <p className="text-4xl font-bold text-green-400">{categories.length}</p>
          </Card>
          <Card className="p-6 bg-purple-900 border-purple-700">
            <p className="text-purple-200 text-sm mb-1">Filtered Results</p>
            <p className="text-4xl font-bold text-purple-400">{filteredPages.length}</p>
          </Card>
          <Card className="p-6 bg-orange-900 border-orange-700">
            <p className="text-orange-200 text-sm mb-1">Base URL</p>
            <p className="text-sm font-mono text-orange-400 truncate">
              {window.location.origin}
            </p>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search pages by name, path, category, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </Card>

        {/* URLs by Category */}
        {categories.map(category => {
          const categoryPages = filteredPages.filter(p => p.category === category);
          if (categoryPages.length === 0) return null;

          return (
            <Card key={category} className="p-6 bg-gray-800 border-gray-700 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Badge className={getCategoryColor(category)}>
                  {category}
                </Badge>
                <span className="text-gray-400 text-sm">({categoryPages.length})</span>
              </h2>

              <div className="space-y-3">
                {categoryPages.map(page => (
                  <Card key={page.path} className="p-4 bg-gray-700 border-gray-600 hover:bg-gray-600 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-white text-lg">{page.name}</h3>
                          {copiedUrl === page.path && (
                            <Badge className="bg-green-600 text-white flex items-center gap-1 animate-pulse">
                              <CheckCircle className="w-3 h-3" />
                              Copied!
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{page.description}</p>
                        <code className="text-xs bg-gray-900 text-blue-300 px-2 py-1 rounded font-mono">
                          {createPageUrl(page.path)}
                        </code>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(page.path)}
                          className="bg-blue-600 hover:bg-blue-700"
                          title="Copy full URL"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => openInNewTab(page.path)}
                          className="bg-green-600 hover:bg-green-700"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          );
        })}

        {filteredPages.length === 0 && (
          <Alert className="bg-yellow-900/30 border-yellow-700">
            <AlertDescription className="text-yellow-200">
              No pages found matching "{searchTerm}". Try a different search term.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Quick Stats</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {categories.map(cat => (
              <div key={cat} className="p-3 bg-gray-700 rounded-lg">
                <p className="text-gray-400 text-sm">{cat}</p>
                <p className="text-2xl font-bold text-white">
                  {allPages.filter(p => p.category === cat).length}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}