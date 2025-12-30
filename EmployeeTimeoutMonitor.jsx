
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, Clock, AlertTriangle, Users, RefreshCw, Play, 
  Pause, CheckCircle, XCircle 
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SuperAdminQuickActions from "../components/admin/SuperAdminQuickActions";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function EmployeeTimeoutMonitor() {
  const [user, setUser] = useState(null);
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

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      queryClient.invalidateQueries(['active-sessions']);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const { data: activeSessions } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: () => base44.entities.TimeTracking.filter({
      status: { $in: ['clocked_in', 'on_break'] }
    }),
    initialData: []
  });

  const { data: timedOutSessions } = useQuery({
    queryKey: ['timed-out-sessions'],
    queryFn: async () => {
      // Get sessions on break for > 5 minutes
      const sessions = await base44.entities.TimeTracking.filter({
        status: 'on_break'
      });

      return sessions.filter(session => {
        if (!session.break_start) return false;
        const elapsed = (Date.now() - new Date(session.break_start).getTime()) / 1000 / 60;
        return elapsed > 5;
      });
    },
    initialData: []
  });

  const { data: allEmployees } = useQuery({
    queryKey: ['all-employees'],
    queryFn: () => base44.entities.User.filter({ department: { $ne: null } }),
    initialData: []
  });

  const forceClockOutMutation = useMutation({
    mutationFn: async (sessionId) => {
      const session = activeSessions.find(s => s.id === sessionId);
      const clockIn = new Date(session.clock_in_time);
      const totalHours = (Date.now() - clockIn.getTime()) / 1000 / 60 / 60;

      return await base44.entities.TimeTracking.update(sessionId, {
        clock_out_time: new Date().toISOString(),
        total_hours: parseFloat(totalHours.toFixed(2)),
        status: 'clocked_out',
        notes: 'Auto clocked out by admin - 5 min break exceeded'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['active-sessions']);
      queryClient.invalidateQueries(['timed-out-sessions']);
      alert("✅ Employee clocked out!");
    }
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async (email) => {
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: '⏰ STOCRX: Break Time Exceeded',
        body: `Your 5-minute break has ended. Please clock back in to continue your shift or you will be automatically clocked out.`
      });
    },
    onSuccess: () => {
      alert("📧 Notification sent!");
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getSessionDuration = (clockInTime) => {
    const elapsed = (Date.now() - new Date(clockInTime).getTime()) / 1000 / 60 / 60;
    return elapsed.toFixed(2);
  };

  const getBreakDuration = (breakStart) => {
    if (!breakStart) return 0;
    const elapsed = (Date.now() - new Date(breakStart).getTime()) / 1000 / 60;
    return elapsed.toFixed(1);
  };

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

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <AlertTriangle className="w-10 h-10 text-orange-400" />
              Employee Timeout Monitor
            </h1>
            <p className="text-gray-400">Track breaks & auto clock-out after 5 minutes</p>
          </div>
          <Button
            onClick={() => {
              queryClient.invalidateQueries(['active-sessions']);
              queryClient.invalidateQueries(['timed-out-sessions']);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-green-600 to-green-700 border-none text-white">
            <CheckCircle className="w-8 h-8 mb-2" />
            <p className="text-green-200 text-sm mb-1">Currently Working</p>
            <p className="text-4xl font-bold">
              {activeSessions.filter(s => s.status === 'clocked_in').length}
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-yellow-600 to-yellow-700 border-none text-white">
            <Pause className="w-8 h-8 mb-2" />
            <p className="text-yellow-200 text-sm mb-1">On Break</p>
            <p className="text-4xl font-bold">
              {activeSessions.filter(s => s.status === 'on_break').length}
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-600 to-red-700 border-none text-white">
            <AlertTriangle className="w-8 h-8 mb-2" />
            <p className="text-red-200 text-sm mb-1">Break Exceeded (&gt;5min)</p>
            <p className="text-4xl font-bold">{timedOutSessions.length}</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 border-none text-white">
            <Users className="w-8 h-8 mb-2" />
            <p className="text-blue-200 text-sm mb-1">Total Employees</p>
            <p className="text-4xl font-bold">{allEmployees.length}</p>
          </Card>
        </div>

        {/* Timed Out Employees (Priority Alert) */}
        {timedOutSessions.length > 0 && (
          <Card className="p-6 bg-red-900 border-red-700 mb-8">
            <Alert className="bg-red-800 border-red-600 mb-4">
              <AlertTriangle className="h-4 w-4 text-red-300" />
              <AlertDescription className="text-red-100">
                <strong>{timedOutSessions.length} employees</strong> have exceeded their 5-minute break! 
                Take action now to clock them out or send reminders.
              </AlertDescription>
            </Alert>

            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <XCircle className="w-6 h-6 text-red-400" />
              Timeout Alerts - Action Required
            </h2>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-red-700">
                    <TableHead className="text-red-200">Employee</TableHead>
                    <TableHead className="text-red-200">Clock In Time</TableHead>
                    <TableHead className="text-red-200">Break Started</TableHead>
                    <TableHead className="text-red-200">Break Duration</TableHead>
                    <TableHead className="text-red-200">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timedOutSessions.map((session) => {
                    const employee = allEmployees.find(e => e.email === session.employee_email);
                    const breakDuration = getBreakDuration(session.break_start);

                    return (
                      <TableRow key={session.id} className="border-red-700">
                        <TableCell className="text-white">
                          <div>
                            <p className="font-bold">{employee?.full_name || session.employee_email}</p>
                            <p className="text-xs text-red-300">{employee?.department}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-red-100">
                          {new Date(session.clock_in_time).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-red-100">
                          {new Date(session.break_start).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-red-600 text-white text-lg px-3 py-1">
                            {breakDuration} min
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => forceClockOutMutation.mutate(session.id)}
                              disabled={forceClockOutMutation.isLoading}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Force Clock Out
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => sendNotificationMutation.mutate(session.employee_email)}
                              disabled={sendNotificationMutation.isLoading}
                              className="bg-yellow-600 hover:bg-yellow-700"
                            >
                              📧 Send Reminder
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {/* All Active Sessions */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-400" />
            All Active Sessions ({activeSessions.length})
          </h2>

          {activeSessions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No active sessions</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Employee</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Clock In</TableHead>
                    <TableHead className="text-gray-300">Duration</TableHead>
                    <TableHead className="text-gray-300">Break Info</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeSessions.map((session) => {
                    const employee = allEmployees.find(e => e.email === session.employee_email);
                    const duration = getSessionDuration(session.clock_in_time);
                    const breakDuration = getBreakDuration(session.break_start);

                    return (
                      <TableRow key={session.id} className="border-gray-700">
                        <TableCell className="text-white">
                          <div>
                            <p className="font-bold">{employee?.full_name || session.employee_email}</p>
                            <p className="text-xs text-gray-400">{employee?.department}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            session.status === 'clocked_in' ? 'bg-green-600' : 
                            breakDuration > 5 ? 'bg-red-600' : 'bg-yellow-600'
                          }>
                            {session.status === 'clocked_in' ? '✅ Working' : 
                             breakDuration > 5 ? '⚠️ Timeout' : '⏸️ On Break'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300 text-sm">
                          {new Date(session.clock_in_time).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-white font-bold">
                          {duration}h
                        </TableCell>
                        <TableCell>
                          {session.status === 'on_break' && (
                            <div>
                              <p className="text-sm text-gray-300">
                                {breakDuration} min
                              </p>
                              {breakDuration > 5 && (
                                <Badge className="bg-red-600 text-xs mt-1">
                                  EXCEEDED
                                </Badge>
                              )}
                            </div>
                          )}
                          {session.status === 'clocked_in' && (
                            <span className="text-gray-500 text-sm">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {breakDuration > 5 && (
                              <Button
                                size="sm"
                                onClick={() => forceClockOutMutation.mutate(session.id)}
                                disabled={forceClockOutMutation.isLoading}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Force Out
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => sendNotificationMutation.mutate(session.employee_email)}
                              disabled={sendNotificationMutation.isLoading}
                              variant="outline"
                              className="border-blue-500 text-blue-400"
                            >
                              📧 Notify
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        <SuperAdminQuickActions />
      </div>
    </div>
  );
}
