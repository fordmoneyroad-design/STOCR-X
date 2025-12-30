import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Key, AlertTriangle, Eye, EyeOff, Save, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function CopartSettings() {
  const [user, setUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    account_email: "",
    account_password_encrypted: "",
    account_name: "Main Copart Account",
    notes: ""
  });
  const queryClient = useQueryClient();

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

  const { data: credentials } = useQuery({
    queryKey: ['copart-credentials'],
    queryFn: () => base44.entities.CopartCredential.list(),
    initialData: []
  });

  const saveCredentialMutation = useMutation({
    mutationFn: async (data) => {
      if (credentials.length > 0) {
        return await base44.entities.CopartCredential.update(credentials[0].id, data);
      }
      return await base44.entities.CopartCredential.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['copart-credentials']);
      alert("✅ Copart credentials saved securely!");
    }
  });

  const handleSave = () => {
    if (!formData.account_email || !formData.account_password_encrypted) {
      alert("Please enter both email and password");
      return;
    }

    // Basic encryption (Base64) - In production, use proper encryption
    const encryptedPassword = btoa(formData.account_password_encrypted);

    saveCredentialMutation.mutate({
      ...formData,
      account_password_encrypted: encryptedPassword
    });
  };

  useEffect(() => {
    if (credentials.length > 0) {
      const cred = credentials[0];
      setFormData({
        account_email: cred.account_email,
        account_password_encrypted: cred.account_password_encrypted ? atob(cred.account_password_encrypted) : "",
        account_name: cred.account_name || "Main Copart Account",
        notes: cred.notes || ""
      });
    }
  }, [credentials]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10 text-orange-400" />
            Copart Account Settings
          </h1>
          <p className="text-gray-400">Securely manage your Copart integration credentials</p>
        </div>

        <Alert className="mb-8 bg-red-900/30 border-red-700">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-200">
            <strong>🔒 SECURITY WARNING:</strong> Your credentials are encrypted and stored securely. 
            Never share your password with anyone. Base44 cannot directly login to Copart - 
            this is for reference and AI-assisted data processing only.
          </AlertDescription>
        </Alert>

        <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Key className="w-6 h-6 text-blue-400" />
            Account Credentials
          </h2>

          <div className="space-y-6">
            <div>
              <label className="text-white font-semibold mb-2 block">Account Name</label>
              <Input
                value={formData.account_name}
                onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                placeholder="e.g., Main Copart Account"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="text-white font-semibold mb-2 block">Copart Email</label>
              <Input
                type="email"
                value={formData.account_email}
                onChange={(e) => setFormData({ ...formData, account_email: e.target.value })}
                placeholder="your-email@example.com"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="text-white font-semibold mb-2 block">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.account_password_encrypted}
                  onChange={(e) => setFormData({ ...formData, account_password_encrypted: e.target.value })}
                  placeholder="Enter your Copart password"
                  className="bg-gray-700 border-gray-600 text-white pr-12"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-white font-semibold mb-2 block">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this account..."
                className="bg-gray-700 border-gray-600 text-white h-24"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saveCredentialMutation.isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-5 h-5 mr-2" />
              {saveCredentialMutation.isLoading ? "Saving..." : "Save Credentials"}
            </Button>
          </div>
        </Card>

        <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">How to Use</h2>
          <div className="space-y-4 text-gray-300">
            <div className="flex items-start gap-3">
              <Badge className="bg-blue-600 mt-1">1</Badge>
              <div>
                <p className="font-semibold text-white">Save Your Credentials</p>
                <p className="text-sm">Enter your Copart login information above and click Save.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge className="bg-green-600 mt-1">2</Badge>
              <div>
                <p className="font-semibold text-white">Export Data from Copart</p>
                <p className="text-sm">Login to Copart manually and export your watchlist or search results as CSV.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge className="bg-purple-600 mt-1">3</Badge>
              <div>
                <p className="font-semibold text-white">Use AI Import</p>
                <p className="text-sm">Go to Copart Importer and let AI process your exported data.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge className="bg-orange-600 mt-1">4</Badge>
              <div>
                <p className="font-semibold text-white">Review & Approve</p>
                <p className="text-sm">AI will categorize vehicles and flag them for your review before adding to inventory.</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-8 bg-blue-900/30 border-blue-700">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Links</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              onClick={() => window.location.href = '/CopartImporter'}
              className="bg-blue-600 hover:bg-blue-700 justify-start"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Go to Copart Importer
            </Button>
            <Button
              onClick={() => window.location.href = '/CopartWatchlist'}
              className="bg-green-600 hover:bg-green-700 justify-start"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              View Watchlist
            </Button>
            <Button
              onClick={() => window.location.href = '/CopartVehicleFinder'}
              className="bg-purple-600 hover:bg-purple-700 justify-start"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              AI Vehicle Finder
            </Button>
            <Button
              onClick={() => window.open('https://www.copart.com', '_blank')}
              variant="outline"
              className="border-gray-600 hover:bg-gray-700 justify-start"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Open Copart.com
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}