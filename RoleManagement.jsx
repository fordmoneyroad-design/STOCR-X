import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Users, Plus, Eye, EyeOff, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

const ALL_DEPARTMENTS = [
  "incidents", "operations", "fleet", "finance", "support", "marketing",
  "technical", "dispatch", "hr", "sales", "management", "legal",
  "accounting", "inventory", "quality_assurance", "training",
  "security", "logistics", "customer_success"
];

const ALL_JOB_TITLES = [
  "ceo", "cfo", "coo", "cto", "vp_operations", "vp_sales", "vp_marketing",
  "senior_manager", "manager", "team_lead", "supervisor", "senior_specialist",
  "specialist", "coordinator", "analyst", "representative", "associate",
  "assistant", "intern", "contractor", "consultant", "advisor", "tester",
  "qa_engineer", "developer", "designer", "accountant", "bookkeeper",
  "payroll_specialist", "hr_manager", "recruiter", "trainer", "dispatcher",
  "fleet_manager", "mechanic", "driver", "warehouse_manager", "inventory_clerk",
  "customer_service_rep", "sales_rep", "marketing_specialist", "content_creator",
  "social_media_manager", "legal_counsel", "compliance_officer", "security_analyst",
  "data_analyst", "business_analyst", "project_manager", "product_manager"
];

const ALL_PERMISSIONS = [
  { key: "view_all_users", label: "View All Users" },
  { key: "view_own_data_only", label: "View Own Data Only" },
  { key: "edit_users", label: "Edit Users" },
  { key: "delete_users", label: "Delete Users" },
  { key: "view_all_vehicles", label: "View All Vehicles" },
  { key: "edit_vehicles", label: "Edit Vehicles" },
  { key: "approve_vehicles", label: "Approve Vehicles" },
  { key: "view_all_subscriptions", label: "View All Subscriptions" },
  { key: "edit_subscriptions", label: "Edit Subscriptions" },
  { key: "approve_subscriptions", label: "Approve Subscriptions" },
  { key: "view_all_payments", label: "View All Payments" },
  { key: "process_payments", label: "Process Payments" },
  { key: "refund_payments", label: "Refund Payments" },
  { key: "view_financial_reports", label: "View Financial Reports" },
  { key: "manage_payroll", label: "Manage Payroll" },
  { key: "view_employee_data", label: "View Employee Data" },
  { key: "manage_employees", label: "Manage Employees" },
  { key: "assign_roles", label: "Assign Roles" },
  { key: "view_schedules", label: "View Schedules" },
  { key: "manage_schedules", label: "Manage Schedules" },
  { key: "approve_schedules", label: "Approve Schedules" },
  { key: "view_time_tracking", label: "View Time Tracking" },
  { key: "edit_time_tracking", label: "Edit Time Tracking" },
  { key: "view_documents", label: "View Documents" },
  { key: "upload_documents", label: "Upload Documents" },
  { key: "delete_documents", label: "Delete Documents" },
  { key: "manage_inventory", label: "Manage Inventory" },
  { key: "view_analytics", label: "View Analytics" },
  { key: "manage_settings", label: "Manage Settings" },
  { key: "access_super_admin", label: "Access Super Admin" },
  { key: "bypass_restrictions", label: "Bypass All Restrictions" },
  { key: "view_activity_logs", label: "View Activity Logs" },
  { key: "manage_affiliates", label: "Manage Affiliates" },
  { key: "manage_partners", label: "Manage Partners" },
  { key: "view_customer_data", label: "View Customer Data" },
  { key: "contact_customers", label: "Contact Customers" },
  { key: "manage_dispatches", label: "Manage Dispatches" },
  { key: "create_job_postings", label: "Create Job Postings" },
  { key: "review_applications", label: "Review Applications" },
  { key: "manage_blog", label: "Manage Blog" },
  { key: "manage_themes", label: "Manage Themes" }
];

export default function RoleManagement() {
  const [user, setUser] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    role_name: "",
    department: "",
    job_title: "",
    access_level: "standard",
    hourly_rate: 0,
    salary: 0,
    permissions: {}
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

  const { data: roles } = useQuery({
    queryKey: ['employee-roles'],
    queryFn: () => base44.entities.EmployeeRole.list(),
    initialData: []
  });

  const createRoleMutation = useMutation({
    mutationFn: (data) => base44.entities.EmployeeRole.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['employee-roles']);
      setShowCreateForm(false);
      resetForm();
      alert("✅ Role created successfully!");
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EmployeeRole.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['employee-roles']);
      setEditingRole(null);
      resetForm();
      alert("✅ Role updated successfully!");
    }
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (id) => base44.entities.EmployeeRole.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['employee-roles']);
      alert("✅ Role deleted!");
    }
  });

  const resetForm = () => {
    setFormData({
      role_name: "",
      department: "",
      job_title: "",
      access_level: "standard",
      hourly_rate: 0,
      salary: 0,
      permissions: {}
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingRole) {
      updateRoleMutation.mutate({ id: editingRole.id, data: formData });
    } else {
      createRoleMutation.mutate(formData);
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      role_name: role.role_name,
      department: role.department,
      job_title: role.job_title,
      access_level: role.access_level,
      hourly_rate: role.hourly_rate || 0,
      salary: role.salary || 0,
      permissions: role.permissions || {}
    });
    setShowCreateForm(true);
  };

  const togglePermission = (permKey) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [permKey]: !formData.permissions[permKey]
      }
    });
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Shield className="w-10 h-10 text-yellow-400" />
              Role Management System
            </h1>
            <p className="text-gray-400">Complete control over employee roles and permissions</p>
          </div>
          <Button
            onClick={() => {
              setShowCreateForm(!showCreateForm);
              setEditingRole(null);
              resetForm();
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            {showCreateForm ? 'Cancel' : 'Create New Role'}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-blue-900 border-blue-700">
            <p className="text-blue-200 text-sm">Total Roles</p>
            <p className="text-4xl font-bold text-white">{roles?.length || 0}</p>
          </Card>
          <Card className="p-6 bg-green-900 border-green-700">
            <p className="text-green-200 text-sm">Departments</p>
            <p className="text-4xl font-bold text-white">{ALL_DEPARTMENTS.length}</p>
          </Card>
          <Card className="p-6 bg-purple-900 border-purple-700">
            <p className="text-purple-200 text-sm">Job Titles</p>
            <p className="text-4xl font-bold text-white">{ALL_JOB_TITLES.length}</p>
          </Card>
          <Card className="p-6 bg-orange-900 border-orange-700">
            <p className="text-orange-200 text-sm">Permissions</p>
            <p className="text-4xl font-bold text-white">{ALL_PERMISSIONS.length}</p>
          </Card>
        </div>

        {/* Create/Edit Form */}
        {showCreateForm && (
          <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-white font-semibold mb-2 block">Role Name *</label>
                  <Input
                    value={formData.role_name}
                    onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
                    required
                    placeholder="e.g., Senior Fleet Manager"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">Department *</label>
                  <Select value={formData.department} onValueChange={(val) => setFormData({ ...formData, department: val })}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_DEPARTMENTS.map(dept => (
                        <SelectItem key={dept} value={dept} className="capitalize">
                          {dept.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">Job Title *</label>
                  <Select value={formData.job_title} onValueChange={(val) => setFormData({ ...formData, job_title: val })}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select job title" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64 overflow-y-auto">
                      {ALL_JOB_TITLES.map(title => (
                        <SelectItem key={title} value={title} className="capitalize">
                          {title.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">Access Level *</label>
                  <Select value={formData.access_level} onValueChange={(val) => setFormData({ ...formData, access_level: val })}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select access level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="limited">Limited</SelectItem>
                      <SelectItem value="view_only">View Only</SelectItem>
                      <SelectItem value="tester">Tester (Own Data Only)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">Hourly Rate ($)</label>
                  <Input
                    type="number"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-white font-semibold mb-2 block">Annual Salary ($)</label>
                  <Input
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) })}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              {/* Permissions Grid */}
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Permissions Checklist</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {ALL_PERMISSIONS.map(perm => (
                    <div key={perm.key} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <label className="text-white text-sm flex-1 cursor-pointer">
                        {perm.label}
                      </label>
                      <Switch
                        checked={formData.permissions[perm.key] || false}
                        onCheckedChange={() => togglePermission(perm.key)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingRole ? 'Update Role' : 'Create Role'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingRole(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Existing Roles */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Existing Roles ({roles?.length || 0})</h2>
          
          <div className="space-y-4">
            {roles?.map(role => (
              <Card key={role.id} className="p-6 bg-gray-700 border-gray-600">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{role.role_name}</h3>
                    <div className="flex gap-2 mb-3">
                      <Badge className="bg-blue-600 capitalize">{role.department?.replace(/_/g, ' ')}</Badge>
                      <Badge className="bg-purple-600 capitalize">{role.job_title?.replace(/_/g, ' ')}</Badge>
                      <Badge className="bg-orange-600 capitalize">{role.access_level?.replace(/_/g, ' ')}</Badge>
                    </div>
                    {(role.hourly_rate > 0 || role.salary > 0) && (
                      <p className="text-gray-300 text-sm">
                        {role.hourly_rate > 0 && `$${role.hourly_rate}/hr`}
                        {role.hourly_rate > 0 && role.salary > 0 && ' • '}
                        {role.salary > 0 && `$${role.salary?.toLocaleString()}/year`}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEdit(role)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm(`Delete role "${role.role_name}"?`)) {
                          deleteRoleMutation.mutate(role.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Permission Checklist */}
                <div>
                  <h4 className="text-white font-semibold mb-3">Permissions:</h4>
                  <div className="grid md:grid-cols-4 gap-2">
                    {ALL_PERMISSIONS.map(perm => {
                      const hasPermission = role.permissions?.[perm.key];
                      return (
                        <div
                          key={perm.key}
                          className={`flex items-center gap-2 p-2 rounded text-sm ${
                            hasPermission ? 'bg-green-900/30 text-green-300' : 'bg-red-900/30 text-red-300'
                          }`}
                        >
                          {hasPermission ? (
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 flex-shrink-0" />
                          )}
                          <span className="text-xs">{perm.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}