
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Coffee, LogOut as LogOutIcon, Calendar, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom"; // Import useNavigate

export default function EmployeeDashboard() {
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const queryClient = useQueryClient();
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser?.department) {
          window.location.href = createPageUrl("Home");
          return;
        }
        setUser(currentUser);
      } catch (err) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();

    // Update clock every second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: todayTracking } = useQuery({
    queryKey: ['time-tracking-today', user?.email],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const records = await base44.entities.TimeTracking.filter({ 
        employee_email: user?.email 
      }, "-created_date", 1);
      return records[0];
    },
    enabled: !!user,
    initialData: null
  });

  const { data: todaySchedule } = useQuery({
    queryKey: ['schedule-today', user?.email],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const schedule = await base44.entities.Schedule.filter({
        employee_email: user?.email,
        shift_date: today
      });
      return schedule[0];
    },
    enabled: !!user,
    initialData: null
  });

  const clockInMutation = useMutation({
    mutationFn: () => base44.entities.TimeTracking.create({
      employee_email: user?.email || '',
      clock_in_time: new Date().toISOString(),
      status: "clocked_in"
    }),
    onSuccess: () => queryClient.invalidateQueries(['time-tracking-today'])
  });

  const clockOutMutation = useMutation({
    mutationFn: () => {
      const clockInTime = new Date(todayTracking.clock_in_time);
      const clockOutTime = new Date();
      const hours = (clockOutTime - clockInTime) / (1000 * 60 * 60);
      
      return base44.entities.TimeTracking.update(todayTracking.id, {
        clock_out_time: clockOutTime.toISOString(),
        total_hours: hours,
        status: "clocked_out"
      });
    },
    onSuccess: () => queryClient.invalidateQueries(['time-tracking-today'])
  });

  const startBreakMutation = useMutation({
    mutationFn: () => base44.entities.TimeTracking.update(todayTracking.id, {
      break_start: new Date().toISOString(),
      status: "on_break"
    }),
    onSuccess: () => queryClient.invalidateQueries(['time-tracking-today'])
  });

  const endBreakMutation = useMutation({
    mutationFn: () => base44.entities.TimeTracking.update(todayTracking.id, {
      break_end: new Date().toISOString(),
      status: "clocked_in"
    }),
    onSuccess: () => queryClient.invalidateQueries(['time-tracking-today'])
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getDepartmentColor = (dept) => {
    const colors = {
      incidents: "from-red-500 to-orange-600",
      operations: "from-blue-500 to-cyan-600",
      fleet: "from-green-500 to-emerald-600",
      finance: "from-purple-500 to-pink-600",
      support: "from-yellow-500 to-orange-600",
      marketing: "from-indigo-500 to-purple-600"
    };
    return colors[dept] || "from-gray-500 to-gray-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {user?.department?.charAt(0).toUpperCase() + user?.department?.slice(1)} Dashboard
              </h1>
              <p className="text-gray-600">
                {user?.full_name || user?.email || 'Employee'} • {user?.job_title || 'Employee'}
              </p>
            </div>
            <Badge className={`bg-gradient-to-r ${getDepartmentColor(user?.department)} text-white text-lg px-4 py-2`}>
              {user?.department || 'General'}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Time Clock */}
          <div className="lg:col-span-2 space-y-6">
            <Card className={`p-8 border-none shadow-xl bg-gradient-to-br ${getDepartmentColor(user?.department)} text-white`}>
              <div className="text-center mb-6">
                <Clock className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-5xl font-bold mb-2">
                  {currentTime.toLocaleTimeString()}
                </h2>
                <p className="text-lg opacity-90">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {!todayTracking || todayTracking.status === "clocked_out" ? (
                  <Button
                    onClick={() => clockInMutation.mutate()}
                    disabled={clockInMutation.isLoading}
                    className="col-span-2 h-16 text-lg bg-white text-gray-900 hover:bg-gray-100"
                  >
                    <Clock className="w-6 h-6 mr-2" />
                    Clock In
                  </Button>
                ) : (
                  <>
                    {todayTracking.status === "clocked_in" && (
                      <>
                        <Button
                          onClick={() => startBreakMutation.mutate()}
                          disabled={startBreakMutation.isLoading}
                          className="h-16 text-lg bg-white/20 hover:bg-white/30 border-2 border-white"
                        >
                          <Coffee className="w-6 h-6 mr-2" />
                          Start Break
                        </Button>
                        <Button
                          onClick={() => clockOutMutation.mutate()}
                          disabled={clockOutMutation.isLoading}
                          className="h-16 text-lg bg-white text-gray-900 hover:bg-gray-100"
                        >
                          <LogOutIcon className="w-6 h-6 mr-2" />
                          Clock Out
                        </Button>
                      </>
                    )}
                    {todayTracking.status === "on_break" && (
                      <Button
                        onClick={() => endBreakMutation.mutate()}
                        disabled={endBreakMutation.isLoading}
                        className="col-span-2 h-16 text-lg bg-white text-gray-900 hover:bg-gray-100"
                      >
                        End Break
                      </Button>
                    )}
                  </>
                )}
              </div>

              {todayTracking && todayTracking.status !== "clocked_out" && (
                <div className="mt-6 p-4 bg-white/10 rounded-lg">
                  <p className="text-sm opacity-90">Status: <Badge className="ml-2 bg-white text-gray-900">{todayTracking.status.replace('_', ' ')}</Badge></p>
                  <p className="text-sm opacity-90 mt-2">
                    Clocked in at: {new Date(todayTracking.clock_in_time).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </Card>

            {/* Today's Schedule */}
            <Card className="p-8 border-none shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Today's Schedule
              </h3>

              {todaySchedule ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Shift Time</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {todaySchedule.start_time} - {todaySchedule.end_time}
                        </p>
                      </div>
                      <Badge className={
                        todaySchedule.shift_type === 'on_call' ? 'bg-orange-500' :
                        todaySchedule.shift_type === 'overtime' ? 'bg-purple-500' : 'bg-blue-500'
                      }>
                        {todaySchedule.shift_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {todaySchedule.manager_approved ? (
                        <Badge className="bg-green-500">Approved</Badge>
                      ) : (
                        <Badge className="bg-yellow-500">Pending Approval</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No schedule for today. Contact your manager if this is an error.
                  </AlertDescription>
                </Alert>
              )}
            </Card>
          </div>

          {/* Quick Links - ALL CLICKABLE */}
          <div className="space-y-6">
            <Card className="p-6 border-none shadow-lg">
              <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-blue-50 transition-colors"
                  onClick={() => navigate(createPageUrl("MyShifts"))}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  View My Schedule
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-green-50 transition-colors"
                  onClick={() => navigate(createPageUrl("ScheduleRequest"))}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Request Schedule Change
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-purple-50 transition-colors"
                  onClick={() => navigate(createPageUrl("MyAccount"))}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  View Time Reports
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start hover:bg-orange-50 transition-colors"
                  onClick={() => navigate(createPageUrl("AIAssistantEmployee"))}
                >
                  <AlertCircle className="w-4 h-4 mr-2" />
                  AI Assistant
                </Button>
              </div>
            </Card>

            {/* Department Info - CLICKABLE */}
            <Card 
              onClick={() => navigate(createPageUrl("EmployeeInformationCategories"))}
              className="p-6 border-none shadow-lg cursor-pointer hover:shadow-xl transition-all"
            >
              <h3 className="font-bold text-lg mb-4">Department Info</h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-semibold capitalize">{user?.department || 'General'}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-semibold">{user?.job_title || 'Employee'}</p>
                </div>
              </div>
              <p className="text-xs text-blue-600 mt-3 text-center">Click to view all employees →</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
