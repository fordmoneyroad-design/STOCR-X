
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Car, MapPin, DollarSign, Building2, Calculator, Package,
  Clock, Gavel, Handshake, Wrench, Briefcase, Palette, GraduationCap,
  Link as LinkIcon, Smartphone, Shield, FileText, Users, AlertTriangle, 
  TestTube, Users as UsersIcon, Map as MapIcon, BarChart3, TrendingUp, Book,
  Terminal, Keyboard, Download, Bot, LineChart, Timer, Gift, RotateCcw, Newspaper,
  Truck, Globe, CheckCircle
} from "lucide-react";

export default function SuperAdminQuickActions() {
  const navigate = useNavigate();

  const quickActions = [
    { title: "Add Vehicles", desc: "AI Sourcing", icon: Car, path: "SuperAdminCars", gradient: "from-orange-600 to-red-600" },
    { title: "Vehicle Manager", desc: "Full control", icon: MapIcon, path: "VehicleManagement", gradient: "from-blue-600 to-indigo-600" },
    { title: "Research Flow", desc: "Analytics", icon: BarChart3, path: "VehicleResearchFlow", gradient: "from-purple-600 to-pink-600" },
    { title: "Subscription Plans", desc: "Ecosystem", icon: TrendingUp, path: "SubscriptionEcosystem", gradient: "from-green-600 to-teal-600" },
    { title: "Notifications", desc: "Push & Email", icon: AlertTriangle, path: "NotificationSettings", gradient: "from-yellow-600 to-orange-600" },
    { title: "Vehicle Locator", desc: "By state/city", icon: MapPin, path: "CopartLocator", gradient: "from-blue-600 to-indigo-600" },
    { title: "Licenses", desc: "Certifications", icon: FileText, path: "LicenseManagement", gradient: "from-purple-600 to-pink-600" },
    { title: "Maintenance", desc: "Track services", icon: Wrench, path: "MaintenanceTracking", gradient: "from-orange-600 to-yellow-600" },
    { title: "AI ID Verify", desc: "Fake detection", icon: Shield, path: "AIIDVerificationEnhanced", gradient: "from-green-600 to-emerald-600" },
    { title: "Payroll", desc: "Process pay", icon: DollarSign, path: "PayrollDashboard", gradient: "from-teal-600 to-cyan-600" },
    { title: "Companies", desc: "MI 3-car limit", icon: Building2, path: "CompanyManagement", gradient: "from-indigo-600 to-purple-600" },
    { title: "IRS Tax", desc: "W-2, 1099", icon: Calculator, path: "IRSTaxCalculator", gradient: "from-yellow-600 to-orange-600" },
    { title: "Financing", desc: "Buy Now Pay", icon: DollarSign, path: "FinancingManagement", gradient: "from-pink-600 to-rose-600" },
    { title: "Analytics", desc: "Search data", icon: AlertTriangle, path: "SearchAnalytics", gradient: "from-cyan-600 to-blue-600" },
    { title: "Supply", desc: "Branded items", icon: Package, path: "InventorySupplyList", gradient: "from-amber-600 to-yellow-600" },
    { title: "Employee", desc: "Add team", icon: Users, path: "CreateEmployee", gradient: "from-blue-600 to-indigo-600" },
    { title: "Auto-Remove", desc: "Expiration", icon: Clock, path: "VehicleAutoRemoval", gradient: "from-red-600 to-pink-600" },
    { title: "Auction", desc: "Assessment", icon: Gavel, path: "AuctionAssessment", gradient: "from-purple-600 to-indigo-600" },
    { title: "Partners", desc: "Add partners", icon: Handshake, path: "PartnerAccountCreation", gradient: "from-teal-600 to-cyan-600" },
    { title: "Hire or Fire", desc: "Review apps", icon: Briefcase, path: "HireOrFire", gradient: "from-green-600 to-emerald-600" },
    { title: "Job Manager", desc: "Create jobs", icon: Briefcase, path: "JobManagement", gradient: "from-violet-600 to-purple-600" },
    { title: "Theme", desc: "Dark/Light", icon: Palette, path: "ThemeManager", gradient: "from-pink-600 to-rose-600" },
    { title: "Training", desc: "Virtual class", icon: GraduationCap, path: "VirtualOnboardingClass", gradient: "from-blue-500 to-cyan-500" },
    { title: "Copart Links", desc: "Email import", icon: LinkIcon, path: "CopartLinkImporter", gradient: "from-orange-500 to-red-500" },
    { title: "Documentation", desc: "Full guide", icon: Book, path: "AppDocumentation", gradient: "from-indigo-500 to-purple-500" },
    { title: "Platform Story", desc: "Narrative", icon: Book, path: "PlatformNarrative", gradient: "from-teal-500 to-green-500" },
    { title: "Create Tester", desc: "QA accounts", icon: TestTube, path: "CreateTesterAccount", gradient: "from-purple-500 to-pink-500" },
    { title: "Affiliates", desc: "Manage program", icon: UsersIcon, path: "AffiliateManagement", gradient: "from-green-500 to-teal-500" },
    { title: "Technical Guide", desc: "Backend tips", icon: Terminal, path: "TechnicalGuide", gradient: "from-green-500 to-emerald-500" },
    { title: "Shortcuts", desc: "Cheat sheet", icon: Keyboard, path: "ShortcutsCheatSheet", gradient: "from-yellow-500 to-orange-500" },
    { title: "Code Exporter", desc: "Download files", icon: Download, path: "CodeExporter", gradient: "from-blue-500 to-indigo-500" },
    { title: "Tech Manager", desc: "AI docs sync", icon: Bot, path: "TechFileManager", gradient: "from-purple-500 to-pink-500" },
    { title: "PWA Analytics", desc: "App installs", icon: LineChart, path: "PWAAnalyticsDashboard", gradient: "from-cyan-500 to-blue-500" },
    { title: "Employee Timeout", desc: "Monitor breaks", icon: Timer, path: "EmployeeTimeoutMonitor", gradient: "from-red-500 to-orange-500" },
    { title: "URL Manager", desc: "All page URLs", icon: LinkIcon, path: "URLManager", gradient: "from-indigo-500 to-blue-500" },
    { title: "Store Credits", desc: "Refunds", icon: Gift, path: "StoreCreditManagement", gradient: "from-green-500 to-emerald-500" },
    { title: "Returns Portal", desc: "Manage returns", icon: RotateCcw, path: "CustomerReturns", gradient: "from-purple-500 to-pink-500" },
    { title: "Blog Manager", desc: "AI Content", icon: Newspaper, path: "BlogManager", gradient: "from-blue-500 to-purple-500" },
    { title: "Partnership Platform", desc: "Collaborators", icon: UsersIcon, path: "PartnershipPlatform", gradient: "from-cyan-500 to-teal-500" },
    { title: "Post-Purchase", desc: "Success page", icon: CheckCircle, path: "PostPurchase", gradient: "from-green-500 to-emerald-500" },
    { title: "Delivery Settings", desc: "Shipping opts", icon: Truck, path: "DeliverySettings", gradient: "from-blue-500 to-cyan-500" },
    { title: "Markets", desc: "Global expand", icon: Globe, path: "MarketManagement", gradient: "from-purple-500 to-pink-500" },
    { title: "Enhanced Theme", desc: "AI + metafields", icon: Palette, path: "EnhancedThemeManager", gradient: "from-yellow-500 to-orange-500" },
    { title: "Tax Management", desc: "Filing & rates", icon: DollarSign, path: "TaxManagement", gradient: "from-green-500 to-emerald-500" },
    { title: "Pending Users", desc: "Approve requests", icon: UsersIcon, path: "PendingUsers", gradient: "from-blue-500 to-indigo-500" },
    { title: "Access Control", desc: "Roles & pages", icon: Shield, path: "AccessControl", gradient: "from-yellow-500 to-red-500" },
    { title: "Safety & Errors", desc: "Crash prevention", icon: Shield, path: "SafetyErrorHandler", gradient: "from-red-500 to-pink-500" }, // NEW
  ];

  return (
    <Card className="p-6 bg-gray-800 border-gray-700 mt-8">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-yellow-400" />
        Super Admin Quick Actions
      </h3>
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.path}
              onClick={() => navigate(createPageUrl(action.path))}
              className={`h-20 bg-gradient-to-r ${action.gradient} hover:opacity-90`}
            >
              <Icon className="w-6 h-6 mr-3" />
              <div className="text-left">
                <p className="font-bold">{action.title}</p>
                <p className="text-xs">{action.desc}</p>
              </div>
            </Button>
          );
        })}
      </div>
    </Card>
  );
}
