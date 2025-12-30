import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, DollarSign, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PayrollRequestPopup({ trigger, user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    request_type: "rate_change",
    requested_hourly_rate: "",
    requested_commission_rate: "",
    payment_structure: "hourly",
    justification: ""
  });

  const queryClient = useQueryClient();

  const createRequestMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.PayrollRequest.create({
        employee_email: user.email,
        employee_name: user.full_name || user.email,
        department: user.department || "general",
        requested_by: user.email,
        entity_type: "User",
        related_entity_id: user.id,
        priority: "medium",
        ...data
      });

      // Notify super admin
      await base44.integrations.Core.SendEmail({
        to: "fordmoneyroad@gmail.com",
        subject: `Payroll Request from ${user.full_name || user.email}`,
        body: `
          New payroll request requires your approval:
          
          Employee: ${user.full_name || user.email}
          Email: ${user.email}
          Request Type: ${data.request_type}
          
          ${data.requested_hourly_rate ? `Requested Hourly Rate: $${data.requested_hourly_rate}` : ''}
          ${data.requested_commission_rate ? `Requested Commission: ${data.requested_commission_rate}%` : ''}
          
          Justification: ${data.justification}
          
          Review at: https://stocrx.com/AffiliateManagement
        `
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['payroll-requests']);
      alert("✅ Payroll request submitted!");
      setIsOpen(false);
      setFormData({
        request_type: "rate_change",
        requested_hourly_rate: "",
        requested_commission_rate: "",
        payment_structure: "hourly",
        justification: ""
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createRequestMutation.mutate(formData);
  };

  return (
    <>
      {/* Trigger Button */}
      <div onClick={() => setIsOpen(true)}>
        {trigger}
      </div>

      {/* Popup Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full p-8 bg-gray-800 border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <DollarSign className="w-8 h-8 text-green-400" />
                Payroll Request
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            <Alert className="mb-6 bg-blue-900/30 border-blue-700">
              <AlertCircle className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-200">
                Your request will be reviewed by the Super Admin. You'll receive an email notification once approved.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Request Type *</label>
                <select
                  value={formData.request_type}
                  onChange={(e) => setFormData({...formData, request_type: e.target.value})}
                  className="w-full p-3 rounded-lg bg-gray-700 border-gray-600 text-white"
                >
                  <option value="rate_change">Rate Change</option>
                  <option value="status_change">Status Change</option>
                  <option value="payment_issue">Payment Issue</option>
                  <option value="new_employee">New Employee Addition</option>
                </select>
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Payment Structure *</label>
                <select
                  value={formData.payment_structure}
                  onChange={(e) => setFormData({...formData, payment_structure: e.target.value})}
                  className="w-full p-3 rounded-lg bg-gray-700 border-gray-600 text-white"
                >
                  <option value="hourly">Hourly Only</option>
                  <option value="commission">Commission Only</option>
                  <option value="hourly_plus_commission">Hourly + Commission</option>
                  <option value="salary">Salary</option>
                  <option value="salary_plus_commission">Salary + Commission</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {(formData.payment_structure === "hourly" || formData.payment_structure === "hourly_plus_commission" || formData.payment_structure === "salary") && (
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">
                      Requested {formData.payment_structure === "salary" ? "Salary" : "Hourly Rate"} ($)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.requested_hourly_rate}
                      onChange={(e) => setFormData({...formData, requested_hourly_rate: e.target.value})}
                      placeholder="20.00"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                )}

                {(formData.payment_structure === "commission" || formData.payment_structure === "hourly_plus_commission" || formData.payment_structure === "salary_plus_commission") && (
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Commission Rate (%)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.requested_commission_rate}
                      onChange={(e) => setFormData({...formData, requested_commission_rate: e.target.value})}
                      placeholder="10"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Justification *</label>
                <Textarea
                  value={formData.justification}
                  onChange={(e) => setFormData({...formData, justification: e.target.value})}
                  required
                  placeholder="Explain why this change is needed..."
                  className="bg-gray-700 border-gray-600 text-white h-32"
                />
              </div>

              <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4">
                <h3 className="font-bold text-yellow-400 mb-2">⚠️ Request Review Process</h3>
                <ul className="text-sm text-yellow-200 space-y-1">
                  <li>• Request sent to Super Admin for approval</li>
                  <li>• Review typically takes 2-3 business days</li>
                  <li>• You'll receive email notification of decision</li>
                  <li>• Changes take effect on next pay period if approved</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={createRequestMutation.isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {createRequestMutation.isLoading ? "Submitting..." : "Submit Request"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}