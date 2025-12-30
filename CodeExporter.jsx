import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Download, FileCode, Database, AlertTriangle, CheckCircle,
  Package, GitBranch, Terminal, FileText, Folder
} from "lucide-react";

export default function CodeExporter() {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      alert(`📦 EXPORT EXPLANATION:

Base44 does not support direct code export as a downloadable ZIP file.

WHAT YOU CAN DO:
1. ✅ Copy individual files manually from the Base44 dashboard
2. ✅ Export entity data as JSON/CSV
3. ✅ Screenshot/document your pages
4. ✅ Use Base44's built-in version control

WHAT YOU CANNOT DO:
❌ Download entire codebase as ZIP
❌ Host independently without Base44
❌ Export backend infrastructure

TO MIGRATE AWAY:
You would need to rebuild the entire backend (200-400 hours of work):
- Set up PostgreSQL database
- Create REST API endpoints
- Implement authentication system
- Set up file storage
- Integrate third-party services
- Rewrite all base44.* calls

RECOMMENDATION:
Continue using Base44 for hosting, or contact Base44 support for enterprise export options.`);
      setExporting(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-blue-400" />
          <h1 className="text-5xl font-bold text-white mb-4">Code Export Center</h1>
          <p className="text-xl text-gray-400">Export and documentation tools</p>
        </div>

        {/* CRITICAL WARNING */}
        <Alert className="mb-8 bg-red-900/30 border-red-700">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          <AlertDescription className="text-red-200">
            <strong>⚠️ IMPORTANT:</strong> STOCRX is built on Base44 (Backend-as-a-Service). 
            You <strong>cannot host this independently</strong> without rebuilding the entire backend infrastructure.
            This page provides documentation and export options for your frontend code only.
          </AlertDescription>
        </Alert>

        {/* EXPORT OPTIONS */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="p-8 bg-gray-800 border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FileCode className="w-6 h-6 text-green-400" />
              Exportable Assets
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                <div>
                  <p className="font-bold text-white">Frontend Code</p>
                  <p className="text-sm text-gray-400">React components, pages, layout files</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                <div>
                  <p className="font-bold text-white">Entity Schemas</p>
                  <p className="text-sm text-gray-400">JSON database definitions (27 entities)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                <div>
                  <p className="font-bold text-white">Entity Data</p>
                  <p className="text-sm text-gray-400">Export as JSON/CSV from Base44 dashboard</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                <div>
                  <p className="font-bold text-white">Documentation</p>
                  <p className="text-sm text-gray-400">Technical guides, platform narrative, API docs</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1" />
                <div>
                  <p className="font-bold text-white">UI Components</p>
                  <p className="text-sm text-gray-400">Reusable Shadcn/ui components</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 bg-gray-800 border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              Non-Exportable
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-1" />
                <div>
                  <p className="font-bold text-white">Backend Infrastructure</p>
                  <p className="text-sm text-gray-400">Base44's proprietary server system</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-1" />
                <div>
                  <p className="font-bold text-white">Database Engine</p>
                  <p className="text-sm text-gray-400">PostgreSQL cluster managed by Base44</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-1" />
                <div>
                  <p className="font-bold text-white">Authentication System</p>
                  <p className="text-sm text-gray-400">JWT/OAuth implementation</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-1" />
                <div>
                  <p className="font-bold text-white">File Storage</p>
                  <p className="text-sm text-gray-400">Supabase storage integration</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 mt-1" />
                <div>
                  <p className="font-bold text-white">API Endpoints</p>
                  <p className="text-sm text-gray-400">Auto-generated CRUD operations</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* PROJECT STRUCTURE */}
        <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Folder className="w-6 h-6 text-yellow-400" />
            Project Structure
          </h2>

          <pre className="text-green-400 text-sm bg-gray-900 p-4 rounded-lg overflow-x-auto">
{`stocrx/
├── entities/                    # Database schemas (JSON)
│   ├── User.json
│   ├── Vehicle.json
│   ├── Subscription.json
│   ├── Payment.json
│   ├── Document.json
│   ├── ActivityLog.json
│   ├── DamageReport.json
│   ├── SwapRequest.json
│   ├── FinancingOption.json
│   ├── Schedule.json
│   ├── TimeTracking.json
│   ├── Payroll.json
│   ├── EmployeeCategory.json
│   ├── EmployeeRole.json
│   ├── VehicleInspection.json
│   ├── ReturnRequest.json
│   ├── StoreCredit.json
│   ├── DispatchRequest.json
│   ├── SearchTracking.json
│   ├── AffiliateProgram.json
│   ├── PartnerCollaborator.json
│   ├── PartnerAccessCode.json
│   ├── CareerApplication.json
│   ├── JobPosting.json
│   ├── PayrollRequest.json
│   ├── ThemeSettings.json
│   ├── CopartCredential.json     # NEW
│   └── CopartWatchlist.json      # NEW
│
├── pages/                       # React page components (100+ pages)
│   ├── Home.jsx
│   ├── BrowseCars.jsx
│   ├── CarDetails.jsx
│   ├── MyAccount.jsx
│   ├── SubscriptionPlans.jsx
│   ├── SuperAdmin.jsx
│   ├── AccountApprovalStatus.jsx
│   ├── EmployeeDashboard.jsx
│   ├── ManagerDashboard.jsx
│   ├── CopartSettings.jsx        # NEW
│   ├── CopartImporter.jsx        # NEW
│   ├── CopartWatchlist.jsx       # NEW
│   └── ... (90+ more pages)
│
├── components/                  # Reusable components
│   ├── ui/                     # Shadcn components
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── input.jsx
│   │   └── ... (20+ UI components)
│   ├── admin/
│   │   ├── SuperAdminQuickActions.jsx
│   │   └── UniversalSearchPanel.jsx
│   └── ... (other component folders)
│
├── Layout.jsx                   # Main layout wrapper
├── utils.js                     # Utility functions
└── api/
    └── base44Client.js          # Pre-initialized Base44 SDK

❌ NOT INCLUDED (Managed by Base44):
   - Backend server code
   - Database engine
   - Authentication API
   - File storage system
   - Integration APIs
   - Hosting infrastructure`}
          </pre>
        </Card>

        {/* TECH STACK */}
        <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Terminal className="w-6 h-6 text-purple-400" />
            Technology Stack
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-white mb-3">Frontend</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• React 18</li>
                <li>• React Router DOM</li>
                <li>• TailwindCSS</li>
                <li>• Shadcn/ui</li>
                <li>• Lucide React Icons</li>
                <li>• Framer Motion</li>
                <li>• React Query (TanStack)</li>
                <li>• date-fns</li>
                <li>• lodash</li>
                <li>• recharts</li>
                <li>• react-quill</li>
                <li>• @hello-pangea/dnd</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-3">Backend (Base44)</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• PostgreSQL Database</li>
                <li>• JWT Authentication</li>
                <li>• REST API</li>
                <li>• Supabase Storage</li>
                <li>• Auto-generated CRUD</li>
                <li>• Role-based Access</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-white mb-3">Integrations</h3>
              <ul className="text-gray-300 text-sm space-y-2">
                <li>• OpenAI LLM</li>
                <li>• Email Service</li>
                <li>• File Upload</li>
                <li>• Image Generation</li>
                <li>• Data Extraction AI</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* DOCUMENTATION LINKS */}
        <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-400" />
            Documentation & Guides
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Button
              onClick={() => window.location.href = '/TechnicalGuide'}
              className="bg-blue-600 hover:bg-blue-700 h-16 justify-start"
            >
              <Terminal className="w-5 h-5 mr-3" />
              <div className="text-left">
                <p className="font-bold">Technical Guide</p>
                <p className="text-xs opacity-80">Architecture, backend, frontend, deployment</p>
              </div>
            </Button>

            <Button
              onClick={() => window.location.href = '/PlatformNarrative'}
              className="bg-green-600 hover:bg-green-700 h-16 justify-start"
            >
              <FileText className="w-5 h-5 mr-3" />
              <div className="text-left">
                <p className="font-bold">Platform Narrative</p>
                <p className="text-xs opacity-80">Complete story of how STOCRX works</p>
              </div>
            </Button>

            <Button
              onClick={() => window.location.href = '/ShortcutsCheatSheet'}
              className="bg-purple-600 hover:bg-purple-700 h-16 justify-start"
            >
              <Package className="w-5 h-5 mr-3" />
              <div className="text-left">
                <p className="font-bold">Shortcuts & Cheat Sheet</p>
                <p className="text-xs opacity-80">Quick reference for developers</p>
              </div>
            </Button>

            <Button
              onClick={() => window.location.href = '/AppDocumentation'}
              className="bg-orange-600 hover:bg-orange-700 h-16 justify-start"
            >
              <FileText className="w-5 h-5 mr-3" />
              <div className="text-left">
                <p className="font-bold">Full API Documentation</p>
                <p className="text-xs opacity-80">Complete API reference</p>
              </div>
            </Button>
          </div>
        </Card>

        {/* MIGRATION PATH */}
        <Card className="p-8 bg-yellow-900/30 border-yellow-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <GitBranch className="w-6 h-6 text-yellow-400" />
            Migration Path (To Host Independently)
          </h2>

          <p className="text-yellow-200 mb-6">
            To migrate away from Base44 and host independently, you would need to:
          </p>

          <ol className="text-yellow-100 space-y-4">
            <li className="flex items-start gap-3">
              <Badge className="bg-yellow-600 mt-1">1</Badge>
              <div>
                <p className="font-bold">Export All Data</p>
                <p className="text-sm text-yellow-200">Export entity schemas and all database records as JSON/CSV</p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <Badge className="bg-yellow-600 mt-1">2</Badge>
              <div>
                <p className="font-bold">Set Up Backend</p>
                <p className="text-sm text-yellow-200">Create Node.js/Express or Python/Django backend with REST APIs</p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <Badge className="bg-yellow-600 mt-1">3</Badge>
              <div>
                <p className="font-bold">Database Setup</p>
                <p className="text-sm text-yellow-200">Set up PostgreSQL database and migrate all data</p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <Badge className="bg-yellow-600 mt-1">4</Badge>
              <div>
                <p className="font-bold">Authentication</p>
                <p className="text-sm text-yellow-200">Implement JWT authentication, OAuth, user management</p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <Badge className="bg-yellow-600 mt-1">5</Badge>
              <div>
                <p className="font-bold">File Storage</p>
                <p className="text-sm text-yellow-200">Set up AWS S3, Cloudinary, or similar for file uploads</p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <Badge className="bg-yellow-600 mt-1">6</Badge>
              <div>
                <p className="font-bold">Integrate Services</p>
                <p className="text-sm text-yellow-200">Connect OpenAI, SendGrid, payment processors, etc.</p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <Badge className="bg-yellow-600 mt-1">7</Badge>
              <div>
                <p className="font-bold">Rewrite API Calls</p>
                <p className="text-sm text-yellow-200">Replace all base44.* calls with your custom API endpoints</p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <Badge className="bg-yellow-600 mt-1">8</Badge>
              <div>
                <p className="font-bold">Deploy</p>
                <p className="text-sm text-yellow-200">Deploy frontend (Vercel/Netlify) and backend (Heroku/AWS) separately</p>
              </div>
            </li>
          </ol>

          <Card className="p-4 bg-red-900/30 border-red-700 mt-6">
            <p className="text-red-200">
              ⚠️ <strong>Estimated Effort:</strong> 200-400 hours of development work<br/>
              💰 <strong>Cost:</strong> $10,000 - $40,000 if outsourced
            </p>
          </Card>
        </Card>

        {/* EXPORT BUTTON */}
        <Card className="p-8 bg-gray-800 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Generate Export Documentation</h2>
          <p className="text-gray-300 mb-6">
            This will generate a comprehensive documentation package explaining your project structure, 
            code organization, and migration path. Note: Actual code files cannot be auto-downloaded from Base44.
          </p>

          <Button
            onClick={handleExport}
            disabled={exporting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-16 text-lg"
          >
            {exporting ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                Generating Documentation...
              </>
            ) : (
              <>
                <Download className="w-6 h-6 mr-3" />
                Generate Export Documentation
              </>
            )}
          </Button>

          <p className="text-sm text-gray-500 mt-4 text-center">
            For actual file exports, access the Base44 dashboard or contact Base44 support
          </p>
        </Card>
      </div>
    </div>
  );
}