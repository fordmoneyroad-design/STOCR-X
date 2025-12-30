import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle, Shield, Search, RefreshCw, Home,
  Bug, Code, FileText, Activity, ArrowLeft, Zap,
  CheckCircle, XCircle, Info, AlertCircle
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function SafetyErrorHandler() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
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
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  // SAFETY PATTERNS DATABASE
  const safetyPatterns = [
    {
      id: "null-check",
      category: "Data Safety",
      severity: "critical",
      title: "Null/Undefined Checking",
      problem: "Cannot read properties of null (reading 'property_name')",
      solution: "Always check if data exists before accessing properties",
      code: `// ❌ WRONG - Will crash if user is null
const name = user.full_name;

// ✅ CORRECT - Safe with conditional check
if (!user) {
  return <LoadingSpinner />;
}
const name = user.full_name;

// ✅ CORRECT - Optional chaining
const name = user?.full_name || 'Guest';`,
      pattern: "if (!data) return <Loading />;"
    },
    {
      id: "optional-chaining",
      category: "Data Safety",
      severity: "critical",
      title: "Optional Chaining (?.)",
      problem: "Accessing nested properties that might not exist",
      solution: "Use optional chaining to safely access nested properties",
      code: `// ❌ WRONG - Crashes if user or address is null
const city = user.address.city;

// ✅ CORRECT - Optional chaining
const city = user?.address?.city;

// ✅ CORRECT - With fallback
const city = user?.address?.city || 'Unknown';`,
      pattern: "object?.property?.nestedProperty"
    },
    {
      id: "loading-state",
      category: "UI/UX",
      severity: "high",
      title: "Loading State Management",
      problem: "Component renders before data is ready",
      solution: "Always implement loading states for async operations",
      code: `const [data, setData] = useState(null);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  fetchData().then(result => {
    setData(result);
    setIsLoading(false);
  });
}, []);

if (isLoading) {
  return <LoadingSpinner />;
}

if (!data) {
  return <ErrorMessage />;
}

return <DataDisplay data={data} />;`,
      pattern: "const [isLoading, setIsLoading] = useState(true);"
    },
    {
      id: "error-boundary",
      category: "Error Handling",
      severity: "high",
      title: "Error Boundaries",
      problem: "Unhandled errors crash the entire app",
      solution: "Wrap components in error boundaries to catch errors gracefully",
      code: `class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}`,
      pattern: "<ErrorBoundary>{children}</ErrorBoundary>"
    },
    {
      id: "array-check",
      category: "Data Safety",
      severity: "high",
      title: "Array Safety Checks",
      problem: "Trying to map over null or undefined arrays",
      solution: "Always verify array exists and is an array before mapping",
      code: `// ❌ WRONG - Crashes if items is null
items.map(item => <div>{item.name}</div>)

// ✅ CORRECT - Safe with check
{items && items.length > 0 && items.map(item => (
  <div key={item.id}>{item.name}</div>
))}

// ✅ CORRECT - With Array.isArray
{Array.isArray(items) && items.map(item => (
  <div key={item.id}>{item.name}</div>
))}`,
      pattern: "{Array.isArray(data) && data.map(...)}"
    },
    {
      id: "try-catch",
      category: "Error Handling",
      severity: "medium",
      title: "Try-Catch Blocks",
      problem: "Sync operations that might throw errors",
      solution: "Wrap risky operations in try-catch blocks",
      code: `// ✅ Safe async operation
const fetchData = async () => {
  try {
    const result = await api.getData();
    setData(result);
  } catch (error) {
    console.error('Failed to fetch:', error);
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};`,
      pattern: "try { ... } catch (error) { ... } finally { ... }"
    },
    {
      id: "default-props",
      category: "Data Safety",
      severity: "medium",
      title: "Default Values & Fallbacks",
      problem: "Missing data causes blank screens or errors",
      solution: "Always provide default values and fallbacks",
      code: `// ✅ Function parameter defaults
function UserCard({ user = {} }) {
  const name = user.name || 'Anonymous';
  const email = user.email || 'No email';
  
  return <div>{name} - {email}</div>;
}

// ✅ Destructuring with defaults
const { name = 'Guest', role = 'user' } = user || {};`,
      pattern: "const value = data?.property || 'default';"
    },
    {
      id: "conditional-render",
      category: "UI/UX",
      severity: "medium",
      title: "Conditional Rendering",
      problem: "Showing incomplete or error states",
      solution: "Use conditional rendering for different states",
      code: `// ✅ Multiple state handling
if (isLoading) return <Loading />;
if (error) return <Error message={error} />;
if (!data) return <Empty />;
if (data.length === 0) return <NoResults />;

return <DataDisplay data={data} />;`,
      pattern: "if (condition) return <Component />;"
    },
    {
      id: "safe-json-parse",
      category: "Data Safety",
      severity: "high",
      title: "Safe JSON Parsing",
      problem: "JSON.parse crashes on invalid JSON",
      solution: "Always wrap JSON.parse in try-catch",
      code: `// ❌ WRONG - Crashes on invalid JSON
const data = JSON.parse(jsonString);

// ✅ CORRECT - Safe parsing
const safeJsonParse = (str, fallback = {}) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.error('JSON parse error:', error);
    return fallback;
  }
};

const data = safeJsonParse(jsonString, { default: true });`,
      pattern: "try { JSON.parse(str) } catch { return default }"
    },
    {
      id: "query-initialization",
      category: "React Query",
      severity: "high",
      title: "React Query Initial Data",
      problem: "Query data is undefined until first fetch completes",
      solution: "Always provide initialData for queries",
      code: `// ✅ CORRECT - With initialData
const { data: users } = useQuery({
  queryKey: ['users'],
  queryFn: () => base44.entities.User.list(),
  initialData: [] // Always provide default!
});

// Now safe to use immediately
users.map(user => <UserCard user={user} />)`,
      pattern: "initialData: []"
    }
  ];

  const categories = [
    { id: "all", name: "All Patterns", icon: Shield, color: "bg-blue-600" },
    { id: "Data Safety", name: "Data Safety", icon: AlertTriangle, color: "bg-red-600" },
    { id: "Error Handling", name: "Error Handling", icon: Bug, color: "bg-orange-600" },
    { id: "UI/UX", name: "UI/UX", icon: Zap, color: "bg-purple-600" },
    { id: "React Query", name: "React Query", icon: Activity, color: "bg-green-600" }
  ];

  const filteredPatterns = safetyPatterns.filter(pattern => {
    const matchesCategory = selectedCategory === "all" || pattern.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      pattern.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pattern.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pattern.solution.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const severityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      default: return 'bg-blue-600';
    }
  };

  const severityIcon = (severity) => {
    switch (severity) {
      case 'critical': return XCircle;
      case 'high': return AlertCircle;
      case 'medium': return Info;
      default: return CheckCircle;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Safety Center...</p>
        </div>
      </div>
    );
  }

  // Error state (user not loaded)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <Card className="p-8 bg-red-900/30 border-red-700 max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white text-center mb-4">Access Denied</h2>
          <p className="text-red-200 text-center mb-6">
            This page is only accessible to administrators.
          </p>
          <Button
            onClick={() => navigate(createPageUrl("Home"))}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Homepage
          </Button>
        </Card>
      </div>
    );
  }

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

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Shield className="w-10 h-10 text-green-400 animate-pulse" />
                Safety & Error Prevention Center
              </h1>
              <p className="text-gray-400">
                AI-powered patterns to prevent crashes and handle errors gracefully
              </p>
            </div>
            <Badge className="bg-green-600 text-white text-lg px-4 py-2">
              {filteredPatterns.length} Patterns
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-red-900 border-red-700">
            <XCircle className="w-8 h-8 text-red-400 mb-2" />
            <p className="text-red-200 text-sm mb-1">Critical</p>
            <p className="text-3xl font-bold text-red-400">
              {safetyPatterns.filter(p => p.severity === 'critical').length}
            </p>
          </Card>

          <Card className="p-6 bg-orange-900 border-orange-700">
            <AlertCircle className="w-8 h-8 text-orange-400 mb-2" />
            <p className="text-orange-200 text-sm mb-1">High Priority</p>
            <p className="text-3xl font-bold text-orange-400">
              {safetyPatterns.filter(p => p.severity === 'high').length}
            </p>
          </Card>

          <Card className="p-6 bg-yellow-900 border-yellow-700">
            <Info className="w-8 h-8 text-yellow-400 mb-2" />
            <p className="text-yellow-200 text-sm mb-1">Medium</p>
            <p className="text-3xl font-bold text-yellow-400">
              {safetyPatterns.filter(p => p.severity === 'medium').length}
            </p>
          </Card>

          <Card className="p-6 bg-green-900 border-green-700">
            <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-green-200 text-sm mb-1">Total Patterns</p>
            <p className="text-3xl font-bold text-green-400">
              {safetyPatterns.length}
            </p>
          </Card>
        </div>

        {/* Search and Category Filter */}
        <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patterns by title, problem, or solution..."
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              variant="outline"
              className="border-gray-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset Filters
            </Button>
          </div>
        </Card>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-transparent">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className={`${
                  selectedCategory === cat.id
                    ? cat.color + ' text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                } border-none transition-all`}
              >
                <cat.icon className="w-4 h-4 mr-2" />
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Safety Patterns Grid */}
        {filteredPatterns.length > 0 ? (
          <div className="space-y-6">
            {filteredPatterns.map((pattern) => {
              const SeverityIcon = severityIcon(pattern.severity);
              return (
                <Card key={pattern.id} className="p-6 bg-gray-800 border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={severityColor(pattern.severity)}>
                          <SeverityIcon className="w-3 h-3 mr-1" />
                          {pattern.severity.toUpperCase()}
                        </Badge>
                        <Badge className="bg-blue-600">{pattern.category}</Badge>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{pattern.title}</h3>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <Alert className="bg-red-900/30 border-red-700">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <AlertDescription className="text-red-200">
                        <strong className="text-red-400">Problem:</strong>
                        <p className="mt-1">{pattern.problem}</p>
                      </AlertDescription>
                    </Alert>

                    <Alert className="bg-green-900/30 border-green-700">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <AlertDescription className="text-green-200">
                        <strong className="text-green-400">Solution:</strong>
                        <p className="mt-1">{pattern.solution}</p>
                      </AlertDescription>
                    </Alert>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-purple-600 text-xs">
                        <Code className="w-3 h-3 mr-1" />
                        Code Example
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigator.clipboard.writeText(pattern.code)}
                        className="text-gray-400 hover:text-white text-xs"
                      >
                        Copy Code
                      </Button>
                    </div>
                    <pre className="text-sm text-gray-300 overflow-x-auto">
                      <code>{pattern.code}</code>
                    </pre>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-blue-400 border-blue-400">
                      Quick Pattern: {pattern.pattern}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="p-12 bg-gray-800 border-gray-700 text-center">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-bold text-white mb-2">No patterns found</h3>
            <p className="text-gray-400 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Reset Filters
            </Button>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card
            className="p-6 bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate(createPageUrl("AppDocumentation"))}
          >
            <FileText className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Full Documentation</h3>
            <p className="text-blue-200 text-sm">Complete platform documentation and guides</p>
          </Card>

          <Card
            className="p-6 bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate(createPageUrl("TechnicalGuide"))}
          >
            <Code className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Technical Guide</h3>
            <p className="text-purple-200 text-sm">Backend tips and advanced coding patterns</p>
          </Card>

          <Card
            className="p-6 bg-gradient-to-br from-green-900 to-green-800 border-green-700 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate(createPageUrl("SystemTesting"))}
          >
            <Activity className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">System Testing</h3>
            <p className="text-green-200 text-sm">Test and validate system components</p>
          </Card>
        </div>
      </div>
    </div>
  );
}