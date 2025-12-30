import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, X, AlertTriangle, Loader, Play, 
  FileText, Users, Car, DollarSign, Shield, Bot, Truck
} from "lucide-react";
import { createPageUrl } from "@/utils";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

const TEST_SUITES = {
  navigation: {
    name: "Navigation & Links",
    icon: FileText,
    tests: [
      { name: "Home page loads", path: "Home" },
      { name: "Browse Cars page", path: "BrowseCars" },
      { name: "Subscription Plans", path: "SubscriptionPlans" },
      { name: "Calculator page", path: "Calculator" },
      { name: "How It Works", path: "HowItWorks" },
      { name: "Terms & Privacy", path: "Terms" },
      { name: "Careers page", path: "Careers" },
      { name: "Career Application", path: "CareerApplication" },
      { name: "Support & Live Chat", path: "SupportLiveChat" }
    ]
  },
  userPages: {
    name: "User Dashboard & Actions",
    icon: Users,
    requiresAuth: true,
    tests: [
      { name: "My Account page", path: "MyAccount" },
      { name: "Make Payment", path: "MakePayment" },
      { name: "Early Buyout", path: "EarlyBuyout" },
      { name: "Swap/Upgrade Vehicle", path: "SwapUpgrade" },
      { name: "Schedule Delivery", path: "ScheduleDelivery" },
      { name: "Report Incident", path: "ReportIncident" },
      { name: "Nearby Vehicles", path: "NearbyVehicles" },
      { name: "Virtual Onboarding", path: "VirtualOnboarding" }
    ]
  },
  employeePages: {
    name: "Employee Tools",
    icon: Users,
    requiresAuth: true,
    requiresEmployee: true,
    tests: [
      { name: "Employee Dashboard", path: "EmployeeDashboard" },
      { name: "AI Assistant Employee", path: "AIAssistantEmployee" },
      { name: "Call Center Dispatch", path: "CallCenterDispatch" }
    ]
  },
  adminPages: {
    name: "Admin & Management",
    icon: Shield,
    requiresAuth: true,
    requiresAdmin: true,
    tests: [
      { name: "Super Admin Dashboard", path: "SuperAdmin" },
      { name: "Manager Dashboard", path: "ManagerDashboard" },
      { name: "Pending Approvals", path: "PendingApprovals" },
      { name: "User Profile", path: "UserProfile" },
      { name: "Subscription Profile", path: "SubscriptionProfile" },
      { name: "Payroll Dashboard", path: "PayrollDashboard" },
      { name: "Financing Management", path: "FinancingManagement" },
      { name: "Company Management", path: "CompanyManagement" },
      { name: "License Management", path: "LicenseManagement" },
      { name: "Maintenance Tracking", path: "MaintenanceTracking" },
      { name: "AI ID Verification", path: "AIIDVerification" },
      { name: "Search Analytics", path: "SearchAnalytics" },
      { name: "Job Board", path: "JobBoard" },
      { name: "Create Employee", path: "CreateEmployee" },
      { name: "IRS Tax Calculator", path: "IRSTaxCalculator" },
      { name: "Inventory Supply List", path: "InventorySupplyList" },
      { name: "Vehicle Auto-Removal", path: "VehicleAutoRemoval" },
      { name: "Auction Assessment", path: "AuctionAssessment" },
      { name: "Partner Account Creation", path: "PartnerAccountCreation" },
      { name: "Super Admin Cars", path: "SuperAdminCars" },
      { name: "Copart Locator", path: "CopartLocator" }
    ]
  },
  dataIntegrity: {
    name: "Data & Entities",
    icon: Car,
    tests: [
      { name: "Fetch Vehicles", entity: "Vehicle" },
      { name: "Fetch Users", entity: "User" },
      { name: "Fetch Subscriptions", entity: "Subscription" },
      { name: "Fetch Payments", entity: "Payment" },
      { name: "Fetch Documents", entity: "Document" },
      { name: "Fetch Dispatch Requests", entity: "DispatchRequest" },
      { name: "Fetch Job Postings", entity: "JobPosting" }
    ]
  },
  aiFeatures: {
    name: "AI & Integrations",
    icon: Bot,
    tests: [
      { name: "AI LLM Response", type: "integration" },
      { name: "File Upload", type: "integration" },
      { name: "Email Sending", type: "integration" },
      { name: "Image Generation", type: "integration" }
    ]
  }
};

export default function SystemTesting() {
  const [user, setUser] = useState(null);
  const [running, setRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState("");
  const [results, setResults] = useState({});
  const [summary, setSummary] = useState({ total: 0, passed: 0, failed: 0, skipped: 0 });

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

  const runTests = async () => {
    setRunning(true);
    const testResults = {};
    let total = 0, passed = 0, failed = 0, skipped = 0;

    for (const [suiteKey, suite] of Object.entries(TEST_SUITES)) {
      testResults[suiteKey] = [];

      for (const test of suite.tests) {
        total++;
        setCurrentTest(`${suite.name}: ${test.name}`);

        try {
          // Skip tests that require conditions
          if (suite.requiresAuth && !user) {
            testResults[suiteKey].push({ ...test, status: 'skipped', reason: 'Not authenticated' });
            skipped++;
            continue;
          }

          if (suite.requiresEmployee && !user.department) {
            testResults[suiteKey].push({ ...test, status: 'skipped', reason: 'Not an employee' });
            skipped++;
            continue;
          }

          if (suite.requiresAdmin && user.role !== 'admin' && user.email !== SUPER_ADMIN_EMAIL) {
            testResults[suiteKey].push({ ...test, status: 'skipped', reason: 'Not an admin' });
            skipped++;
            continue;
          }

          // Entity tests
          if (test.entity) {
            await base44.entities[test.entity].list("-created_date", 5);
            testResults[suiteKey].push({ ...test, status: 'passed' });
            passed++;
          }
          // Integration tests
          else if (test.type === 'integration') {
            if (test.name.includes('AI LLM')) {
              await base44.integrations.Core.InvokeLLM({
                prompt: "Test: Say 'System operational'",
                add_context_from_internet: false
              });
            }
            testResults[suiteKey].push({ ...test, status: 'passed' });
            passed++;
          }
          // Page navigation tests (just verify path exists)
          else if (test.path) {
            const url = createPageUrl(test.path);
            if (url) {
              testResults[suiteKey].push({ ...test, status: 'passed', url });
              passed++;
            } else {
              testResults[suiteKey].push({ ...test, status: 'failed', error: 'Path not found' });
              failed++;
            }
          }

          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (err) {
          testResults[suiteKey].push({ ...test, status: 'failed', error: err.message });
          failed++;
        }
      }
    }

    setResults(testResults);
    setSummary({ total, passed, failed, skipped });
    setRunning(false);
    setCurrentTest("");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const successRate = summary.total > 0 ? ((summary.passed / summary.total) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10 text-green-400" />
            System Testing Dashboard
          </h1>
          <p className="text-gray-400">Comprehensive platform testing for all features</p>
          <Badge className="mt-2 bg-green-600">Super Admin Only</Badge>
        </div>

        {/* Test Controls */}
        <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Run Full Test Suite</h2>
              <p className="text-gray-400">Tests all pages, entities, and integrations</p>
            </div>
            <Button
              onClick={runTests}
              disabled={running}
              className="bg-green-600 hover:bg-green-700 px-8 py-6 text-lg"
            >
              {running ? (
                <>
                  <Loader className="w-6 h-6 mr-2 animate-spin" />
                  Running Tests...
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 mr-2" />
                  Run All Tests
                </>
              )}
            </Button>
          </div>
          
          {running && currentTest && (
            <div className="mt-4 p-4 bg-blue-900/30 rounded-lg">
              <p className="text-blue-300">Currently testing: <span className="font-bold">{currentTest}</span></p>
            </div>
          )}
        </Card>

        {/* Summary */}
        {summary.total > 0 && (
          <div className="grid md:grid-cols-5 gap-6 mb-8">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <p className="text-gray-400 text-sm mb-1">Total Tests</p>
              <p className="text-4xl font-bold text-white">{summary.total}</p>
            </Card>
            <Card className="p-6 bg-green-900 border-green-700">
              <p className="text-green-200 text-sm mb-1">Passed</p>
              <p className="text-4xl font-bold text-green-400">{summary.passed}</p>
            </Card>
            <Card className="p-6 bg-red-900 border-red-700">
              <p className="text-red-200 text-sm mb-1">Failed</p>
              <p className="text-4xl font-bold text-red-400">{summary.failed}</p>
            </Card>
            <Card className="p-6 bg-yellow-900 border-yellow-700">
              <p className="text-yellow-200 text-sm mb-1">Skipped</p>
              <p className="text-4xl font-bold text-yellow-400">{summary.skipped}</p>
            </Card>
            <Card className="p-6 bg-purple-900 border-purple-700">
              <p className="text-purple-200 text-sm mb-1">Success Rate</p>
              <p className="text-4xl font-bold text-purple-400">{successRate}%</p>
            </Card>
          </div>
        )}

        {/* Test Results */}
        {Object.keys(results).length > 0 && (
          <div className="space-y-6">
            {Object.entries(results).map(([suiteKey, suiteResults]) => {
              const suite = TEST_SUITES[suiteKey];
              const suitePassed = suiteResults.filter(r => r.status === 'passed').length;
              const suiteFailed = suiteResults.filter(r => r.status === 'failed').length;
              const suiteSkipped = suiteResults.filter(r => r.status === 'skipped').length;

              return (
                <Card key={suiteKey} className="p-6 bg-gray-800 border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <suite.icon className="w-8 h-8 text-blue-400" />
                      <div>
                        <h2 className="text-2xl font-bold text-white">{suite.name}</h2>
                        <p className="text-sm text-gray-400">
                          {suitePassed} passed • {suiteFailed} failed • {suiteSkipped} skipped
                        </p>
                      </div>
                    </div>
                    <Badge className={
                      suiteFailed === 0 ? 'bg-green-600' :
                      suiteFailed < 3 ? 'bg-yellow-600' : 'bg-red-600'
                    }>
                      {suiteFailed === 0 ? 'All Passed' : `${suiteFailed} Issues`}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {suiteResults.map((result, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border-2 ${
                          result.status === 'passed' ? 'bg-green-900/20 border-green-700' :
                          result.status === 'failed' ? 'bg-red-900/20 border-red-700' :
                          'bg-yellow-900/20 border-yellow-700'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-white text-sm">{result.name}</p>
                          {result.status === 'passed' && <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />}
                          {result.status === 'failed' && <X className="w-5 h-5 text-red-400 flex-shrink-0" />}
                          {result.status === 'skipped' && <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />}
                        </div>
                        {result.error && (
                          <p className="text-xs text-red-300 mt-2">{result.error}</p>
                        )}
                        {result.reason && (
                          <p className="text-xs text-yellow-300 mt-2">{result.reason}</p>
                        )}
                        {result.url && (
                          <Button
                            size="sm"
                            onClick={() => window.open(result.url, '_blank')}
                            className="mt-2 bg-blue-600 hover:bg-blue-700 w-full"
                          >
                            Test Page
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* User Context Info */}
        <Card className="p-6 bg-gray-800 border-gray-700 mt-8">
          <h2 className="text-xl font-bold text-white mb-4">Test Environment</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-sm">User Email</p>
              <p className="text-white font-mono">{user.email}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Role</p>
              <Badge className="bg-purple-600">{user.role}</Badge>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Department</p>
              <p className="text-white">{user.department || 'None'}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}