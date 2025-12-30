import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Zap, Code, Database, Key, Terminal, BookOpen } from "lucide-react";

export default function ShortcutsCheatSheet() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <Zap className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h1 className="text-5xl font-bold text-white mb-4">Developer Cheat Sheet</h1>
          <p className="text-xl text-gray-400">Quick reference for STOCRX development</p>
        </div>

        <Tabs defaultValue="entities">
          <TabsList className="grid grid-cols-4 mb-8 bg-gray-800">
            <TabsTrigger value="entities">Entities</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="routing">Routing</TabsTrigger>
            <TabsTrigger value="styling">Styling</TabsTrigger>
          </TabsList>

          {/* ENTITIES TAB */}
          <TabsContent value="entities">
            <Card className="p-8 bg-gray-800 border-gray-700">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Database className="w-8 h-8 text-green-400" />
                Entity CRUD Operations
              </h2>

              <div className="space-y-6">
                <div>
                  <Badge className="bg-blue-600 mb-3">List All Records</Badge>
                  <pre className="text-green-400 text-sm bg-gray-900 p-4 rounded-lg overflow-x-auto">
{`const { data: vehicles } = useQuery({
  queryKey: ['vehicles'],
  queryFn: () => base44.entities.Vehicle.list(),
  initialData: []
});

// With sorting and limit
base44.entities.Vehicle.list("-created_date", 50)  // Newest 50`}
                  </pre>
                </div>

                <div>
                  <Badge className="bg-green-600 mb-3">Filter Records</Badge>
                  <pre className="text-green-400 text-sm bg-gray-900 p-4 rounded-lg overflow-x-auto">
{`// Simple filter
base44.entities.Vehicle.filter({ status: "available" })

// Multiple conditions
base44.entities.Vehicle.filter({
  status: "available",
  price: { $lte: 10000 }
}, "-created_date", 20)

// Query operators:
// $eq  - equals
// $ne  - not equals
// $gt  - greater than
// $gte - greater than or equal
// $lt  - less than
// $lte - less than or equal
// $in  - in array
// $exists - field exists`}
                  </pre>
                </div>

                <div>
                  <Badge className="bg-purple-600 mb-3">Create Record</Badge>
                  <pre className="text-green-400 text-sm bg-gray-900 p-4 rounded-lg overflow-x-auto">
{`const createMutation = useMutation({
  mutationFn: (data) => base44.entities.Vehicle.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries(['vehicles']);
    alert("Created!");
  }
});

// Usage
createMutation.mutate({
  make: "Toyota",
  model: "Camry",
  year: 2020,
  price: 15000
});`}
                  </pre>
                </div>

                <div>
                  <Badge className="bg-orange-600 mb-3">Update Record</Badge>
                  <pre className="text-green-400 text-sm bg-gray-900 p-4 rounded-lg overflow-x-auto">
{`const updateMutation = useMutation({
  mutationFn: ({ id, data }) => base44.entities.Vehicle.update(id, data),
  onSuccess: () => queryClient.invalidateQueries(['vehicles'])
});

// Usage
updateMutation.mutate({
  id: vehicleId,
  data: { status: "sold" }
});`}
                  </pre>
                </div>

                <div>
                  <Badge className="bg-red-600 mb-3">Delete Record</Badge>
                  <pre className="text-green-400 text-sm bg-gray-900 p-4 rounded-lg overflow-x-auto">
{`const deleteMutation = useMutation({
  mutationFn: (id) => base44.entities.Vehicle.delete(id),
  onSuccess: () => queryClient.invalidateQueries(['vehicles'])
});

// Usage
deleteMutation.mutate(vehicleId);`}
                  </pre>
                </div>

                <div>
                  <Badge className="bg-cyan-600 mb-3">Authentication</Badge>
                  <pre className="text-green-400 text-sm bg-gray-900 p-4 rounded-lg overflow-x-auto">
{`// Get current user
const user = await base44.auth.me();

// Check if authenticated
const isAuth = await base44.auth.isAuthenticated();

// Redirect to login
base44.auth.redirectToLogin("/next-page");

// Logout
base44.auth.logout();

// Update current user
await base44.auth.updateMe({ full_name: "New Name" });`}
                  </pre>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* COMPONENTS TAB */}
          <TabsContent value="components">
            <Card className="p-8 bg-gray-800 border-gray-700">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Code className="w-8 h-8 text-blue-400" />
                Component Patterns
              </h2>

              <div className="space-y-6">
                <div>
                  <Badge className="bg-blue-600 mb-3">Basic Page Component</Badge>
                  <pre className="text-green-400 text-sm bg-gray-900 p-4 rounded-lg overflow-x-auto">
{`import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";

export default function MyPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (err) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen py-12">
      <Card className="p-8">
        <h1>Hello {user.full_name}</h1>
      </Card>
    </div>
  );
}`}
                  </pre>
                </div>

                <div>
                  <Badge className="bg-green-600 mb-3">Shadcn/ui Components</Badge>
                  <pre className="text-green-400 text-sm bg-gray-900 p-4 rounded-lg overflow-x-auto">
{`import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } 
  from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } 
  from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

<Button className="bg-blue-600">Click Me</Button>
<Card className="p-6">Content</Card>
<Badge className="bg-green-600">Active</Badge>`}
                  </pre>
                </div>

                <div>
                  <Badge className="bg-purple-600 mb-3">Icons (Lucide React)</Badge>
                  <pre className="text-green-400 text-sm bg-gray-900 p-4 rounded-lg overflow-x-auto">
{`import { 
  User, Mail, Car, CheckCircle, AlertTriangle, 
  Settings, Home, Search, Plus, Edit, Trash 
} from "lucide-react";

<User className="w-5 h-5 text-blue-400" />
<Mail className="w-5 h-5 mr-2" />
<CheckCircle className="w-6 h-6 text-green-400" />`}
                  </pre>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ROUTING TAB */}
          <TabsContent value="routing">
            <Card className="p-8 bg-gray-800 border-gray-700">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Key className="w-8 h-8 text-yellow-400" />
                Navigation & Routing
              </h2>

              <div className="space-y-6">
                <div>
                  <Badge className="bg-blue-600 mb-3">Navigate Between Pages</Badge>
                  <pre className="text-green-400 text-sm bg-gray-900 p-4 rounded-lg overflow-x-auto">
{`import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const navigate = useNavigate();

// Navigate to page
navigate(createPageUrl("BrowseCars"));

// Navigate with URL params
navigate(createPageUrl("CarDetails") + "?id=123");

// Navigate and replace history
navigate(createPageUrl("Home"), { replace: true });

// Go back
navigate(-1);  // or window.history.back();`}
                  </pre>
                </div>

                <div>
                  <Badge className="bg-green-600 mb-3">Get URL Parameters</Badge>
                  <pre className="text-green-400 text-sm bg-gray-900 p-4 rounded-lg overflow-x-auto">
{`// Get single parameter
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');
const email = urlParams.get('email');

// Get multiple parameters
const params = Object.fromEntries(urlParams.entries());
console.log(params);  // { id: '123', email: 'test@test.com' }`}
                  </pre>
                </div>

                <div>
                  <Badge className="bg-purple-600 mb-3">Link Components</Badge>
                  <pre className="text-green-400 text-sm bg-gray-900 p-4 rounded-lg overflow-x-auto">
{`import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

<Link to={createPageUrl("Home")}>
  Go to Home
</Link>

<Link 
  to={createPageUrl("CarDetails") + "?id=123"}
  className="text-blue-600 hover:underline"
>
  View Car
</Link>`}
                  </pre>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* STYLING TAB */}
          <TabsContent value="styling">
            <Card className="p-8 bg-gray-800 border-gray-700">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Terminal className="w-8 h-8 text-pink-400" />
                TailwindCSS Classes
              </h2>

              <div className="space-y-6">
                <div>
                  <Badge className="bg-blue-600 mb-3">Layout</Badge>
                  <pre className="text-green-400 text-sm bg-gray-900 p-4 rounded-lg overflow-x-auto">
{`// Flexbox
flex items-center justify-between gap-4
flex-col md:flex-row

// Grid
grid grid-cols-1 md:grid-cols-3 gap-6
grid-cols-2 lg:grid-cols-4

// Spacing
p-4  pt-6  px-8  py-3  m-4  mt-6  mx-auto
space-y-4  space-x-2  gap-4

// Sizing
w-full h-screen min-h-screen max-w-7xl
w-64 h-48 w-1/2 h-auto`}
                  </pre>
                </div>

                <div>
                  <Badge className="bg-green-600 mb-3">Colors & Backgrounds</Badge>
                  <pre className="text-green-400 text-sm bg-gray-900 p-4 rounded-lg overflow-x-auto">
{`// Text colors
text-white text-gray-400 text-blue-600 text-red-500

// Backgrounds
bg-gray-900 bg-blue-600 bg-gradient-to-r from-blue-500 to-purple-600

// Borders
border border-gray-700 border-2 border-blue-600 rounded-lg

// Opacity
bg-white/10 backdrop-blur-md opacity-50`}
                  </pre>
                </div>

                <div>
                  <Badge className="bg-purple-600 mb-3">Typography</Badge>
                  <pre className="text-green-400 text-sm bg-gray-900 p-4 rounded-lg overflow-x-auto">
{`// Font sizes
text-xs text-sm text-base text-lg text-xl text-2xl text-4xl

// Font weights
font-normal font-semibold font-bold

// Text alignment
text-left text-center text-right

// Line height & spacing
leading-tight leading-normal leading-loose tracking-wide`}
                  </pre>
                </div>

                <div>
                  <Badge className="bg-orange-600 mb-3">Responsive Design</Badge>
                  <pre className="text-green-400 text-sm bg-gray-900 p-4 rounded-lg overflow-x-auto">
{`// Breakpoints: sm (640px) md (768px) lg (1024px) xl (1280px)

// Mobile first approach
<div className="
  grid grid-cols-1         // Mobile: 1 column
  md:grid-cols-2           // Tablet: 2 columns
  lg:grid-cols-3           // Desktop: 3 columns
  gap-4 md:gap-6           // Responsive gap
  px-4 md:px-8             // Responsive padding
">
  Content
</div>`}
                  </pre>
                </div>

                <div>
                  <Badge className="bg-pink-600 mb-3">Hover & Transitions</Badge>
                  <pre className="text-green-400 text-sm bg-gray-900 p-4 rounded-lg overflow-x-auto">
{`// Hover effects
hover:bg-blue-700 hover:text-white hover:scale-105

// Transitions
transition-all duration-300 ease-in-out
animate-spin animate-pulse

// Cursor
cursor-pointer cursor-not-allowed`}
                  </pre>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* QUICK REFERENCE CARDS */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card className="p-6 bg-blue-900 border-blue-700">
            <h3 className="font-bold text-white mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Common Imports
            </h3>
            <pre className="text-blue-200 text-xs">
{`import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";`}
            </pre>
          </Card>

          <Card className="p-6 bg-green-900 border-green-700">
            <h3 className="font-bold text-white mb-3">Common Entities</h3>
            <ul className="text-green-200 text-sm space-y-1">
              <li>• Vehicle</li>
              <li>• User</li>
              <li>• Subscription</li>
              <li>• Payment</li>
              <li>• Document</li>
              <li>• EmployeeRole</li>
            </ul>
          </Card>

          <Card className="p-6 bg-purple-900 border-purple-700">
            <h3 className="font-bold text-white mb-3">Key Pages</h3>
            <ul className="text-purple-200 text-sm space-y-1">
              <li>• Home</li>
              <li>• BrowseCars</li>
              <li>• SuperAdmin</li>
              <li>• EmployeeDashboard</li>
              <li>• CopartImporter</li>
              <li>• AccountApprovalStatus</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}