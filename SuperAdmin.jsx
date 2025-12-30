
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Shield, Users, Activity, FileText, Eye, UserPlus,
  Database, TrendingUp, AlertTriangle, Download, Search,
  Car, CheckCircle, DollarSign, Clock, Package, UserCheck, Bell
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import SuperAdminQuickActions from "../components/admin/SuperAdminQuickActions";
import TesterRestrictionGuard from "../components/TesterRestrictionGuard";
import UniversalSearchPanel from "../components/admin/UniversalSearchPanel";
import NotificationCenter from "../components/admin/NotificationCenter";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function SuperAdmin() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [assigningRole, setAssigningRole] = useState(null); // Added state
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Added queryClient

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.email === SUPER_ADMIN_EMAIL) {
          setUser(currentUser);
          const urlParams = new URLSearchParams(window.location.search);
          const tab = urlParams.get('tab');
          if (tab) {
            setActiveTab(tab);
          }
          return;
        }
        if (currentUser.role !== 'admin') {
          window.location.href = '/';
          return;
        }
        setUser(currentUser);
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab');
        if (tab) {
          setActiveTab(tab);
        }
      } catch (err) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  const { data: allUsers } = useQuery({
    queryKey: ['super-admin-users'],
    queryFn: () => base44.entities.User.list("-created_date"),
    initialData: []
  });

  const { data: allSubscriptions } = useQuery({
    queryKey: ['super-admin-subscriptions'],
    queryFn: () => base44.entities.Subscription.list("-created_date"),
    initialData: []
  });

  const { data: allPayments } = useQuery({
    queryKey: ['super-admin-payments'],
    queryFn: () => base44.entities.Payment.list("-created_date"),
    initialData: []
  });

  const { data: allDocuments } = useQuery({
    queryKey: ['super-admin-documents'],
    queryFn: () => base44.entities.Document.list("-created_date"),
    initialData: []
  });

  const { data: activityLogs } = useQuery({
    queryKey: ['super-admin-activity'],
    queryFn: () => base44.entities.ActivityLog.list("-created_date", 100),
    initialData: []
  });

  const { data: vehicles } = useQuery({
    queryKey: ['super-admin-vehicles'],
    queryFn: () => base44.entities.Vehicle.list("-created_date"),
    initialData: []
  });

  const { data: pendingVehicles } = useQuery({
    queryKey: ['pending-vehicles-count'],
    queryFn: () => base44.entities.Vehicle.filter({ status: "pending_approval" }),
    initialData: []
  });

  const { data: pendingKYC } = useQuery({
    queryKey: ['pending-kyc-count'],
    queryFn: () => base44.entities.Subscription.filter({ kyc_verified: false, status: "pending" }),
    initialData: []
  });

  // NEW: Assign employee role mutation
  const assignEmployeeRoleMutation = useMutation({
    mutationFn: async ({ userId, department, jobTitle }) => {
      // If department is null/empty, set role back to 'user' and clear department/jobTitle
      const updatedRole = department ? 'employee' : 'user';
      return await base44.entities.User.update(userId, {
        department: department,
        job_title: jobTitle,
        role: updatedRole
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['super-admin-users']);
      setAssigningRole(null); // Not strictly needed as per current usage, but good practice
      alert("✅ Employee role assigned successfully!");
    },
    onError: (error) => {
      setAssigningRole(null);
      alert(`❌ Failed to assign employee role: ${error.message}`);
    }
  });

  const handleQuickEmployeeAssignment = (userEmail, userId) => {
    const validDepartments = ['incidents', 'operations', 'fleet', 'finance', 'support', 'marketing', 'technical', 'dispatch', 'hr', 'sales', 'management'];
    
    const dept = prompt(
      `Assign ${userEmail} to department:\n\n` +
      `Choose: ${validDepartments.join(', ')}\n\n` +
      `Or leave blank to remove employee status`
    );
    
    if (dept === null) return; // Cancelled
    
    let departmentToAssign = null;
    let jobTitleToAssign = null;

    if (dept && dept.trim() !== '') {
      const lowerCaseDept = dept.trim().toLowerCase();
      if (!validDepartments.includes(lowerCaseDept)) {
        alert("Invalid department. Please choose from the list.");
        return;
      }
      departmentToAssign = lowerCaseDept;
      
      const jobTitle = prompt(`Job title for ${userEmail}:`, "Employee");
      if (jobTitle === null) return; // Cancelled
      jobTitleToAssign = jobTitle.trim() || 'Employee';
    }
    
    assignEmployeeRoleMutation.mutate({
      userId,
      department: departmentToAssign,
      jobTitle: jobTitleToAssign
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalRevenue = allPayments?.reduce((sum, p) => sum + (p.status === 'completed' ? p.amount : 0), 0) || 0;
  const activeUsers = allUsers?.filter(u => u.role !== 'admin').length || 0;
  const pendingApprovals = allSubscriptions?.filter(s => !s.admin_approved).length || 0;
  const totalDocuments = allDocuments?.length || 0;

  return (
    <TesterRestrictionGuard>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-10 h-10 text-yellow-400" />
                <h1 className="text-4xl font-bold text-white">
                  Super Admin Control Center
                </h1>
              </div>
              <p className="text-gray-400">Master oversight • {user?.email}</p>
              {user?.email === SUPER_ADMIN_EMAIL && (
                <Badge className="bg-red-600 text-white mt-2">
                  🔓 FULL BYPASS ACCESS - Testing Mode
                </Badge>
              )}
            </div>
            <div className="flex gap-3">
              <NotificationCenter 
                pendingVehicles={pendingVehicles.length}
                pendingKYC={pendingKYC.length}
                pendingApprovals={pendingApprovals}
              />
              <Button
                onClick={() => navigate(createPageUrl("PendingVehicleApprovals"))}
                className="bg-orange-600 hover:bg-orange-700 h-16 px-6"
              >
                <Car className="w-6 h-6 mr-2" />
                <div className="text-left">
                  <p className="font-bold text-lg">{pendingVehicles.length}</p>
                  <p className="text-xs">Car Approvals</p>
                </div>
              </Button>
              <Button
                onClick={() => navigate(createPageUrl("AccountApprovalStatus"))}
                className="bg-blue-600 hover:bg-blue-700 h-16 px-6"
              >
                <UserCheck className="w-6 h-6 mr-2" />
                <div className="text-left">
                  <p className="font-bold text-lg">{pendingKYC.length}</p>
                  <p className="text-xs">Account Approvals</p>
                </div>
              </Button>
              <Badge className="bg-yellow-500 text-black text-lg px-4 py-2">
                FULL ACCESS UNLOCKED
              </Badge>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* LEFT SIDEBAR - UNIVERSAL SEARCH */}
            <div className="lg:col-span-1">
              <UniversalSearchPanel 
                users={allUsers}
                vehicles={vehicles}
                subscriptions={allSubscriptions}
                payments={allPayments}
                documents={allDocuments}
                activityLogs={activityLogs}
              />
            </div>

            {/* MAIN CONTENT */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-6 mb-8 bg-gray-800">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                  <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                  <TabsTrigger value="roles">Role Management</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  {/* Stats Grid - ALL CLICKABLE */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card 
                      onClick={() => navigate(createPageUrl("SuperAdmin") + "?tab=subscriptions")}
                      className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 border-none text-white hover:scale-105 transition-transform cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <Database className="w-8 h-8" />
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <p className="text-blue-200 text-sm mb-1">Total Revenue</p>
                      <p className="text-3xl font-bold">${totalRevenue.toLocaleString()}</p>
                      <p className="text-xs text-blue-200 mt-2">Click to view details →</p>
                    </Card>

                    <Card 
                      onClick={() => navigate(createPageUrl("SuperAdmin") + "?tab=users")}
                      className="p-6 bg-gradient-to-br from-green-600 to-green-700 border-none text-white hover:scale-105 transition-transform cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <Users className="w-8 h-8" />
                      </div>
                      <p className="text-green-200 text-sm mb-1">Active Users</p>
                      <p className="text-3xl font-bold">{activeUsers}</p>
                      <p className="text-xs text-green-200 mt-2">Click to manage →</p>
                    </Card>

                    <Card 
                      onClick={() => navigate(createPageUrl("PendingApprovals"))}
                      className="p-6 bg-gradient-to-br from-yellow-600 to-yellow-700 border-none text-white hover:scale-105 transition-transform cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <AlertTriangle className="w-8 h-8" />
                      </div>
                      <p className="text-yellow-200 text-sm mb-1">Pending Approvals</p>
                      <p className="text-3xl font-bold">{pendingApprovals}</p>
                      <p className="text-xs text-yellow-200 mt-2">Click to review →</p>
                    </Card>

                    <Card 
                      onClick={() => navigate(createPageUrl("SuperAdmin") + "?tab=documents")}
                      className="p-6 bg-gradient-to-br from-purple-600 to-purple-700 border-none text-white hover:scale-105 transition-transform cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <FileText className="w-8 h-8" />
                      </div>
                      <p className="text-purple-200 text-sm mb-1">Total Documents</p>
                      <p className="text-3xl font-bold">{totalDocuments}</p>
                      <p className="text-xs text-purple-200 mt-2">Click to access →</p>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <Card className="p-6 bg-gray-800 border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Activity className="w-6 h-6 text-green-400" />
                      Live Activity Feed
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {activityLogs?.slice(0, 20).map((log) => (
                        <button
                          key={log.id}
                          onClick={() => {
                            if (log?.related_entity_id && log?.entity_type) {
                              if (log.entity_type === 'User') {
                                navigate(createPageUrl("UserProfile") + `?email=${log?.user_email}`);
                              } else if (log.entity_type === 'Vehicle') {
                                navigate(createPageUrl("CarDetails") + `?id=${log?.related_entity_id}`);
                              } else if (log.entity_type === 'Subscription') {
                                navigate(createPageUrl("SubscriptionProfile") + `?id=${log?.related_entity_id}`);
                              }
                            }
                          }}
                          className="w-full flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer text-left"
                        >
                          <div>
                            <p className="font-semibold text-white">{log.user_email}</p>
                            <p className="text-sm text-gray-400">{log.action_type} • {log.action_details}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {log.created_date && new Date(log.created_date).toLocaleString()}
                          </span>
                        </button>
                      ))}
                    </div>
                  </Card>
                </TabsContent>

                {/* Users Tab - ENHANCED */}
                <TabsContent value="users">
                  <Card className="p-6 bg-gray-800 border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-400" />
                        User Management
                      </h2>
                      <Button
                        onClick={() => navigate(createPageUrl("CreateEmployee"))}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create Employee
                      </Button>
                    </div>

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-gray-700">
                            <TableHead className="text-gray-300">User</TableHead>
                            <TableHead className="text-gray-300">Role</TableHead>
                            <TableHead className="text-gray-300">Department</TableHead> {/* New TableHead */}
                            <TableHead className="text-gray-300">Tier</TableHead>
                            <TableHead className="text-gray-300">Joined</TableHead>
                            <TableHead className="text-gray-300">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allUsers?.map((u) => (
                            <TableRow key={u.id} className="border-gray-700">
                              <TableCell className="text-white">
                                <div>
                                  <p className="font-semibold">{u?.full_name || u?.email || 'User'}</p>
                                  <p className="text-sm text-gray-400">{u?.email}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={u?.role === 'admin' ? 'bg-red-500' : u?.department ? 'bg-green-500' : 'bg-blue-500'}>
                                  {u?.role === 'admin' ? 'Admin' : u?.department ? 'Employee' : 'Customer'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {u?.department ? (
                                  <Badge className="bg-purple-600 capitalize">{u.department}</Badge>
                                ) : (
                                  <span className="text-gray-500 text-sm">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-purple-600">{u?.subscription_tier || 'free'}</Badge>
                              </TableCell>
                              <TableCell className="text-gray-400 text-sm">
                                {u?.created_date && new Date(u.created_date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => navigate(createPageUrl("UserProfile") + `?email=${u?.email}`)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View
                                  </Button>
                                  {!u?.department && u?.role !== 'admin' && ( // "Make Employee" if not employee or admin
                                    <Button
                                      size="sm"
                                      onClick={() => handleQuickEmployeeAssignment(u?.email, u.id)}
                                      disabled={assignEmployeeRoleMutation.isLoading}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <UserPlus className="w-4 h-4 mr-2" />
                                      Make Employee
                                    </Button>
                                  )}
                                  {u?.department && ( // "Edit Role" if already an employee
                                    <Button
                                      size="sm"
                                      onClick={() => handleQuickEmployeeAssignment(u?.email, u.id)}
                                      disabled={assignEmployeeRoleMutation.isLoading}
                                      className="bg-orange-600 hover:bg-orange-700"
                                    >
                                      Edit Role
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                </TabsContent>

                {/* Keep other existing tabs */}
                <TabsContent value="activity">
                  <Card className="p-6 bg-gray-800 border-gray-700">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Activity className="w-6 h-6 text-green-400" />
                      Complete Activity Log
                    </h2>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {activityLogs?.map((log) => (
                        <div key={log.id} className="p-4 bg-gray-700 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Badge className="bg-blue-600">{log.action_type}</Badge>
                                <span className="font-semibold text-white">{log.user_email}</span>
                              </div>
                              <p className="text-gray-300 mb-2">{log.action_details}</p>
                              <div className="text-xs text-gray-500 space-y-1">
                                <p>IP: {log.ip_address || 'N/A'}</p>
                                <p>Time: {log.created_date && new Date(log.created_date).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="documents">
                  {/* Existing documents content */}
                </TabsContent>

                <TabsContent value="subscriptions">
                  {/* Existing subscriptions content */}
                </TabsContent>

                <TabsContent value="roles">
                  {/* Existing roles content */}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <SuperAdminQuickActions />
        </div>
      </div>
    </TesterRestrictionGuard>
  );
}
