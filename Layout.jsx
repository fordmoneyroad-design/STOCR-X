

import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Car,
  Calculator,
  LayoutDashboard,
  HelpCircle,
  Menu,
  X,
  User,
  LogOut,
  Globe,
  UserPlus,
  Shield,
  Star,
  Home,
  MessageCircle,
  Users,
  DollarSign,
  Truck,
  Bot,
  Briefcase,
  TestTube,
  Key,
  Camera,
  TrendingUp,
  RotateCcw,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import AIAssistantChatBox from "./components/AIAssistantChatBox";
import TesterSessionTracker from "./components/TesterSessionTracker";
import UniversalAISearchBar from "./components/UniversalAISearchBar";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState('en');
  const [showTopLogo, setShowTopLogo] = useState(true);
  const [userCategory, setUserCategory] = useState(null);
  const [showAdminQuickLinks, setShowAdminQuickLinks] = useState(true);
  const [quickLinksOpacity, setQuickLinksOpacity] = useState('colored'); // NEW: 'colored' or 'transparent'

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);

          // Fetch user's category/access level
          if (currentUser?.department) {
            try {
              // Assuming base44.entities.EmployeeCategory exists and has a filter method
              const categories = await base44.entities.EmployeeCategory.filter({
                department: currentUser.department
              });
              if (categories && categories.length > 0) {
                setUserCategory(categories[0]);
              }
            } catch (err) {
              console.log("No employee category found");
            }
          }
        }
      } catch (err) {
        // User not authenticated
      }
    };
    checkAuth();

    // Load logo preferences
    const topLogoPrefs = localStorage.getItem('stocrx-show-top-logo');
    if (topLogoPrefs !== null) setShowTopLogo(topLogoPrefs === 'true');
    
    // Load admin quick links preference
    const quickLinksPrefs = localStorage.getItem('stocrx-show-admin-quick-links');
    if (quickLinksPrefs !== null) setShowAdminQuickLinks(quickLinksPrefs === 'true');
    
    // NEW: Load quick links opacity preference
    const opacityPrefs = localStorage.getItem('stocrx-quick-links-opacity');
    if (opacityPrefs) setQuickLinksOpacity(opacityPrefs);
  }, []);

  const publicNav = [
    { name: "Home", path: createPageUrl("Home"), icon: Home },
    { name: "Browse Cars", path: createPageUrl("BrowseCars"), icon: Car },
    { name: "Plans", path: createPageUrl("SubscriptionPlans"), icon: Star },
    { name: "Calculator", path: createPageUrl("Calculator"), icon: Calculator },
    { name: "How It Works", path: createPageUrl("HowItWorks"), icon: HelpCircle },
    { name: "Account Approval", path: createPageUrl("AccountApprovalStatus"), icon: Shield },
  ];

  // NEW: Employee page navigation (shows for admins only)
  const employeePageNav = user && (user.role === 'admin' || user.email === 'fordmoneyroad@gmail.com') ? [
    { name: "Employee Info", path: createPageUrl("EmployeeInformationCategories"), icon: Users }
  ] : [];

  const userNav = [
    { name: "My Account", path: createPageUrl("MyAccount"), icon: LayoutDashboard },
    { name: "Returns & Credits", path: createPageUrl("CustomerReturns"), icon: RotateCcw },
    { name: "Live Chat & Support", path: createPageUrl("SupportLiveChat"), icon: MessageCircle },
    { name: "Vehicle Inspection", path: createPageUrl("VehicleInspection"), icon: Camera }
  ];

  const employeeNav = user && user.department ? [
    { name: "Employee Dashboard", path: createPageUrl("EmployeeDashboard"), icon: LayoutDashboard },
    { name: "AI Assistant", path: createPageUrl("AIAssistantEmployee"), icon: Bot },
    { name: "My Shifts", path: createPageUrl("MyShifts"), icon: Clock }
  ] : [];

  const dispatchNav = user && user.department === 'incidents' ? [
    { name: "Call Center Dispatch", path: createPageUrl("CallCenterDispatch"), icon: Truck }
  ] : [];

  const managerNav = user && (user.role === 'admin' || user.email === "fordmoneyroad@gmail.com") ? [
    { name: "Manager Dashboard", path: createPageUrl("ManagerDashboard"), icon: Users, category: "Management" },
    { name: "Settings", path: createPageUrl("Settings"), icon: TrendingUp, category: "System" },
    { name: "Access Control", path: createPageUrl("AccessControl"), icon: Shield, category: "Security" },
    { name: "Role Management", path: createPageUrl("RoleManagement"), icon: Shield, category: "Security" },
    { name: "Quick Assignment", path: createPageUrl("QuickUserAssignment"), icon: UserPlus, category: "Security" },
    { name: "Payroll", path: createPageUrl("PayrollDashboard"), icon: DollarSign, category: "Finance" },
    { name: "Financing", path: createPageUrl("FinancingManagement"), icon: DollarSign, category: "Finance" },
    { name: "Call Center Dispatch", path: createPageUrl("CallCenterDispatch"), icon: Truck, category: "Operations" },
    { name: "Job Management", path: createPageUrl("JobManagement"), icon: Briefcase, category: "HR" },
    { name: "Hire or Fire", path: createPageUrl("HireOrFire"), icon: Briefcase, category: "HR" },
    { name: "Theme Manager", path: createPageUrl("ThemeManager"), icon: Star, category: "System" },
    { name: "System Testing", path: createPageUrl("SystemTesting"), icon: TestTube, category: "System" },
    { name: "Account Recovery", path: createPageUrl("AccountRecovery"), icon: Key, category: "Security" }
  ] : [];

  const superAdminEmail = "fordmoneyroad@gmail.com";
  const isSuperAdmin = user?.email === superAdminEmail;

  const superAdminNav = isSuperAdmin ? [
    { name: "Super Admin", path: createPageUrl("SuperAdmin"), icon: Shield, category: "Admin" },
    { name: "Manage Cars", path: createPageUrl("SuperAdminCars"), icon: Car, category: "Admin" }
  ] : [];

  // Categorize all admin links
  const allAdminLinks = [...managerNav, ...superAdminNav];
  const categorizedAdminLinks = allAdminLinks.reduce((acc, item) => {
    const category = item.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});

  // NEW: Quick access links for admin (NOW 7 LINKS - ADDED EMPLOYEE INFO)
  const adminQuickLinks = [
    { name: "Super Admin", path: createPageUrl("SuperAdmin"), icon: Shield, color: "bg-yellow-600" },
    { name: "Manage Cars", path: createPageUrl("SuperAdminCars"), icon: Car, color: "bg-orange-600" },
    { name: "Employee Info", path: createPageUrl("EmployeeInformationCategories"), icon: Users, color: "bg-cyan-600" }, // NEW
    { name: "Manager Dashboard", path: createPageUrl("ManagerDashboard"), icon: Users, color: "bg-blue-600" },
    { name: "Settings", path: createPageUrl("Settings"), icon: TrendingUp, color: "bg-purple-600" },
    { name: "Payroll", path: createPageUrl("PayrollDashboard"), icon: DollarSign, color: "bg-green-600" },
    { name: "Dispatch", path: createPageUrl("CallCenterDispatch"), icon: Truck, color: "bg-red-600" }
  ];

  const handleLogout = () => {
    base44.auth.logout();
  };

  const handleSignUp = () => {
    base44.auth.redirectToLogin(createPageUrl("BrowseCars"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <style>{`
        :root {
          --primary-blue: #3B82F6;
          --primary-purple: #8B5CF6;
          --accent-indigo: #6366F1;
          --dark: #111827;
        }
      `}</style>

      {/* Access Level Badge - Top Left */}
      {user && (
        <div className="fixed top-4 left-4 z-40 animate-fade-in">
          <Badge className={
            user.role === 'admin' || user.email === 'fordmoneyroad@gmail.com'
              ? 'bg-yellow-500 text-black text-sm px-4 py-2 shadow-2xl'
              : userCategory?.full_access
              ? 'bg-green-600 text-white text-sm px-4 py-2 shadow-xl'
              : 'bg-blue-600 text-white text-sm px-4 py-2 shadow-lg'
          }>
            {user.role === 'admin' || user.email === 'fordmoneyroad@gmail.com'
              ? '🔓 FULL SYSTEM ACCESS'
              : userCategory?.full_access
              ? '✅ FULL ACCESS'
              : `${userCategory?.access_level?.toUpperCase() || user?.subscription_tier?.toUpperCase() || 'FREE'} ACCESS`
            }
          </Badge>
        </div>
      )}

      {/* Universal AI Search Bar */}
      {user && <UniversalAISearchBar user={user} currentPage={currentPageName} />}

      {/* UPDATED: Persistent Admin Quick Links Panel - Right Side */}
      {user && (user.role === 'admin' || user.email === 'fordmoneyroad@gmail.com') && showAdminQuickLinks && (
        <div className="fixed right-4 top-24 z-40 animate-fade-in">
          <div className={`${
            quickLinksOpacity === 'transparent' 
              ? 'bg-white/20 backdrop-blur-xl border-white/30' 
              : 'bg-white/95 backdrop-blur-md border-gray-200'
          } border rounded-lg shadow-2xl p-3 space-y-2 max-w-xs transition-all duration-300`}>
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200/30">
              <h3 className={`text-xs font-bold flex items-center gap-1 ${
                quickLinksOpacity === 'transparent' ? 'text-white' : 'text-gray-700'
              }`}>
                <Shield className={`w-3 h-3 ${quickLinksOpacity === 'transparent' ? 'text-yellow-300' : 'text-yellow-600'}`} />
                ADMIN QUICK LINKS
              </h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowAdminQuickLinks(false);
                  localStorage.setItem('stocrx-show-admin-quick-links', 'false');
                }}
                className={`h-6 w-6 p-0 ${quickLinksOpacity === 'transparent' ? 'text-white hover:text-gray-200' : ''}`}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            {adminQuickLinks.filter(link => 
              (link.name === "Super Admin" || link.name === "Manage Cars") ? isSuperAdmin : true
            ).map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-white hover:opacity-90 transition-all text-xs font-semibold ${
                  quickLinksOpacity === 'transparent' 
                    ? 'bg-white/20 backdrop-blur-md hover:bg-white/30 border border-white/30' 
                    : link.color
                } shadow-md hover:shadow-lg`}
              >
                <link.icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Floating Top Right Logo - Clickable */}
      {showTopLogo && (
        <Link to={createPageUrl("PWAInstallGuide")} className="fixed top-4 right-4 z-40 animate-fade-in">
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fedac268a06fe88d74977e/0f2d8e915_IMG_3409.png"
              alt="STOCRX - Click for App Install"
              className="relative h-16 w-auto opacity-30 hover:opacity-70 transition-opacity duration-300 drop-shadow-lg"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))'
              }}
              title="Click to install STOCRX app"
            />
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              <span className="text-xs text-blue-600 font-semibold bg-white px-2 py-1 rounded shadow-lg">
                Install App
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* Tester Session Tracker */}
      <TesterSessionTracker />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-3">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fedac268a06fe88d74977e/0f2d8e915_IMG_3409.png"
                alt="STOCRX"
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">STOCRX</h1>
                <p className="text-xs text-blue-600 font-medium">Subscribe to Own</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {publicNav.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    location.pathname === item.path
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.name}
                </Link>
              ))}

              {/* NEW: Employee Info button (next to Account Approval) */}
              {employeePageNav.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    location.pathname === item.path
                      ? "bg-cyan-100 text-cyan-800"
                      : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}

              {superAdminNav.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    location.pathname === item.path
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:flex">
                    <Globe className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setLanguage('en')}>
                    🇺🇸 English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('es')}>
                    🇪🇸 Español
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('ar')}>
                    🇸🇦 العربية
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {user ? (
                <>
                  {/* NEW: Hamburger Menu for Admin with Categories */}
                  {(user.role === 'admin' || user.email === 'fordmoneyroad@gmail.com') && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="border-yellow-600 hover:bg-yellow-50">
                          <Menu className="w-5 h-5 text-yellow-600" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-80 max-h-[600px] overflow-y-auto">
                        <DropdownMenuLabel className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-yellow-600" />
                          Admin Menu
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        
                        {Object.entries(categorizedAdminLinks).map(([category, links]) => (
                          <div key={category}>
                            <DropdownMenuLabel className="text-xs text-gray-500 uppercase mt-2 px-2">
                              {category}
                            </DropdownMenuLabel>
                            {links.map((item) => (
                              <DropdownMenuItem key={item.name} asChild>
                                <Link to={item.path} className="cursor-pointer">
                                  <item.icon className="w-4 h-4 mr-2" />
                                  {item.name}
                                </Link>
                              </DropdownMenuItem>
                            ))}
                            {/* Only show separator if it's not the last category */}
                            {Object.keys(categorizedAdminLinks).indexOf(category) !== Object.keys(categorizedAdminLinks).length - 1 && (
                              <DropdownMenuSeparator />
                            )}
                          </div>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        <span className="hidden md:inline">{user?.full_name || user?.email || 'User'}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl("Home")} className="cursor-pointer">
                          <Home className="w-4 h-4 mr-2" />
                          Home
                        </Link>
                      </DropdownMenuItem>

                      {userNav.map((item) => (
                        <DropdownMenuItem key={item.name} asChild>
                          <Link to={item.path} className="cursor-pointer">
                            <item.icon className="w-4 h-4 mr-2" />
                            {item.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}

                      {(employeeNav.length > 0 || dispatchNav.length > 0) && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Employee Tools</DropdownMenuLabel>
                        </>
                      )}

                      {employeeNav.map((item) => (
                        <DropdownMenuItem key={item.name} asChild>
                          <Link to={item.path} className="cursor-pointer">
                            <item.icon className="w-4 h-4 mr-2" />
                            {item.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}

                      {dispatchNav.map((item) => (
                        <DropdownMenuItem key={item.name} asChild>
                          <Link to={item.path} className="cursor-pointer">
                            <item.icon className="w-4 h-4 mr-2" />
                            {item.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}

                      {managerNav.length > 0 && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Management</DropdownMenuLabel>
                        </>
                      )}

                      {managerNav.map((item) => (
                        <DropdownMenuItem key={item.name} asChild>
                          <Link to={item.path} className="cursor-pointer">
                            <item.icon className="w-4 h-4 mr-2" />
                            {item.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => base44.auth.redirectToLogin(createPageUrl("MyAccount"))}
                    className="hidden md:flex"
                  >
                    Login
                  </Button>
                  <Button
                    onClick={handleSignUp}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg font-bold"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Sign Up Free
                  </Button>
                </>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">

              <div className="flex flex-col gap-2">
                {publicNav.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg font-medium flex items-center gap-2 ${
                      location.pathname === item.path
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                ))}

                {/* NEW: Employee Info in mobile menu */}
                {employeePageNav.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg font-medium flex items-center gap-2 bg-cyan-100 text-cyan-800"
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                ))}

                {superAdminNav.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg font-medium flex items-center gap-2 bg-yellow-100 text-yellow-800"
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                ))}

                {user && (
                  <>
                    <div className="border-t border-gray-200 my-2 pt-2">
                      <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">My Account</p>
                    </div>

                    {userNav.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-4 py-3 rounded-lg font-medium flex items-center gap-2 text-gray-700 hover:bg-gray-100"
                      >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    ))}

                    {(employeeNav.length > 0 || dispatchNav.length > 0) && (
                      <>
                        <div className="border-t border-gray-200 my-2 pt-2">
                          <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Employee Tools</p>
                        </div>

                        {employeeNav.map((item) => (
                          <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-4 py-3 rounded-lg font-medium flex items-center gap-2 text-gray-700 hover:bg-gray-100"
                          >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                          </Link>
                        ))}

                        {dispatchNav.map((item) => (
                          <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-4 py-3 rounded-lg font-medium flex items-center gap-2 text-orange-700 hover:bg-orange-50"
                          >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                          </Link>
                        ))}
                      </>
                    )}

                    {managerNav.length > 0 && (
                      <>
                        <div className="border-t border-gray-200 my-2 pt-2">
                          <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">Management</p>
                        </div>

                        {managerNav.map((item) => (
                          <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-4 py-3 rounded-lg font-medium flex items-center gap-2 text-gray-700 hover:bg-gray-100"
                          >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                          </Link>
                        ))}
                      </>
                    )}
                  </>
                )}

                {!user && (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        base44.auth.redirectToLogin(createPageUrl("MyAccount"));
                      }}
                      className="justify-start"
                    >
                      Login
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleSignUp();
                      }}
                      className="justify-start flex items-center gap-2"
                    >
                      <UserPlus className="w-5 h-5" />
                      Sign Up Free
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* AI Assistant Chat Box */}
      {user && (user.department || user.role === 'admin') && (
        <AIAssistantChatBox user={user} />
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fedac268a06fe88d74977e/0f2d8e915_IMG_3409.png"
                  alt="STOCRX"
                  className="h-10 w-auto"
                />
              </div>
              <h3 className="font-bold text-xl mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">STOCRX</h3>
              <p className="text-gray-400 text-sm">
                Subscription-to-Own Car Rentals
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Navigation</h4>
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <Link to={createPageUrl("Home")} className="hover:text-white">Home</Link>
                <Link to={createPageUrl("BrowseCars")} className="hover:text-white">Browse Cars</Link>
                <Link to={createPageUrl("SubscriptionPlans")} className="hover:text-white">Plans</Link>
                <Link to={createPageUrl("HowItWorks")} className="hover:text-white">How It Works</Link>
                <Link to={createPageUrl("Calculator")} className="hover:text-white">Calculator</Link>
                <Link to={createPageUrl("SupportLiveChat")} className="hover:text-white">Support</Link>
                <Link to={createPageUrl("MyAccount")} className="hover:text-white">My Account</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <Link to={createPageUrl("Terms")} className="hover:text-white">Terms of Service</Link>
                <Link to={createPageUrl("Privacy")} className="hover:text-white">Privacy Policy</Link>
                <Link to={createPageUrl("Terms")} className="hover:text-white">Cookie Policy</Link>
                <Link to={createPageUrl("ForgotPassword")} className="hover:text-white flex items-center gap-1">
                  <Key className="w-3 h-3" />
                  Forgot Password
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact & Opportunities</h4>
              <div className="flex flex-col gap-2 text-sm text-gray-400">
                <a href="mailto:info@stocrx.com" className="hover:text-white">info@stocrx.com</a>
                <Link to={createPageUrl("Careers")} className="hover:text-white">Careers</Link>
                <Link to={createPageUrl("AffiliateManagement")} className="hover:text-white">Affiliate Program</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 STOCRX INC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

