import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Terminal, Database, Code, Zap, Shield, FileCode, 
  Package, Wrench, BookOpen, GitBranch 
} from "lucide-react";

export default function TechnicalGuide() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <Terminal className="w-16 h-16 mx-auto mb-4 text-green-400" />
          <h1 className="text-5xl font-bold text-white mb-4">Technical Guide</h1>
          <p className="text-xl text-gray-400">Complete technical documentation for STOCRX platform</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-8 bg-gray-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="backend">Backend</TabsTrigger>
            <TabsTrigger value="frontend">Frontend</TabsTrigger>
            <TabsTrigger value="deployment">Deployment</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview">
            <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-blue-400" />
                Platform Overview
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-3">🏗️ Technology Stack</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="p-4 bg-blue-900 border-blue-700">
                      <p className="font-bold text-white mb-2">Frontend</p>
                      <ul className="text-blue-200 text-sm space-y-1">
                        <li>• React 18</li>
                        <li>• React Router DOM</li>
                        <li>• TailwindCSS</li>
                        <li>• Shadcn/ui Components</li>
                        <li>• Lucide React Icons</li>
                        <li>• Framer Motion</li>
                      </ul>
                    </Card>

                    <Card className="p-4 bg-green-900 border-green-700">
                      <p className="font-bold text-white mb-2">Backend (Base44)</p>
                      <ul className="text-green-200 text-sm space-y-1">
                        <li>• Base44 BaaS Platform</li>
                        <li>• PostgreSQL Database</li>
                        <li>• Supabase Storage</li>
                        <li>• JWT Authentication</li>
                        <li>• REST API</li>
                      </ul>
                    </Card>

                    <Card className="p-4 bg-purple-900 border-purple-700">
                      <p className="font-bold text-white mb-2">Integrations</p>
                      <ul className="text-purple-200 text-sm space-y-1">
                        <li>• OpenAI LLM</li>
                        <li>• Email Service</li>
                        <li>• File Upload</li>
                        <li>• Image Generation</li>
                        <li>• Data Extraction</li>
                      </ul>
                    </Card>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-3">📦 Package Dependencies</h3>
                  <Card className="p-4 bg-gray-700 border-gray-600">
                    <pre className="text-green-400 text-sm overflow-x-auto">
{`{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.x",
    "@tanstack/react-query": "^4.x",
    "tailwindcss": "^3.x",
    "lucide-react": "latest",
    "framer-motion": "^10.x",
    "date-fns": "^2.x",
    "lodash": "^4.x",
    "recharts": "^2.x",
    "react-quill": "^2.x",
    "@hello-pangea/dnd": "^16.x"
  }
}`}
                    </pre>
                  </Card>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-3">🌐 Platform Type</h3>
                  <Card className="p-6 bg-yellow-900/30 border-yellow-700">
                    <p className="text-yellow-200 mb-3">
                      <strong>⚠️ IMPORTANT:</strong> STOCRX is built on <strong>Base44</strong>, 
                      a Backend-as-a-Service (BaaS) platform.
                    </p>
                    <ul className="text-yellow-100 space-y-2">
                      <li>✅ You own: Frontend code (React components, pages, layout)</li>
                      <li>✅ You own: Entity schemas (database structure definitions)</li>
                      <li>✅ You own: Business logic in React components</li>
                      <li>❌ You DON'T own: Backend server infrastructure</li>
                      <li>❌ You DON'T own: Database engine</li>
                      <li>❌ You DON'T own: Authentication system</li>
                    </ul>
                  </Card>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ARCHITECTURE */}
          <TabsContent value="architecture">
            <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <GitBranch className="w-8 h-8 text-purple-400" />
                System Architecture
              </h2>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">📊 Architecture Diagram</h3>
                  <Card className="p-6 bg-gray-700 border-gray-600">
                    <pre className="text-blue-300 text-sm overflow-x-auto whitespace-pre">
{`
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React Application (Frontend)                         │   │
│  │  ├── Pages (Home, BrowseCars, MyAccount, etc.)       │   │
│  │  ├── Components (Reusable UI)                        │   │
│  │  ├── Layout (Navigation, Footer)                     │   │
│  │  └── React Query (State Management)                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕️
┌─────────────────────────────────────────────────────────────┐
│                     BASE44 API LAYER                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  base44 SDK (@/api/base44Client)                     │   │
│  │  ├── base44.entities.* (CRUD operations)            │   │
│  │  ├── base44.auth.* (Authentication)                 │   │
│  │  └── base44.integrations.* (External services)      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕️
┌─────────────────────────────────────────────────────────────┐
│                    BASE44 BACKEND (BaaS)                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                                  │   │
│  │  ├── 27 Entities (User, Vehicle, Subscription, etc.) │   │
│  │  ├── Relationships & Constraints                     │   │
│  │  └── Automatic CRUD APIs                             │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Authentication System (JWT)                          │   │
│  │  ├── User Registration                                │   │
│  │  ├── Login/Logout                                     │   │
│  │  ├── Role-Based Access Control                       │   │
│  │  └── Session Management                               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  File Storage (Supabase)                              │   │
│  │  ├── Vehicle Images                                   │   │
│  │  ├── Documents (KYC, Contracts)                       │   │
│  │  └── User Uploads                                     │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Integration Services                                 │   │
│  │  ├── OpenAI LLM (AI features)                        │   │
│  │  ├── Email Service (Notifications)                   │   │
│  │  └── Image Generation                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
`}
                    </pre>
                  </Card>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">🗂️ File Structure</h3>
                  <Card className="p-4 bg-gray-700 border-gray-600">
                    <pre className="text-green-400 text-sm overflow-x-auto">
{`stocrx/
├── entities/                  # Database schemas (JSON)
│   ├── User.json
│   ├── Vehicle.json
│   ├── Subscription.json
│   ├── Payment.json
│   └── ... (27 total entities)
│
├── pages/                     # React page components
│   ├── Home.jsx
│   ├── BrowseCars.jsx
│   ├── MyAccount.jsx
│   ├── SuperAdmin.jsx
│   └── ... (100+ pages)
│
├── components/                # Reusable React components
│   ├── ui/                   # Shadcn UI components
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   └── ...
│   ├── vehicles/
│   │   ├── VehicleCard.jsx
│   │   └── VehicleFilters.jsx
│   ├── admin/
│   │   ├── SuperAdminQuickActions.jsx
│   │   └── UniversalSearchPanel.jsx
│   └── ...
│
├── Layout.jsx                 # Main layout wrapper
├── utils.js                   # Utility functions
└── api/
    └── base44Client.js        # Pre-initialized Base44 SDK

Note: Backend infrastructure NOT included (managed by Base44)
`}
                    </pre>
                  </Card>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* BACKEND */}
          <TabsContent value="backend">
            <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Database className="w-8 h-8 text-green-400" />
                Backend Development
              </h2>

              <div className="space-y-6">
                <Card className="p-6 bg-red-900/30 border-red-700">
                  <h3 className="text-xl font-bold text-white mb-3">⚠️ Backend Functions Limitation</h3>
                  <p className="text-red-200 mb-4">
                    Base44 <strong>does not support custom backend functions</strong> in the current implementation. 
                    All backend logic must be handled through:
                  </p>
                  <ul className="text-red-100 space-y-2">
                    <li>✅ Entity CRUD operations (base44.entities.*)</li>
                    <li>✅ Built-in integrations (base44.integrations.Core.*)</li>
                    <li>✅ Frontend logic in React components</li>
                    <li>❌ Custom API endpoints (not available)</li>
                    <li>❌ Server-side processing (not available)</li>
                    <li>❌ Cron jobs (not available)</li>
                  </ul>
                </Card>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">📦 Entity System</h3>
                  <p className="text-gray-300 mb-4">Entities are JSON Schema definitions that Base44 automatically converts to database tables and API endpoints.</p>
                  
                  <Card className="p-4 bg-gray-700 border-gray-600 mb-4">
                    <p className="font-bold text-white mb-2">Example Entity Schema:</p>
                    <pre className="text-green-400 text-sm overflow-x-auto">
{`{
  "name": "Vehicle",
  "type": "object",
  "properties": {
    "make": { "type": "string" },
    "model": { "type": "string" },
    "year": { "type": "integer" },
    "price": { "type": "number" },
    "status": {
      "type": "string",
      "enum": ["available", "subscribed", "sold"]
    }
  },
  "required": ["make", "model", "year", "price"]
}`}
                    </pre>
                  </Card>

                  <p className="text-gray-300 mb-2">Automatically generates:</p>
                  <ul className="text-blue-300 space-y-1">
                    <li>✅ PostgreSQL table</li>
                    <li>✅ CRUD API endpoints</li>
                    <li>✅ base44.entities.Vehicle.list()</li>
                    <li>✅ base44.entities.Vehicle.create(data)</li>
                    <li>✅ base44.entities.Vehicle.update(id, data)</li>
                    <li>✅ base44.entities.Vehicle.delete(id)</li>
                    <li>✅ base44.entities.Vehicle.filter(query)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">🔌 Integration System</h3>
                  <p className="text-gray-300 mb-4">Base44 provides built-in integrations for common tasks:</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="p-4 bg-gray-700 border-gray-600">
                      <p className="font-bold text-white mb-2">InvokeLLM</p>
                      <pre className="text-green-400 text-xs overflow-x-auto">
{`const response = await 
  base44.integrations.Core.InvokeLLM({
  prompt: "Your prompt here",
  response_json_schema: {...}
});`}
                      </pre>
                    </Card>

                    <Card className="p-4 bg-gray-700 border-gray-600">
                      <p className="font-bold text-white mb-2">SendEmail</p>
                      <pre className="text-green-400 text-xs overflow-x-auto">
{`await base44.integrations.Core.SendEmail({
  to: "user@example.com",
  subject: "Welcome",
  body: "Email content"
});`}
                      </pre>
                    </Card>

                    <Card className="p-4 bg-gray-700 border-gray-600">
                      <p className="font-bold text-white mb-2">UploadFile</p>
                      <pre className="text-green-400 text-xs overflow-x-auto">
{`const {file_url} = await 
  base44.integrations.Core.UploadFile({
  file: fileObject
});`}
                      </pre>
                    </Card>

                    <Card className="p-4 bg-gray-700 border-gray-600">
                      <p className="font-bold text-white mb-2">GenerateImage</p>
                      <pre className="text-green-400 text-xs overflow-x-auto">
{`const {url} = await 
  base44.integrations.Core.GenerateImage({
  prompt: "Image description"
});`}
                      </pre>
                    </Card>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* FRONTEND */}
          <TabsContent value="frontend">
            <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Code className="w-8 h-8 text-blue-400" />
                Frontend Development
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">🎨 Component Structure</h3>
                  <p className="text-gray-300 mb-4">All pages are React functional components that follow this pattern:</p>
                  
                  <Card className="p-4 bg-gray-700 border-gray-600">
                    <pre className="text-green-400 text-sm overflow-x-auto">
{`import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function MyPage() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  // Authentication check
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

  // Data fetching
  const { data: items } = useQuery({
    queryKey: ['items'],
    queryFn: () => base44.entities.MyEntity.list(),
    initialData: []
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.MyEntity.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['items']);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      {/* Your JSX here */}
    </div>
  );
}`}
                    </pre>
                  </Card>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">🎭 Styling System</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="p-4 bg-gray-700 border-gray-600">
                      <p className="font-bold text-white mb-2">TailwindCSS Classes</p>
                      <pre className="text-blue-300 text-xs">
{`<div className="
  flex items-center justify-between
  p-6 rounded-lg
  bg-gradient-to-r from-blue-500 to-purple-600
  hover:shadow-xl transition-all
  text-white font-bold
">
  Content
</div>`}
                      </pre>
                    </Card>

                    <Card className="p-4 bg-gray-700 border-gray-600">
                      <p className="font-bold text-white mb-2">Shadcn/ui Components</p>
                      <pre className="text-blue-300 text-xs">
{`import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

<Button className="bg-blue-600">
  Click Me
</Button>`}
                      </pre>
                    </Card>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">🔄 State Management</h3>
                  <p className="text-gray-300 mb-4">Uses React Query (TanStack Query) for server state:</p>
                  
                  <Card className="p-4 bg-gray-700 border-gray-600">
                    <pre className="text-green-400 text-sm overflow-x-auto">
{`// Fetching data
const { data, isLoading, error } = useQuery({
  queryKey: ['vehicles'],
  queryFn: () => base44.entities.Vehicle.list(),
  initialData: []
});

// Creating data
const createMutation = useMutation({
  mutationFn: (vehicleData) => base44.entities.Vehicle.create(vehicleData),
  onSuccess: () => {
    queryClient.invalidateQueries(['vehicles']);
    alert("Vehicle created!");
  }
});

// Updating data
const updateMutation = useMutation({
  mutationFn: ({ id, data }) => base44.entities.Vehicle.update(id, data),
  onSuccess: () => {
    queryClient.invalidateQueries(['vehicles']);
  }
});`}
                    </pre>
                  </Card>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* DEPLOYMENT */}
          <TabsContent value="deployment">
            <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
              <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Zap className="w-8 h-8 text-yellow-400" />
                Deployment & Export
              </h2>

              <div className="space-y-6">
                <Card className="p-6 bg-red-900/30 border-red-700">
                  <h3 className="text-xl font-bold text-white mb-3">❌ Independent Hosting NOT Possible</h3>
                  <p className="text-red-200 mb-4">
                    STOCRX cannot be hosted independently because:
                  </p>
                  <ul className="text-red-100 space-y-2">
                    <li>❌ Base44 backend is proprietary (you don't own the server code)</li>
                    <li>❌ Database is managed by Base44 (PostgreSQL cluster)</li>
                    <li>❌ Authentication system is managed by Base44</li>
                    <li>❌ File storage is managed by Base44 (Supabase)</li>
                    <li>❌ Integrations (AI, email) are managed by Base44</li>
                  </ul>
                </Card>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">✅ What CAN Be Exported</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="p-4 bg-green-900 border-green-700">
                      <p className="font-bold text-white mb-2">Exportable</p>
                      <ul className="text-green-200 text-sm space-y-1">
                        <li>✅ Entity schemas (JSON files)</li>
                        <li>✅ Page components (JSX files)</li>
                        <li>✅ Component files (JSX files)</li>
                        <li>✅ Layout file (JSX)</li>
                        <li>✅ Entity data (as CSV/JSON)</li>
                        <li>✅ Documentation</li>
                      </ul>
                    </Card>

                    <Card className="p-4 bg-red-900 border-red-700">
                      <p className="font-bold text-white mb-2">NOT Exportable</p>
                      <ul className="text-red-200 text-sm space-y-1">
                        <li>❌ Backend server code</li>
                        <li>❌ Database engine</li>
                        <li>❌ Authentication system</li>
                        <li>❌ File storage system</li>
                        <li>❌ Integration APIs</li>
                        <li>❌ Hosting infrastructure</li>
                      </ul>
                    </Card>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">📦 Export Options</h3>
                  
                  <Card className="p-6 bg-blue-900/30 border-blue-700 mb-4">
                    <p className="font-bold text-white mb-2">1. Code Exporter Page</p>
                    <p className="text-blue-200 mb-3">Download all your frontend code as ZIP</p>
                    <Badge className="bg-blue-600">
                      Available at: /CodeExporter
                    </Badge>
                  </Card>

                  <Card className="p-6 bg-purple-900/30 border-purple-700 mb-4">
                    <p className="font-bold text-white mb-2">2. Entity Data Export</p>
                    <p className="text-purple-200 mb-3">Export all database records as JSON/CSV</p>
                    <Badge className="bg-purple-600">
                      Available at: Dashboard → Data
                    </Badge>
                  </Card>

                  <Card className="p-6 bg-green-900/30 border-green-700">
                    <p className="font-bold text-white mb-2">3. GitHub Upload</p>
                    <p className="text-green-200 mb-3">
                      You can upload exported code to GitHub for version control, 
                      but it won't be deployable without Base44
                    </p>
                    <Badge className="bg-green-600">
                      Documentation Only
                    </Badge>
                  </Card>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white mb-4">🔄 Migration Path</h3>
                  <p className="text-gray-300 mb-4">
                    To migrate away from Base44, you would need to:
                  </p>
                  
                  <ol className="text-yellow-200 space-y-3">
                    <li>1️⃣ Export all entity schemas and data</li>
                    <li>2️⃣ Set up your own PostgreSQL database</li>
                    <li>3️⃣ Create backend API endpoints for each entity</li>
                    <li>4️⃣ Implement authentication system (JWT, OAuth)</li>
                    <li>5️⃣ Set up file storage (AWS S3, Cloudinary, etc.)</li>
                    <li>6️⃣ Integrate third-party services (OpenAI, SendGrid)</li>
                    <li>7️⃣ Rewrite all base44.* calls to your custom API</li>
                    <li>8️⃣ Deploy frontend + backend separately</li>
                  </ol>

                  <Card className="p-4 bg-yellow-900/30 border-yellow-700 mt-4">
                    <p className="text-yellow-200">
                      ⚠️ <strong>Estimated effort:</strong> 200-400 hours of development work
                    </p>
                  </Card>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}