import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft, Shield, Users, Lock, Key, CheckCircle, XCircle,
  Settings, Star, Award, Crown, Zap, Plus, Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

// All available pages in the system
const ALL_PAGES = [
  "Home", "BrowseCars", "CarDetails", "SubscriptionPlans", "Calculator",
  "HowItWorks", "MyAccount", "AccountApprovalStatus", "SupportLiveChat",
  "VehicleInspection", "CustomerReturns", "EmployeeDashboard", "MyShifts",
  "AIAssistantEmployee", "ManagerDashboard", "Settings", "PayrollDashboard",
  "FinancingManagement", "CallCenterDispatch", "JobManagement", "HireOrFire",
  "ThemeManager", "SystemTesting", "AccountRecovery", "SuperAdmin",
  "SuperAdminCars", "VehicleManagement", "PendingVehicleApprovals",
  "PendingUsers", "PendingUserApproval", "TaxManagement", "TaxRegions",
  "TaxRates", "ProductTaxCategories", "TaxReports", "Careers"
];

export default function AccessControl() {
  const [user, setUser] = useState(null);
  const [newCategory, setNewCategory] = useState({
    category_name: "",
    department: "support",
    access_level: "basic",
    allowed_pages: [],
    subscription_tier_access: ["free"],
    full_access: false
  });
  const navigate = useNavigate();
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

  const { data: categories } = useQuery({
    queryKey: ['employee-categories'],
    queryFn: () => base44.entities.EmployeeCategory.list("-created_date"),
    initialData: []
  });

  const createCategoryMutation = useMutation({
    mutationFn: (data) => base44.entities.EmployeeCategory.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['employee-categories']);
      alert("✅ Category created!");
      setNewCategory({
        category_name: "",
        department: "support",
        access_level: "basic",
        allowed_pages: [],
        subscription_tier_access: ["free"],
        full_access: false
      });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EmployeeCategory.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['employee-categories']);
      alert("✅ Category updated!");
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => base44.entities.EmployeeCategory.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['employee-categories']);
      alert("❌ Category deleted");
    }
  });

  const togglePageAccess = (categoryId, page) => {
    const category = categories.find(c => c.id === categoryId);
    const allowedPages = category.allowed_pages || [];
    const newPages = allowedPages.includes(page)
      ? allowedPages.filter(p => p !== page)
      : [...allowedPages, page];
    
    updateCategoryMutation.mutate({
      id: categoryId,
      data: { allowed_pages: newPages }
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
            <Shield className="w-10 h-10 text-yellow-400" />
            Access Control & Employee Categories
          </h1>
          <p className="text-gray-400">Manage roles, permissions, and page access</p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-blue-900 border-blue-700">
            <Users className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-blue-200 text-sm mb-1">Total Categories</p>
            <p className="text-4xl font-bold text-blue-400">{categories.length}</p>
          </Card>
          <Card className="p-6 bg-green-900 border-green-700">
            <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-green-200 text-sm mb-1">Full Access</p>
            <p className="text-4xl font-bold text-green-400">
              {categories.filter(c => c.full_access).length}
            </p>
          </Card>
          <Card className="p-6 bg-purple-900 border-purple-700">
            <Lock className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-purple-200 text-sm mb-1">Available Pages</p>
            <p className="text-4xl font-bold text-purple-400">{ALL_PAGES.length}</p>
          </Card>
          <Card className="p-6 bg-yellow-900 border-yellow-700">
            <Crown className="w-8 h-8 text-yellow-400 mb-2" />
            <p className="text-yellow-200 text-sm mb-1">Admin Roles</p>
            <p className="text-4xl font-bold text-yellow-400">
              {categories.filter(c => c.access_level === 'admin' || c.access_level === 'super_admin').length}
            </p>
          </Card>
        </div>

        {/* Create New Category */}
        <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Plus className="w-6 h-6 text-green-400" />
            Create New Category
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-gray-300 text-sm mb-2 block">Category Name</label>
              <Input
                value={newCategory.category_name}
                onChange={(e) => setNewCategory({...newCategory, category_name: e.target.value})}
                placeholder="e.g., Senior Manager"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-2 block">Department</label>
              <select
                value={newCategory.department}
                onChange={(e) => setNewCategory({...newCategory, department: e.target.value})}
                className="w-full p-2 rounded-lg bg-gray-700 border-gray-600 text-white"
              >
                <option value="incidents">Incidents</option>
                <option value="operations">Operations</option>
                <option value="fleet">Fleet</option>
                <option value="finance">Finance</option>
                <option value="support">Support</option>
                <option value="marketing">Marketing</option>
                <option value="technical">Technical</option>
                <option value="dispatch">Dispatch</option>
                <option value="hr">HR</option>
                <option value="sales">Sales</option>
                <option value="management">Management</option>
              </select>
            </div>

            <div>
              <label className="text-gray-300 text-sm mb-2 block">Access Level</label>
              <select
                value={newCategory.access_level}
                onChange={(e) => setNewCategory({...newCategory, access_level: e.target.value})}
                className="w-full p-2 rounded-lg bg-gray-700 border-gray-600 text-white"
              >
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="advanced">Advanced</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={newCategory.full_access}
                onCheckedChange={(checked) => setNewCategory({...newCategory, full_access: checked})}
              />
              <label className="text-white">Full Access (All Pages)</label>
            </div>
          </div>

          <div className="mt-6">
            <label className="text-gray-300 text-sm mb-2 block">Description</label>
            <Textarea
              value={newCategory.description}
              onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
              placeholder="Describe this role and its responsibilities..."
              className="bg-gray-700 border-gray-600 text-white h-24"
            />
          </div>

          <Button
            onClick={() => createCategoryMutation.mutate(newCategory)}
            disabled={!newCategory.category_name || createCategoryMutation.isLoading}
            className="mt-6 w-full bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Category
          </Button>
        </Card>

        {/* Existing Categories */}
        <div className="space-y-6">
          {categories.map((category) => (
            <Card key={category.id} className="p-6 bg-gray-800 border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-white">{category.category_name}</h3>
                    {category.full_access && (
                      <Badge className="bg-yellow-500 text-black">
                        🔓 FULL ACCESS
                      </Badge>
                    )}
                    <Badge className={
                      category.access_level === 'super_admin' ? 'bg-red-600' :
                      category.access_level === 'admin' ? 'bg-orange-600' :
                      category.access_level === 'manager' ? 'bg-purple-600' :
                      'bg-blue-600'
                    }>
                      {category.access_level}
                    </Badge>
                    <Badge className="bg-gray-600">
                      {category.department}
                    </Badge>
                  </div>
                  {category.description && (
                    <p className="text-gray-400 text-sm">{category.description}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (confirm(`Delete ${category.category_name}?`)) {
                      deleteCategoryMutation.mutate(category.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Page Access Grid */}
              <div className="mt-6">
                <p className="text-gray-300 font-semibold mb-3">Page Access ({category.allowed_pages?.length || 0}/{ALL_PAGES.length})</p>
                <div className="grid md:grid-cols-4 gap-2 max-h-96 overflow-y-auto">
                  {ALL_PAGES.map((page) => {
                    const hasAccess = category.full_access || category.allowed_pages?.includes(page);
                    return (
                      <Button
                        key={page}
                        size="sm"
                        variant={hasAccess ? "default" : "outline"}
                        onClick={() => !category.full_access && togglePageAccess(category.id, page)}
                        disabled={category.full_access}
                        className={hasAccess ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'}
                      >
                        {hasAccess ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                        {page}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}