
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, Calendar, CheckCircle, X, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom"; // Assuming react-router-dom is used for navigation

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function ManagerDashboard() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate(); // Initialize useNavigate hook

  // Helper function to create page URLs based on logical names
  const createPageUrl = (pageName) => {
    switch (pageName) {
      case "EmployeeInformationCategories":
        // This would typically lead to a page showing all employees or employee management
        return "/employees"; 
      case "ManagerDashboard":
        // Navigating to ManagerDashboard itself, potentially to refresh or focus the current page
        return "/manager-dashboard"; 
      default:
        return "/"; // Fallback
    }
  };

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

  const { data: employees } = useQuery({
    queryKey: ['employees'],
    queryFn: () => base44.entities.User.filter({ department: { $exists: true } }),
    initialData: []
  });

  const { data: pendingSchedules } = useQuery({
    queryKey: ['pending-schedules'],
    queryFn: () => base44.entities.Schedule.filter({ manager_approved: false }),
    initialData: []
  });

  const { data: todayTracking } = useQuery({
    queryKey: ['today-tracking'],
    queryFn: async () => {
      const records = await base44.entities.TimeTracking.list("-created_date", 50);
      return records;
    },
    initialData: []
  });

  const approveScheduleMutation = useMutation({
    mutationFn: (scheduleId) => base44.entities.Schedule.update(scheduleId, {
      manager_approved: true,
      status: "confirmed"
    }),
    onSuccess: () => queryClient.invalidateQueries(['pending-schedules'])
  });

  const denyScheduleMutation = useMutation({
    mutationFn: (scheduleId) => base44.entities.Schedule.update(scheduleId, {
      status: "cancelled"
    }),
    onSuccess: () => queryClient.invalidateQueries(['pending-schedules'])
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const activeEmployees = todayTracking?.filter(t => t.status === "clocked_in" || t.status === "on_break") || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Manager Dashboard</h1>
          <p className="text-gray-600">Manage schedules, approvals, and team oversight</p>
        </div>

        {/* Stats - ALL CLICKABLE */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card
            onClick={() => navigate(createPageUrl("EmployeeInformationCategories"))}
            className="p-6 border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer hover:scale-105 transition-transform"
          >
            <Users className="w-8 h-8 mb-4" />
            <p className="text-blue-100 text-sm">Total Employees</p>
            <p className="text-4xl font-bold">{employees?.length || 0}</p>
            <p className="text-xs text-blue-100 mt-2">Click to view all →</p>
          </Card>

          <Card
            onClick={() => navigate(createPageUrl("ManagerDashboard"))}
            className="p-6 border-none shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white cursor-pointer hover:scale-105 transition-transform"
          >
            <Clock className="w-8 h-8 mb-4" />
            <p className="text-green-100 text-sm">Clocked In Now</p>
            <p className="text-4xl font-bold">{activeEmployees.length}</p>
            <p className="text-xs text-green-100 mt-2">Live tracking →</p>
          </Card>

          <Card
            onClick={() => navigate(createPageUrl("ManagerDashboard"))}
            className="p-6 border-none shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white cursor-pointer hover:scale-105 transition-transform"
          >
            <Calendar className="w-8 h-8 mb-4" />
            <p className="text-orange-100 text-sm">Pending Approvals</p>
            <p className="text-4xl font-bold">{pendingSchedules?.length || 0}</p>
            <p className="text-xs text-orange-100 mt-2">Review now →</p>
          </Card>
        </div>

        <Tabs defaultValue="schedules">
          <TabsList className="mb-6">
            <TabsTrigger value="schedules">Schedule Approvals</TabsTrigger>
            <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
            <TabsTrigger value="employees">Team Overview</TabsTrigger>
          </TabsList>

          {/* Schedule Approvals */}
          <TabsContent value="schedules">
            <Card className="p-6 border-none shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Schedule Approvals</h2>

              {pendingSchedules && pendingSchedules.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingSchedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">{schedule.employee_email}</TableCell>
                        <TableCell>{new Date(schedule.shift_date).toLocaleDateString()}</TableCell>
                        <TableCell>{schedule.start_time} - {schedule.end_time}</TableCell>
                        <TableCell>
                          <Badge className={
                            schedule.shift_type === 'on_call' ? 'bg-orange-500' :
                            schedule.shift_type === 'overtime' ? 'bg-purple-500' : 'bg-blue-500'
                          }>
                            {schedule.shift_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => approveScheduleMutation.mutate(schedule.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => denyScheduleMutation.mutate(schedule.id)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Deny
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-500 py-8">No pending approvals</p>
              )}
            </Card>
          </TabsContent>

          {/* Live Tracking */}
          <TabsContent value="tracking">
            <Card className="p-6 border-none shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Employee Tracking</h2>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Clock In Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hours Today</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayTracking?.map((tracking) => (
                    <TableRow key={tracking.id}>
                      <TableCell className="font-medium">{tracking.employee_email}</TableCell>
                      <TableCell>
                        {tracking.clock_in_time ? new Date(tracking.clock_in_time).toLocaleTimeString() : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          tracking.status === 'clocked_in' ? 'bg-green-500' :
                          tracking.status === 'on_break' ? 'bg-yellow-500' : 'bg-gray-500'
                        }>
                          {tracking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{tracking.total_hours?.toFixed(2) || '0.00'} hrs</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Team Overview */}
          <TabsContent value="employees">
            <Card className="p-6 border-none shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Team Members</h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees?.map((employee) => (
                  <Card key={employee.id} className="p-4 border shadow-sm">
                    <p className="font-bold text-gray-900">{employee.full_name || employee.email}</p>
                    <p className="text-sm text-gray-600">{employee.email}</p>
                    <div className="mt-2 flex gap-2">
                      <Badge className="bg-blue-500">{employee.department}</Badge>
                      <Badge variant="outline">{employee.job_title || 'Employee'}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
