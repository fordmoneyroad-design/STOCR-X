
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import {
  Settings as SettingsIcon, Palette, DollarSign, Truck, Globe,
  Bell, Shield, Users, Package, FileText, Briefcase, Calculator,
  MapPin, TrendingUp, Wrench, Star, AlertTriangle, LayoutDashboard // Added new icons
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function Settings() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.email !== SUPER_ADMIN_EMAIL && currentUser.role !== 'admin') {
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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const settingsCategories = [
    {
      title: "System Configuration",
      description: "Core system settings and configurations",
      icon: TrendingUp,
      color: "from-blue-600 to-cyan-600",
      pages: [
        {
          name: "Theme Manager",
          description: "Customize website appearance, colors, and branding",
          path: "ThemeManager",
          icon: Star
        },
        {
          name: "Notification Settings",
          description: "Configure push notifications and email alerts",
          path: "NotificationSettings",
          icon: AlertTriangle
        },
        {
          name: "Interface Preferences",
          description: "Toggle admin quick links, menu style, and UI options",
          path: "InterfacePreferences",
          icon: LayoutDashboard
        }
      ]
    },
    {
      title: "Brand & Identity",
      description: "Manage your brand assets, logos, and colors",
      icon: Palette,
      color: "from-purple-600 to-pink-600",
      pages: [
        { name: "Brand Assets", path: "Brand", icon: Palette, desc: "Logos, colors, slogan" },
        { name: "Theme Manager", path: "ThemeManager", icon: Palette, desc: "Dark mode & holidays" },
        { name: "Enhanced Theme", path: "EnhancedThemeManager", icon: Palette, desc: "AI + metafields" }
      ]
    },
    {
      title: "Commerce & Payments",
      description: "Configure payment, delivery, and market settings",
      icon: DollarSign,
      color: "from-green-600 to-emerald-600",
      pages: [
        { name: "Tax Management", path: "TaxManagement", icon: DollarSign, desc: "Filing & rates" },
        { name: "Delivery Settings", path: "DeliverySettings", icon: Truck, desc: "Shipping options" },
        { name: "Markets", path: "MarketManagement", icon: Globe, desc: "Global expansion" },
        { name: "Post-Purchase", path: "PostPurchase", icon: Package, desc: "Success page" },
        { name: "Store Credits", path: "StoreCreditManagement", icon: DollarSign, desc: "Refunds" },
        { name: "Financing", path: "FinancingManagement", icon: Calculator, desc: "Buy Now Pay Later" }
      ]
    },
    {
      title: "Communications",
      description: "Manage notifications, emails, and customer communications",
      icon: Bell,
      color: "from-blue-600 to-indigo-600",
      pages: [
        { name: "Notifications", path: "NotificationSettings", icon: Bell, desc: "Push & email alerts" },
        { name: "Blog Manager", path: "BlogManager", icon: FileText, desc: "AI content creation" }
      ]
    },
    {
      title: "Team & Access",
      description: "Manage employees, partners, and permissions",
      icon: Users,
      color: "from-orange-600 to-red-600",
      pages: [
        { name: "Create Employee", path: "CreateEmployee", icon: Users, desc: "Add team members" },
        { name: "Job Management", path: "JobManagement", icon: Briefcase, desc: "Create job postings" },
        { name: "Hire or Fire", path: "HireOrFire", icon: Users, desc: "Review applications" },
        { name: "Partnership Platform", path: "PartnershipPlatform", icon: Shield, desc: "Collaborators" },
        { name: "Partner Access", path: "PartnerAccountCreation", icon: Shield, desc: "Add partners" }
      ]
    },
    {
      title: "Products & Inventory",
      description: "Manage vehicles, subscriptions, and inventory",
      icon: Package,
      color: "from-cyan-600 to-blue-600",
      pages: [
        { name: "Vehicle Management", path: "VehicleManagement", icon: MapPin, desc: "Full control" },
        { name: "Subscription Plans", path: "SubscriptionEcosystem", icon: TrendingUp, desc: "Plan ecosystem" },
        { name: "Inventory Supply", path: "InventorySupplyList", icon: Package, desc: "Branded items" },
        { name: "Vehicle Locator", path: "CopartLocator", icon: MapPin, desc: "By state/city" },
        { name: "Maintenance", path: "MaintenanceTracking", icon: Wrench, desc: "Track services" }
      ]
    },
    {
      title: "Developer & Advanced",
      description: "Technical settings and advanced configurations",
      icon: SettingsIcon,
      color: "from-gray-600 to-gray-700",
      pages: [
        { name: "URL Manager", path: "URLManager", icon: FileText, desc: "All page URLs" },
        { name: "Technical Guide", path: "TechnicalGuide", icon: FileText, desc: "Backend tips" },
        { name: "Shortcuts", path: "ShortcutsCheatSheet", icon: FileText, desc: "Cheat sheet" },
        { name: "Code Exporter", path: "CodeExporter", icon: FileText, desc: "Download files" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <SettingsIcon className="w-12 h-12 text-blue-400" />
            <h1 className="text-5xl font-bold text-white">Settings</h1>
          </div>
          <p className="text-xl text-gray-400">
            Manage your STOCRX platform configuration
          </p>
        </div>

        <div className="space-y-12">
          {settingsCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.title}>
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-8 h-8 text-blue-400" />
                    <h2 className="text-3xl font-bold text-white">{category.title}</h2>
                  </div>
                  <p className="text-gray-400 ml-11">{category.description}</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.pages.map((page) => {
                    const PageIcon = page.icon;
                    return (
                      <Card
                        key={page.path}
                        onClick={() => navigate(createPageUrl(page.path))}
                        className={`p-6 bg-gradient-to-br ${category.color} border-none cursor-pointer hover:scale-105 transition-transform duration-300`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="bg-white/20 p-3 rounded-lg">
                            <PageIcon className="w-8 h-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-2">
                              {page.name}
                            </h3>
                            <p className="text-sm text-white/80">
                              {page.description || page.desc} {/* Use description for new items, fall back to desc */}
                            </p>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
