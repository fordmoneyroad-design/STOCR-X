import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, MapPin, Camera, CheckCircle, AlertTriangle, Calendar, Play, Pause } from "lucide-react";

export default function MyShifts() {
  const [user, setUser] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);
  const [breakStartTime, setBreakStartTime] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Check for active session
        const sessions = await base44.entities.TimeTracking.filter({
          employee_email: currentUser.email,
          status: { $in: ['clocked_in', 'on_break'] }
        });

        if (sessions.length > 0) {
          setCurrentSession(sessions[0]);
          if (sessions[0].status === 'on_break' && sessions[0].break_start) {
            setBreakStartTime(new Date(sessions[0].break_start));
          }
        }
      } catch (err) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();

    // Auto-logout after 5 min break
    const breakInterval = setInterval(() => {
      if (breakStartTime) {
        const elapsed = (Date.now() - breakStartTime.getTime()) / 1000 / 60;
        if (elapsed >= 5 && currentSession) {
          handleAutoClockOut();
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(breakInterval);
  }, [breakStartTime]);

  const { data: mySchedules } = useQuery({
    queryKey: ['my-schedules', user?.email],
    queryFn: () => base44.entities.Schedule.filter({
      employee_email: user.email,
      status: { $in: ['scheduled', 'confirmed'] }
    }, "-shift_date"),
    enabled: !!user,
    initialData: []
  });

  const { data: myTimeRecords } = useQuery({
    queryKey: ['my-time-records', user?.email],
    queryFn: () => base44.entities.TimeTracking.filter({
      employee_email: user.email
    }, "-clock_in_time", 20),
    enabled: !!user,
    initialData: []
  });

  const clockInMutation = useMutation({
    mutationFn: async () => {
      const now = new Date().toISOString();
      return await base44.entities.TimeTracking.create({
        employee_email: user.email,
        clock_in_time: now,
        status: 'clocked_in'
      });
    },
    onSuccess: (data) => {
      setCurrentSession(data);
      queryClient.invalidateQueries(['my-time-records']);
      alert("✅ Clocked In!");
    }
  });

  const startBreakMutation = useMutation({
    mutationFn: async () => {
      const now = new Date().toISOString();
      return await base44.entities.TimeTracking.update(currentSession.id, {
        break_start: now,
        status: 'on_break'
      });
    },
    onSuccess: (data) => {
      setCurrentSession(data);
      setBreakStartTime(new Date(data.break_start));
      queryClient.invalidateQueries(['my-time-records']);
      alert("⏸️ Break Started - Auto clock-out in 5 minutes if not resumed!");
    }
  });

  const endBreakMutation = useMutation({
    mutationFn: async () => {
      const now = new Date().toISOString();
      return await base44.entities.TimeTracking.update(currentSession.id, {
        break_end: now,
        status: 'clocked_in'
      });
    },
    onSuccess: (data) => {
      setCurrentSession(data);
      setBreakStartTime(null);
      queryClient.invalidateQueries(['my-time-records']);
      alert("▶️ Break Ended - Back to work!");
    }
  });

  const clockOutMutation = useMutation({
    mutationFn: async () => {
      const now = new Date().toISOString();
      const clockIn = new Date(currentSession.clock_in_time);
      const totalHours = (Date.now() - clockIn.getTime()) / 1000 / 60 / 60;

      return await base44.entities.TimeTracking.update(currentSession.id, {
        clock_out_time: now,
        total_hours: parseFloat(totalHours.toFixed(2)),
        status: 'clocked_out'
      });
    },
    onSuccess: () => {
      setCurrentSession(null);
      setBreakStartTime(null);
      queryClient.invalidateQueries(['my-time-records']);
      alert("👋 Clocked Out!");
    }
  });

  const handleAutoClockOut = async () => {
    try {
      await clockOutMutation.mutateAsync();
      alert("⏰ Auto Clocked Out - 5 minute break exceeded!");
    } catch (error) {
      console.error("Auto clock-out error:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const breakTimeRemaining = breakStartTime 
    ? Math.max(0, 5 - (Date.now() - breakStartTime.getTime()) / 1000 / 60)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Clock className="w-10 h-10 text-blue-400" />
            My Shifts
          </h1>
          <p className="text-gray-400">{user.full_name || user.email}</p>
        </div>

        {/* Clock In/Out Card */}
        <Card className="p-8 mb-8 bg-gradient-to-br from-blue-900 to-indigo-900 border-blue-700">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-400" />
            Time Clock
          </h2>

          {currentSession ? (
            <div className="space-y-6">
              <div className="text-center">
                <Badge className={`text-2xl px-6 py-3 ${
                  currentSession.status === 'on_break' ? 'bg-yellow-600' : 'bg-green-600'
                }`}>
                  {currentSession.status === 'on_break' ? '⏸️ ON BREAK' : '✅ CLOCKED IN'}
                </Badge>
                <p className="text-white text-lg mt-4">
                  Since: {new Date(currentSession.clock_in_time).toLocaleString()}
                </p>
              </div>

              {currentSession.status === 'on_break' && (
                <Alert className="bg-yellow-900/30 border-yellow-700">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-200">
                    <strong>Break Active:</strong> {breakTimeRemaining.toFixed(1)} minutes remaining before auto clock-out
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid md:grid-cols-3 gap-4">
                {currentSession.status === 'clocked_in' && (
                  <Button
                    onClick={() => startBreakMutation.mutate()}
                    disabled={startBreakMutation.isLoading}
                    className="bg-yellow-600 hover:bg-yellow-700 h-16 text-lg"
                  >
                    <Pause className="w-6 h-6 mr-2" />
                    Start Break
                  </Button>
                )}

                {currentSession.status === 'on_break' && (
                  <Button
                    onClick={() => endBreakMutation.mutate()}
                    disabled={endBreakMutation.isLoading}
                    className="bg-green-600 hover:bg-green-700 h-16 text-lg"
                  >
                    <Play className="w-6 h-6 mr-2" />
                    End Break
                  </Button>
                )}

                <Button
                  onClick={() => clockOutMutation.mutate()}
                  disabled={clockOutMutation.isLoading}
                  className="bg-red-600 hover:bg-red-700 h-16 text-lg md:col-span-2"
                >
                  <Clock className="w-6 h-6 mr-2" />
                  Clock Out
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Button
                onClick={() => clockInMutation.mutate()}
                disabled={clockInMutation.isLoading}
                className="bg-green-600 hover:bg-green-700 h-20 text-xl px-12"
              >
                <CheckCircle className="w-8 h-8 mr-3" />
                Clock In
              </Button>
              <p className="text-gray-400 mt-4">Click to start your shift</p>
            </div>
          )}
        </Card>

        {/* My Schedule */}
        <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-400" />
            My Schedule
          </h2>
          {mySchedules.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No upcoming shifts</p>
          ) : (
            <div className="space-y-3">
              {mySchedules.map((schedule) => (
                <Card key={schedule.id} className="p-4 bg-gray-700 border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">
                        {new Date(schedule.shift_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-300">
                        {schedule.start_time} - {schedule.end_time}
                      </p>
                      <Badge className="mt-2 bg-purple-600">{schedule.department}</Badge>
                    </div>
                    <Badge className={
                      schedule.status === 'confirmed' ? 'bg-green-600' : 'bg-yellow-600'
                    }>
                      {schedule.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Time Records */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Time Records</h2>
          <div className="space-y-3">
            {myTimeRecords.map((record) => {
              const clockIn = new Date(record.clock_in_time);
              const clockOut = record.clock_out_time ? new Date(record.clock_out_time) : null;

              return (
                <Card key={record.id} className="p-4 bg-gray-700 border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-white">
                      {clockIn.toLocaleDateString()}
                    </p>
                    <Badge className={
                      record.status === 'clocked_out' ? 'bg-gray-600' :
                      record.status === 'on_break' ? 'bg-yellow-600' : 'bg-green-600'
                    }>
                      {record.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-gray-400">Clock In</p>
                      <p className="text-white">{clockIn.toLocaleTimeString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Clock Out</p>
                      <p className="text-white">
                        {clockOut ? clockOut.toLocaleTimeString() : 'In Progress'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Total Hours</p>
                      <p className="text-white font-bold">
                        {record.total_hours ? `${record.total_hours}h` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}