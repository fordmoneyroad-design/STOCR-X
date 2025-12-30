import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ScheduleRequest() {
  const [user, setUser] = useState(null);
  const [shiftDate, setShiftDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [shiftType, setShiftType] = useState("regular");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser.department) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await base44.entities.Schedule.create({
        employee_email: user.email,
        department: user.department,
        shift_date: shiftDate,
        start_time: startTime,
        end_time: endTime,
        shift_type: shiftType,
        status: "scheduled",
        manager_approved: false,
        notes: notes
      });

      // Send notification to manager
      await base44.integrations.Core.SendEmail({
        to: "fordmoneyroad@gmail.com",
        subject: `Schedule Request - ${user.email}`,
        body: `
          New schedule request from ${user.full_name || user.email}
          
          Department: ${user.department}
          Date: ${shiftDate}
          Time: ${startTime} - ${endTime}
          Type: ${shiftType}
          Notes: ${notes}
          
          Please review and approve in the Manager Dashboard.
        `
      });

      setSuccess(true);
      setShiftDate("");
      setStartTime("");
      setEndTime("");
      setNotes("");
    } catch (error) {
      console.error(error);
      alert("Error submitting request");
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Schedule Request</h1>
          <p className="text-gray-600">Request a new shift or schedule change</p>
        </div>

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Schedule request submitted! Your manager will review it shortly.
            </AlertDescription>
          </Alert>
        )}

        <Card className="p-8 border-none shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Shift Date *</Label>
              <Input
                type="date"
                value={shiftDate}
                onChange={(e) => setShiftDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className="h-12"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time *</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <div>
                <Label>End Time *</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
            </div>

            <div>
              <Label>Shift Type *</Label>
              <select
                value={shiftType}
                onChange={(e) => setShiftType(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-300"
              >
                <option value="regular">Regular</option>
                <option value="on_call">On Call</option>
                <option value="overtime">Overtime</option>
              </select>
            </div>

            <div>
              <Label>Notes (optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information..."
                className="h-24"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}