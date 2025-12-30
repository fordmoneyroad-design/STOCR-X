import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TestTube, UserPlus, Eye, Clock, DollarSign } from "lucide-react";
import SuperAdminQuickActions from "../components/admin/SuperAdminQuickActions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function CreateTesterAccount() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    hourly_rate: "15.00",
    test_duration_days: "30"
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

  const { data: testers } = useQuery({
    queryKey: ['tester-accounts'],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list("-created_date");
      return allUsers.filter(u => u.is_tester === true);
    },
    initialData: []
  });

  const { data: testerActivity } = useQuery({
    queryKey: ['tester-activity'],
    queryFn: async () => {
      const logs = await base44.entities.ActivityLog.list("-created_date", 100);
      return logs.filter(log => {
        const testerEmails = testers.map(t => t.email);
        return testerEmails.includes(log.user_email);
      });
    },
    enabled: testers.length > 0,
    initialData: []
  });

  const createTesterMutation = useMutation({
    mutationFn: async (data) => {
      // Send invitation email with tester credentials
      await base44.integrations.Core.SendEmail({
        to: data.email,
        subject: "STOCRX Tester Account - Limited Access",
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">🧪 STOCRX Tester Account</h1>
            </div>
            <div style="padding: 30px; background: white;">
              <p>Dear ${data.full_name},</p>
              
              <p>You've been granted a <strong>Tester Account</strong> for STOCRX platform testing.</p>
              
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                <h3 style="color: #856404; margin-top: 0;">⚠️ LIMITED ACCESS ACCOUNT</h3>
                <ul style="color: #856404;">
                  <li>View-only access to public features</li>
                  <li>Cannot make purchases or payments</li>
                  <li>Cannot see admin-only data</li>
                  <li>Cannot access sensitive customer information</li>
                  <li>Session time is tracked</li>
                </ul>
              </div>

              <h3>Account Details</h3>
              <ul>
                <li><strong>Position:</strong> QA Tester</li>
                <li><strong>Hourly Rate:</strong> $${data.hourly_rate}/hour</li>
                <li><strong>Test Duration:</strong> ${data.test_duration_days} days</li>
                <li><strong>Account Type:</strong> Sample/Testing</li>
              </ul>

              <h3>What You Can Do:</h3>
              <ul>
                <li>✅ Browse vehicles</li>
                <li>✅ View subscription plans</li>
                <li>✅ Test navigation</li>
                <li>✅ Report bugs</li>
                <li>✅ Provide feedback</li>
              </ul>

              <h3>What You CANNOT Do:</h3>
              <ul>
                <li>❌ Make purchases</li>
                <li>❌ Process payments</li>
                <li>❌ Access customer data</li>
                <li>❌ View admin dashboards</li>
                <li>❌ Modify system settings</li>
              </ul>

              <p>Please click the link below to set up your account:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://stocrx.com" style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Access STOCRX Testing</a>
              </div>

              <p><strong>Important:</strong> Your account will automatically expire after ${data.test_duration_days} days.</p>

              <p>Best regards,<br/>STOCRX Testing Team</p>
            </div>
          </div>
        `
      });

      // Create activity log
      await base44.entities.ActivityLog.create({
        user_email: user.email,
        action_type: "create_tester",
        action_details: `Created tester account for ${data.full_name} (${data.email})`,
        related_entity_id: data.email,
        entity_type: "User"
      });

      return { success: true, message: "Tester invitation sent!" };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tester-accounts']);
      alert("✅ Tester account invitation sent!");
      setFormData({
        email: "",
        full_name: "",
        hourly_rate: "15.00",
        test_duration_days: "30"
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createTesterMutation.mutate(formData);
  };

  const calculateTimeOnSite = (email) => {
    const userLogs = testerActivity.filter(log => log.user_email === email);
    if (userLogs.length === 0) return "0 min";
    
    // Calculate total sessions (rough estimate based on activity gaps)
    let totalMinutes = 0;
    for (let i = 0; i < userLogs.length - 1; i++) {
      const current = new Date(userLogs[i].created_date);
      const next = new Date(userLogs[i + 1].created_date);
      const diff = Math.abs(current - next) / 1000 / 60; // minutes
      if (diff < 60) totalMinutes += diff; // Only count if less than 1 hour apart
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
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
            <TestTube className="w-10 h-10 text-purple-400" />
            Create Tester Account
          </h1>
          <p className="text-gray-400">Sample accounts for QA testing • Limited access • Payroll tracked</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-purple-900 border-purple-700">
            <TestTube className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-purple-200 text-sm mb-1">Active Testers</p>
            <p className="text-3xl font-bold text-purple-400">{testers.length}</p>
          </Card>
          <Card className="p-6 bg-blue-900 border-blue-700">
            <Clock className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-blue-200 text-sm mb-1">Total Sessions</p>
            <p className="text-3xl font-bold text-blue-400">{testerActivity.length}</p>
          </Card>
          <Card className="p-6 bg-green-900 border-green-700">
            <DollarSign className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-green-200 text-sm mb-1">Hourly Rate</p>
            <p className="text-3xl font-bold text-green-400">${formData.hourly_rate}/hr</p>
          </Card>
          <Card className="p-6 bg-orange-900 border-orange-700">
            <Eye className="w-8 h-8 text-orange-400 mb-2" />
            <p className="text-orange-200 text-sm mb-1">Test Duration</p>
            <p className="text-3xl font-bold text-orange-400">{formData.test_duration_days} days</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create Form */}
          <Card className="p-8 bg-gray-800 border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-green-400" />
              Create New Tester
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Email Address *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  placeholder="tester@example.com"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Full Name *</label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  required
                  placeholder="John Doe"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Hourly Rate ($) *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                  required
                  placeholder="15.00"
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <p className="text-xs text-gray-500 mt-1">Standard QA tester rate: $15-20/hour</p>
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Test Duration (Days) *</label>
                <Input
                  type="number"
                  value={formData.test_duration_days}
                  onChange={(e) => setFormData({...formData, test_duration_days: e.target.value})}
                  required
                  placeholder="30"
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <p className="text-xs text-gray-500 mt-1">Account will auto-expire after this period</p>
              </div>

              <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
                <h3 className="font-bold text-yellow-400 mb-2">⚠️ Tester Restrictions</h3>
                <ul className="text-sm text-yellow-200 space-y-1">
                  <li>• View-only access (no purchases)</li>
                  <li>• Cannot see customer personal data</li>
                  <li>• Cannot access admin dashboards</li>
                  <li>• Cannot process payments</li>
                  <li>• Session time tracked for payroll</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={createTesterMutation.isLoading}
                className="w-full h-12 bg-purple-600 hover:bg-purple-700"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                {createTesterMutation.isLoading ? "Sending Invitation..." : "Create Tester Account"}
              </Button>
            </form>
          </Card>

          {/* Access Examples */}
          <Card className="p-8 bg-gray-800 border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Access Examples</h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-green-400 mb-3 flex items-center gap-2">
                  ✅ What Testers CAN Access
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Browse Cars page (public vehicles)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    View subscription plans
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Calculator & How It Works
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Test navigation & UI
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Sample vehicle details
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-red-400 mb-3 flex items-center gap-2">
                  ❌ What Testers CANNOT Access
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    Customer personal information
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    Payment processing pages
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    Admin dashboards
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    Super Admin panel
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    KYC documents & sensitive data
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    Financial reports
                  </li>
                </ul>
              </div>

              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                <h3 className="font-bold text-blue-400 mb-2">📊 Tracking & Payroll</h3>
                <ul className="text-sm text-blue-200 space-y-1">
                  <li>• Login/logout times recorded</li>
                  <li>• Page views tracked</li>
                  <li>• Session duration calculated</li>
                  <li>• Payable hours = time on site</li>
                  <li>• Weekly payroll reports</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Active Testers */}
        <Card className="p-6 bg-gray-800 border-gray-700 mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Active Tester Accounts</h2>
          
          {testers.length === 0 ? (
            <div className="text-center py-12">
              <TestTube className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">No tester accounts created yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Tester</TableHead>
                  <TableHead className="text-gray-300">Email</TableHead>
                  <TableHead className="text-gray-300">Time on Site</TableHead>
                  <TableHead className="text-gray-300">Total Actions</TableHead>
                  <TableHead className="text-gray-300">Hourly Rate</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testers.map((tester) => {
                  const actions = testerActivity.filter(log => log.user_email === tester.email).length;
                  const timeOnSite = calculateTimeOnSite(tester.email);
                  
                  return (
                    <TableRow key={tester.id} className="border-gray-700">
                      <TableCell className="text-white font-semibold">{tester.full_name}</TableCell>
                      <TableCell className="text-gray-400 text-sm">{tester.email}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-600">{timeOnSite}</Badge>
                      </TableCell>
                      <TableCell className="text-white">{actions}</TableCell>
                      <TableCell className="text-green-400">${tester.hourly_rate || '15.00'}/hr</TableCell>
                      <TableCell>
                        <Badge className="bg-green-600">Active</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>

        <SuperAdminQuickActions />
      </div>
    </div>
  );
}