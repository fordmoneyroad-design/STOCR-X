import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertTriangle } from "lucide-react";

export default function TesterRestrictionGuard({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (err) {
        // Not authenticated
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Allow full access if:
  // 1. Super admin
  // 2. Regular admin
  // 3. Not a tester
  if (
    user?.email === "fordmoneyroad@gmail.com" ||
    user?.role === 'admin' ||
    user?.role !== 'tester'
  ) {
    return <>{children}</>;
  }

  // Tester restriction - show warning
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Alert className="bg-orange-900/30 border-orange-700 p-8">
          <AlertTriangle className="h-8 w-8 text-orange-400" />
          <AlertDescription className="text-orange-200 text-lg mt-4">
            <h2 className="text-2xl font-bold text-white mb-4">🧪 Tester Account Restriction</h2>
            <p className="mb-4">
              You are logged in as a <strong>Tester</strong> account. This role has restricted access
              and can only view your own data.
            </p>
            <div className="bg-orange-950/50 p-4 rounded-lg mb-4">
              <h3 className="font-bold text-white mb-2">Tester Account Permissions:</h3>
              <ul className="space-y-2 text-sm">
                <li>✅ View your own profile</li>
                <li>✅ Access your own subscriptions</li>
                <li>✅ View your own payments</li>
                <li>✅ Upload your own documents</li>
                <li>✅ Browse public vehicle listings</li>
                <li>❌ Cannot view other users' data</li>
                <li>❌ Cannot access admin panels</li>
                <li>❌ Cannot view system-wide information</li>
                <li>❌ Cannot modify global settings</li>
              </ul>
            </div>
            <p className="text-sm">
              This page contains system-wide data that is not available to tester accounts.
              If you believe you should have access, please contact an administrator.
            </p>
          </AlertDescription>
        </Alert>

        <div className="mt-8 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">
            Logged in as: <strong className="text-white">{user?.email}</strong>
          </p>
          <p className="text-gray-500 text-sm mt-2">Role: Tester (Restricted Access)</p>
        </div>
      </div>
    </div>
  );
}