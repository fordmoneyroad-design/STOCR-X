
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle, X, Calendar, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PayrollRequestPopup from "../components/PayrollRequestPopup";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function PayrollDashboard() {
  const [user, setUser] = useState(null);
  const [payPeriodStart, setPayPeriodStart] = useState("");
  const [payPeriodEnd, setPayPeriodEnd] = useState("");
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
        
        // Set default pay period (last 2 weeks)
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 14);
        setPayPeriodStart(start.toISOString().split('T')[0]);
        setPayPeriodEnd(end.toISOString().split('T')[0]);
      } catch (err) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  const { data: employees } = useQuery({
    queryKey: ['employees-payroll'],
    queryFn: () => base44.entities.User.filter({ 
      department: { $exists: true },
      hourly_rate: { $exists: true }
    }),
    initialData: []
  });

  const { data: timeRecords } = useQuery({
    queryKey: ['time-records', payPeriodStart, payPeriodEnd],
    queryFn: async () => {
      if (!payPeriodStart || !payPeriodEnd) return [];
      const records = await base44.entities.TimeTracking.list("-created_date", 1000);
      return records.filter(r => {
        const date = new Date(r.created_date).toISOString().split('T')[0];
        return date >= payPeriodStart && date <= payPeriodEnd && r.status === "clocked_out";
      });
    },
    enabled: !!payPeriodStart && !!payPeriodEnd,
    initialData: []
  });

  const { data: payrollRecords } = useQuery({
    queryKey: ['payroll-records'],
    queryFn: () => base44.entities.Payroll.list("-created_date"),
    initialData: []
  });

  // Add query for affiliates
  const { data: affiliatesOnPayroll } = useQuery({
    queryKey: ['affiliates-payroll'],
    queryFn: () => base44.entities.AffiliateProgram.filter({ on_payroll: true }),
    initialData: []
  });

  const generatePayrollMutation = useMutation({
    mutationFn: async (employeeEmail) => {
      const employee = employees.find(e => e.email === employeeEmail);
      if (!employee || !employee.hourly_rate) throw new Error("Employee not found or no hourly rate");

      const employeeRecords = timeRecords.filter(r => r.employee_email === employeeEmail);
      const totalHours = employeeRecords.reduce((sum, r) => sum + (r.total_hours || 0), 0);
      
      // Calculate regular and overtime (over 40 hours/week is overtime)
      const regularHours = Math.min(totalHours, 80); // 2 weeks = 80 hours
      const overtimeHours = Math.max(0, totalHours - 80);
      
      const grossPay = (regularHours * employee.hourly_rate) + (overtimeHours * employee.hourly_rate * 1.5);
      const deductions = grossPay * 0.20; // 20% deductions (taxes, etc)
      const netPay = grossPay - deductions;

      return base44.entities.Payroll.create({
        employee_email: employeeEmail,
        pay_period_start: payPeriodStart,
        pay_period_end: payPeriodEnd,
        total_hours: totalHours,
        regular_hours: regularHours,
        overtime_hours: overtimeHours,
        hourly_rate: employee.hourly_rate,
        gross_pay: grossPay,
        deductions: deductions,
        net_pay: netPay,
        status: "pending"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['payroll-records']);
    }
  });

  const approvePayrollMutation = useMutation({
    mutationFn: (payrollId) => base44.entities.Payroll.update(payrollId, {
      status: "approved"
    }),
    onSuccess: () => queryClient.invalidateQueries(['payroll-records'])
  });

  const markPaidMutation = useMutation({
    mutationFn: (payrollId) => base44.entities.Payroll.update(payrollId, {
      status: "paid",
      paid_date: new Date().toISOString().split('T')[0]
    }),
    onSuccess: () => queryClient.invalidateQueries(['payroll-records'])
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate payroll summary by employee
  const payrollSummary = employees.map(employee => {
    const employeeRecords = timeRecords.filter(r => r.employee_email === employee.email);
    const totalHours = employeeRecords.reduce((sum, r) => sum + (r.total_hours || 0), 0);
    const existingPayroll = payrollRecords.find(p => 
      p.employee_email === employee.email &&
      p.pay_period_start === payPeriodStart &&
      p.pay_period_end === payPeriodEnd
    );

    return {
      employee,
      totalHours,
      existingPayroll
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Payroll Dashboard</h1>
          <p className="text-gray-400">Process employee payroll from time tracking</p>
        </div>

        {/* Add Payroll Request Button */}
        <div className="mb-6 flex justify-end">
          <PayrollRequestPopup
            user={user}
            trigger={
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Request Payroll Change
              </Button>
            }
          />
        </div>

        {/* Pay Period Selector */}
        <Card className="p-6 mb-8 border-none shadow-lg bg-gray-800">
          <h2 className="text-xl font-bold text-white mb-4">Pay Period</h2>
          <div className="flex gap-4">
            <div>
              <label className="text-sm text-gray-400">Start Date</label>
              <input
                type="date"
                value={payPeriodStart}
                onChange={(e) => setPayPeriodStart(e.target.value)}
                className="block w-full p-2 border rounded-lg bg-gray-700 text-white border-gray-600"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400">End Date</label>
              <input
                type="date"
                value={payPeriodEnd}
                onChange={(e) => setPayPeriodEnd(e.target.value)}
                className="block w-full p-2 border rounded-lg bg-gray-700 text-white border-gray-600"
              />
            </div>
          </div>
        </Card>

        {/* Payroll Summary */}
        <Card className="p-6 border-none shadow-lg bg-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6">Employee Payroll</h2>
          
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Employee</TableHead>
                <TableHead className="text-gray-300">Department</TableHead>
                <TableHead className="text-gray-300">Hours Worked</TableHead>
                <TableHead className="text-gray-300">Hourly Rate</TableHead>
                <TableHead className="text-gray-300">Estimated Pay</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollSummary.map(({ employee, totalHours, existingPayroll }) => {
                const estimatedPay = employee.hourly_rate ? totalHours * employee.hourly_rate : 0;
                
                return (
                  <TableRow key={employee.id} className="border-gray-700">
                    <TableCell className="font-medium text-white">
                      {employee.full_name || employee.email}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-blue-600">{employee.department}</Badge>
                    </TableCell>
                    <TableCell className="text-white">{totalHours.toFixed(2)} hrs</TableCell>
                    <TableCell className="text-white">${employee.hourly_rate || 0}/hr</TableCell>
                    <TableCell className="font-bold text-white">
                      ${existingPayroll ? existingPayroll.net_pay.toFixed(2) : estimatedPay.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {existingPayroll ? (
                        <Badge className={
                          existingPayroll.status === 'paid' ? 'bg-green-600' :
                          existingPayroll.status === 'approved' ? 'bg-blue-600' : 'bg-yellow-600'
                        }>
                          {existingPayroll.status}
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-600">Not Generated</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!existingPayroll && totalHours > 0 && (
                        <Button
                          size="sm"
                          onClick={() => generatePayrollMutation.mutate(employee.email)}
                          disabled={generatePayrollMutation.isLoading}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Generate
                        </Button>
                      )}
                      {existingPayroll && existingPayroll.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approvePayrollMutation.mutate(existingPayroll.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                      {existingPayroll && existingPayroll.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => markPaidMutation.mutate(existingPayroll.id)}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Mark Paid
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        {/* Add Affiliates Section */}
        {user.role === 'admin' && affiliatesOnPayroll.length > 0 && (
          <Card className="p-6 bg-gray-800 border-gray-700 mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Affiliates on Payroll</h2>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Name</TableHead>
                  <TableHead className="text-gray-300">Program</TableHead>
                  <TableHead className="text-gray-300">Commission Rate</TableHead>
                  <TableHead className="text-gray-300">Referrals</TableHead>
                  <TableHead className="text-gray-300">Pending Earnings</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {affiliatesOnPayroll.map((affiliate) => (
                  <TableRow key={affiliate.id} className="border-gray-700">
                    <TableCell className="text-white">
                      <p className="font-semibold">{affiliate.affiliate_name}</p>
                      <p className="text-sm text-gray-400">{affiliate.affiliate_email}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-purple-600">
                        {affiliate.program_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-green-400 font-semibold">
                      {affiliate.commission_rate}%
                    </TableCell>
                    <TableCell className="text-white">{affiliate.total_referrals || 0}</TableCell>
                    <TableCell className="text-yellow-400 font-semibold">
                      ${affiliate.pending_earnings?.toLocaleString() || '0'}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Recent Payroll Records */}
        <Card className="p-6 mt-8 border-none shadow-lg bg-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Payroll History</h2>
          
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Employee</TableHead>
                <TableHead className="text-gray-300">Period</TableHead>
                <TableHead className="text-gray-300">Total Hours</TableHead>
                <TableHead className="text-gray-300">Gross Pay</TableHead>
                <TableHead className="text-gray-300">Net Pay</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Paid Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payrollRecords?.slice(0, 20).map((record) => (
                <TableRow key={record.id} className="border-gray-700">
                  <TableCell className="font-medium text-white">{record.employee_email}</TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(record.pay_period_start).toLocaleDateString()} - {new Date(record.pay_period_end).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-white">{record.total_hours.toFixed(2)} hrs</TableCell>
                  <TableCell className="text-white">${record.gross_pay.toFixed(2)}</TableCell>
                  <TableCell className="font-bold text-white">${record.net_pay.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={
                      record.status === 'paid' ? 'bg-green-600' :
                      record.status === 'approved' ? 'bg-blue-600' : 'bg-yellow-600'
                    }>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {record.paid_date ? new Date(record.paid_date).toLocaleDateString() : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
