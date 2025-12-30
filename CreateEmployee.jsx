import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, UserPlus } from "lucide-react";
import SuperAdminQuickActions from "../components/admin/SuperAdminQuickActions";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function CreateEmployee() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    department: "operations",
    job_title: "",
    hourly_rate: ""
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Note: In a real implementation, you would use a backend function to create users
      // For now, we'll just send an invitation email
      await base44.integrations.Core.SendEmail({
        to: formData.email,
        subject: "Welcome to STOCRX Team!",
        body: `
          Dear ${formData.full_name},

          Welcome to the STOCRX team!

          Position: ${formData.job_title}
          Department: ${formData.department}
          Hourly Rate: $${formData.hourly_rate}/hour

          Please check your email for account setup instructions.

          Best regards,
          STOCRX HR Team
        `
      });

      alert("✅ Employee invitation sent! They will receive account setup instructions.");
      setFormData({
        email: "",
        full_name: "",
        department: "operations",
        job_title: "",
        hourly_rate: ""
      });
    } catch (error) {
      alert("Error: " + error.message);
    }
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
            <UserPlus className="w-10 h-10 text-blue-400" />
            Create Employee Account
          </h1>
          <p className="text-gray-400">Add new team members to STOCRX</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="p-8 bg-gray-800 border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Email Address *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  placeholder="employee@stocrx.com"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Full Name *</label>
                <Input
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  required
                  placeholder="John Smith"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Department *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full p-3 rounded-lg bg-gray-700 border-gray-600 text-white"
                >
                  <option value="incidents">Incidents & Roadside</option>
                  <option value="operations">Operations & E-commerce</option>
                  <option value="fleet">Fleet & Logistics</option>
                  <option value="finance">Finance & HR</option>
                  <option value="support">Customer Support</option>
                  <option value="marketing">Marketing</option>
                  <option value="technical">Technical</option>
                </select>
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Job Title *</label>
                <Input
                  value={formData.job_title}
                  onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                  required
                  placeholder="Fleet Coordinator"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Hourly Rate *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({...formData, hourly_rate: e.target.value})}
                  required
                  placeholder="25.00"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <Button type="submit" className="w-full h-12 bg-green-600 hover:bg-green-700">
                <UserPlus className="w-5 h-5 mr-2" />
                Send Employee Invitation
              </Button>
            </form>
          </Card>
        </div>

        <SuperAdminQuickActions />
      </div>
    </div>
  );
}