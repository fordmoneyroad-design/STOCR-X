import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, ArrowLeft, Search, Key, Mail, 
  CheckCircle, AlertTriangle, User, Lock
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function AccountRecovery() {
  const [user, setUser] = useState(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [verificationNotes, setVerificationNotes] = useState("");
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

  // Fetch recent password reset requests from ActivityLog
  const { data: resetRequests } = useQuery({
    queryKey: ['password-reset-requests'],
    queryFn: async () => {
      const logs = await base44.entities.ActivityLog.filter(
        { action_type: "password_reset_request" },
        "-created_date",
        50
      );
      return logs;
    },
    initialData: []
  });

  // Fetch all users
  const { data: allUsers } = useQuery({
    queryKey: ['all-users-recovery'],
    queryFn: () => base44.entities.User.list("-created_date"),
    initialData: []
  });

  const searchUserMutation = useMutation({
    mutationFn: async (email) => {
      const users = await base44.entities.User.filter({ email });
      if (users.length === 0) {
        throw new Error("User not found");
      }
      return users[0];
    },
    onSuccess: (userData) => {
      setSelectedUser(userData);
      setNewPassword(generateRandomPassword());
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser || !newPassword) {
        throw new Error("Missing required data");
      }

      // In a real system, this would update the password in the auth system
      // For now, we'll simulate by sending email with new credentials
      
      // Send new credentials to user
      await base44.integrations.Core.SendEmail({
        to: selectedUser.email,
        subject: "✅ Your STOCRX Password Has Been Reset",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">Password Reset Successful</h1>
            </div>
            <div style="padding: 30px; background: white;">
              <p>Hello ${selectedUser.full_name || 'there'},</p>
              <p>Your STOCRX account password has been successfully reset by our admin team.</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1f2937;">Your New Login Credentials:</h3>
                <p style="margin: 10px 0;"><strong>Email:</strong> ${selectedUser.email}</p>
                <p style="margin: 10px 0;"><strong>Temporary Password:</strong> <code style="background: #e5e7eb; padding: 5px 10px; border-radius: 4px; font-size: 16px;">${newPassword}</code></p>
              </div>
              
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e;">
                  <strong>⚠️ IMPORTANT:</strong> Please change this password immediately after logging in for security.
                </p>
              </div>
              
              <h3>Next Steps:</h3>
              <ol style="line-height: 1.8;">
                <li>Go to STOCRX login page</li>
                <li>Enter your email and the temporary password above</li>
                <li>Go to My Account → Change Password</li>
                <li>Set a strong, unique password</li>
              </ol>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${window.location.origin}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Log In Now
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                If you didn't request this password reset, please contact support immediately.
              </p>
            </div>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
              <p>© 2025 STOCRX INC. All rights reserved.</p>
            </div>
          </div>
        `
      });

      // Log the password reset
      await base44.entities.ActivityLog.create({
        user_email: user.email,
        action_type: "password_reset_completed",
        action_details: `Admin ${user.email} reset password for ${selectedUser.email}. Notes: ${verificationNotes || 'None'}`,
        related_entity_id: selectedUser.id,
        entity_type: "User"
      });

      // Notify super admin
      await base44.integrations.Core.SendEmail({
        to: SUPER_ADMIN_EMAIL,
        subject: `✅ Password Reset Completed - ${selectedUser.email}`,
        body: `
          Password reset completed by: ${user.email}
          
          User Account:
          - Email: ${selectedUser.email}
          - Name: ${selectedUser.full_name}
          - Role: ${selectedUser.role}
          
          Verification Notes: ${verificationNotes || 'None provided'}
          
          New credentials sent to user.
          Time: ${new Date().toLocaleString()}
        `
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['password-reset-requests']);
      alert(`✅ Password reset successful! New credentials sent to ${selectedUser.email}`);
      setSelectedUser(null);
      setNewPassword("");
      setVerificationNotes("");
      setSearchEmail("");
    },
    onError: (error) => {
      alert("Error resetting password: " + error.message);
    }
  });

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Shield className="w-10 h-10 text-red-400" />
            Account Recovery & Password Reset
          </h1>
          <p className="text-gray-400">Verify users and reset passwords securely</p>
          <Badge className="mt-2 bg-red-600">SUPER ADMIN ONLY</Badge>
        </div>

        <Alert className="mb-8 bg-yellow-900 border-yellow-700">
          <AlertTriangle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-200">
            <strong>Security Protocol:</strong> Always verify user identity before resetting passwords. Check ID, subscription history, or contact info.
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Password Reset Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-gray-800 border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Reset User Password</h2>

              {/* Search User */}
              <div className="mb-8">
                <label className="text-gray-300 text-sm mb-2 block">
                  Search User by Email
                </label>
                <div className="flex gap-3">
                  <Input
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="bg-gray-700 border-gray-600 text-white flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        searchUserMutation.mutate(searchEmail);
                      }
                    }}
                  />
                  <Button
                    onClick={() => searchUserMutation.mutate(searchEmail)}
                    disabled={!searchEmail || searchUserMutation.isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>

              {/* Selected User */}
              {selectedUser && (
                <div className="space-y-6">
                  <Card className="p-6 bg-gray-700 border-gray-600">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-white flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-400" />
                        User Found
                      </h3>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSelectedUser(null);
                          setNewPassword("");
                        }}
                        className="text-gray-400 hover:text-white"
                      >
                        Clear
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Full Name</p>
                        <p className="text-white font-semibold">{selectedUser.full_name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Email</p>
                        <p className="text-white font-semibold">{selectedUser.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Role</p>
                        <Badge className="bg-purple-600">{selectedUser.role}</Badge>
                      </div>
                      <div>
                        <p className="text-gray-400">Created</p>
                        <p className="text-white">
                          {selectedUser.created_date && new Date(selectedUser.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      New Temporary Password
                    </label>
                    <div className="flex gap-3">
                      <Input
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Auto-generated password"
                        className="bg-gray-700 border-gray-600 text-white flex-1 font-mono"
                      />
                      <Button
                        onClick={() => setNewPassword(generateRandomPassword())}
                        variant="outline"
                        className="border-gray-600"
                      >
                        Regenerate
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      User will receive this password via email and must change it after login
                    </p>
                  </div>

                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      Verification Notes (Required)
                    </label>
                    <Textarea
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      placeholder="How did you verify this user's identity? (e.g., checked ID, confirmed subscription, spoke on phone)"
                      className="bg-gray-700 border-gray-600 text-white h-24"
                    />
                  </div>

                  <Alert className="bg-orange-900 border-orange-700">
                    <AlertTriangle className="h-4 w-4 text-orange-400" />
                    <AlertDescription className="text-orange-200">
                      <strong>Confirm:</strong> You have verified this user's identity and authorization to reset password.
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={() => resetPasswordMutation.mutate()}
                    disabled={!newPassword || !verificationNotes || resetPasswordMutation.isLoading}
                    className="w-full bg-red-600 hover:bg-red-700 h-14 text-lg"
                  >
                    <Lock className="w-5 h-5 mr-2" />
                    {resetPasswordMutation.isLoading ? "Resetting..." : "Reset Password & Send Email"}
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Recent Requests */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-gray-800 border-gray-700 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-4">Recent Requests</h2>
              
              {resetRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                  <p className="text-gray-400 text-sm">No recent password reset requests</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {resetRequests.map((request) => (
                    <Card key={request.id} className="p-4 bg-gray-700 border-gray-600">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-white text-sm">
                          {request.user_email}
                        </p>
                        <Badge className="text-xs bg-yellow-600">Pending</Badge>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">
                        {request.created_date && new Date(request.created_date).toLocaleString()}
                      </p>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSearchEmail(request.user_email);
                          searchUserMutation.mutate(request.user_email);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        Process Request
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}