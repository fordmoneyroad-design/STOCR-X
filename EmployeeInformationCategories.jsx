import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users, Search, Briefcase, Shield, DollarSign,
  TrendingUp, Clock, Star, ArrowLeft, Filter,
  UserCheck, AlertTriangle, Calendar, Mail
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function EmployeeInformationCategories() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const navigate = useNavigate();

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

  const { data: allEmployees } = useQuery({
    queryKey: ['all-employees'],
    queryFn: () => base44.entities.User.filter({ department: { $exists: true } }),
    initialData: []
  });

  const { data: employeeCategories } = useQuery({
    queryKey: ['employee-categories'],
    queryFn: () => base44.entities.EmployeeCategory.list(),
    initialData: []
  });

  const { data: affiliates } = useQuery({
    queryKey: ['affiliates-list'],
    queryFn: () => base44.entities.AffiliateProgram.list(),
    initialData: []
  });

  const { data: careerApplications } = useQuery({
    queryKey: ['career-applications'],
    queryFn: () => base44.entities.CareerApplication.list("-created_date", 50),
    initialData: []
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const departments = [
    { id: "all", name: "All Departments", icon: Users, color: "bg-gradient-to-r from-blue-600 to-cyan-600" },
    { id: "incidents", name: "Incidents", icon: AlertTriangle, color: "bg-gradient-to-r from-red-600 to-orange-600" },
    { id: "operations", name: "Operations", icon: TrendingUp, color: "bg-gradient-to-r from-blue-600 to-indigo-600" },
    { id: "fleet", name: "Fleet Management", icon: TrendingUp, color: "bg-gradient-to-r from-green-600 to-emerald-600" },
    { id: "finance", name: "Finance", icon: DollarSign, color: "bg-gradient-to-r from-purple-600 to-pink-600" },
    { id: "support", name: "Customer Support", icon: UserCheck, color: "bg-gradient-to-r from-yellow-600 to-orange-600" },
    { id: "marketing", name: "Marketing", icon: Star, color: "bg-gradient-to-r from-indigo-600 to-purple-600" },
    { id: "technical", name: "Technical", icon: Shield, color: "bg-gradient-to-r from-teal-600 to-cyan-600" },
    { id: "hr", name: "Human Resources", icon: Users, color: "bg-gradient-to-r from-pink-600 to-rose-600" },
    { id: "dispatch", name: "Dispatch", icon: TrendingUp, color: "bg-gradient-to-r from-orange-600 to-red-600" }
  ];

  const filteredEmployees = allEmployees?.filter(emp => {
    const matchesDept = selectedDepartment === "all" || emp?.department === selectedDepartment;
    const matchesSearch = !searchQuery || 
      emp?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp?.job_title?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const getDepartmentStats = (deptId) => {
    if (deptId === "all") return allEmployees?.length || 0;
    return allEmployees?.filter(e => e?.department === deptId).length || 0;
  };

  const pendingApplications = careerApplications?.filter(app => app?.status === 'pending').length || 0;
  const activeAffiliates = affiliates?.filter(aff => aff?.status === 'active').length || 0;

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

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Users className="w-10 h-10 text-blue-400" />
                Employee Information Categories
              </h1>
              <p className="text-gray-400">Comprehensive employee directory and organizational overview</p>
            </div>
            <Badge className="bg-yellow-500 text-black text-lg px-4 py-2">
              {allEmployees?.length || 0} Total Employees
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 border-none text-white">
            <Users className="w-8 h-8 mb-2" />
            <p className="text-blue-200 text-sm mb-1">Total Employees</p>
            <p className="text-3xl font-bold">{allEmployees?.length || 0}</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-600 to-green-700 border-none text-white">
            <UserCheck className="w-8 h-8 mb-2" />
            <p className="text-green-200 text-sm mb-1">Active Affiliates</p>
            <p className="text-3xl font-bold">{activeAffiliates}</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-yellow-600 to-yellow-700 border-none text-white">
            <Briefcase className="w-8 h-8 mb-2" />
            <p className="text-yellow-200 text-sm mb-1">Pending Applications</p>
            <p className="text-3xl font-bold">{pendingApplications}</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-600 to-purple-700 border-none text-white">
            <Shield className="w-8 h-8 mb-2" />
            <p className="text-purple-200 text-sm mb-1">Access Levels</p>
            <p className="text-3xl font-bold">{employeeCategories?.length || 0}</p>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or job title..."
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <Button
              onClick={() => navigate(createPageUrl("CreateEmployee"))}
              className="bg-green-600 hover:bg-green-700"
            >
              <Users className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          </div>
        </Card>

        <Tabs value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-6 gap-2 bg-transparent mb-8">
            {departments.map((dept) => (
              <TabsTrigger
                key={dept.id}
                value={dept.id}
                className={`${
                  selectedDepartment === dept.id
                    ? dept.color + ' text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                } border-none transition-all`}
              >
                <dept.icon className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">{dept.name}</span>
                <Badge className="ml-2 bg-white/20">
                  {getDepartmentStats(dept.id)}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {departments.map((dept) => (
            <TabsContent key={dept.id} value={dept.id}>
              <Card className="p-6 bg-gray-800 border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <dept.icon className="w-6 h-6" />
                    {dept.name}
                  </h2>
                  <Badge className={dept.color}>
                    {getDepartmentStats(dept.id)} Employees
                  </Badge>
                </div>

                {filteredEmployees && filteredEmployees.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredEmployees.map((employee) => (
                      <Card
                        key={employee.id}
                        className="p-4 bg-gray-700 border-gray-600 hover:bg-gray-600 transition-all cursor-pointer"
                        onClick={() => navigate(createPageUrl("UserProfile") + `?email=${employee?.email}`)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-white text-lg mb-1">
                              {employee?.full_name || employee?.email || 'Employee'}
                            </h3>
                            <p className="text-sm text-gray-400 mb-2">{employee?.email}</p>
                          </div>
                          <Badge className="bg-blue-600">
                            {employee?.department || 'N/A'}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="w-4 h-4 text-purple-400" />
                            <span className="text-gray-300">{employee?.job_title || 'No title'}</span>
                          </div>

                          {employee?.created_date && (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-green-400" />
                              <span className="text-gray-400">
                                Joined {new Date(employee.created_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm">
                            <Shield className="w-4 h-4 text-yellow-400" />
                            <span className="text-gray-400">{employee?.role || 'employee'}</span>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(createPageUrl("UserProfile") + `?email=${employee?.email}`);
                          }}
                        >
                          View Profile
                        </Button>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-gray-400 text-lg">
                      {searchQuery 
                        ? 'No employees found matching your search'
                        : `No employees in ${dept.name} department`
                      }
                    </p>
                  </div>
                )}
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card
            className="p-6 bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate(createPageUrl("AccessControl"))}
          >
            <Shield className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Access Control</h3>
            <p className="text-blue-200 text-sm">Manage employee permissions and access levels</p>
          </Card>

          <Card
            className="p-6 bg-gradient-to-br from-green-900 to-green-800 border-green-700 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate(createPageUrl("PayrollDashboard"))}
          >
            <DollarSign className="w-8 h-8 text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Payroll Management</h3>
            <p className="text-green-200 text-sm">View and manage employee compensation</p>
          </Card>

          <Card
            className="p-6 bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700 cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate(createPageUrl("HireOrFire"))}
          >
            <Briefcase className="w-8 h-8 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Hiring Center</h3>
            <p className="text-purple-200 text-sm">Review applications and manage hiring</p>
          </Card>
        </div>
      </div>
    </div>
  );
}