import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Handshake, Plus } from "lucide-react";
import SuperAdminQuickActions from "../components/admin/SuperAdminQuickActions";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function PartnerAccountCreation() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    contact_email: "",
    phone: "",
    partnership_type: "dealer",
    notes: ""
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
      // Create company entity
      await base44.entities.CompanyEntity.create({
        company_name: formData.company_name,
        company_type: formData.partnership_type === "dealer" ? "licensed_dealer" : "subscription_only",
        state: "Michigan",
        contact_name: formData.contact_name,
        contact_email: formData.contact_email,
        phone: formData.phone
      });

      // Send welcome email
      await base44.integrations.Core.SendEmail({
        to: formData.contact_email,
        subject: "Welcome to STOCRX Partnership Program",
        body: `
          Dear ${formData.contact_name},

          Welcome to the STOCRX Partnership Program!

          Company: ${formData.company_name}
          Partnership Type: ${formData.partnership_type}

          We're excited to work with you. Our team will reach out shortly with next steps.

          Best regards,
          STOCRX Team
        `
      });

      alert("✅ Partner account created successfully!");
      setFormData({
        company_name: "",
        contact_name: "",
        contact_email: "",
        phone: "",
        partnership_type: "dealer",
        notes: ""
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
            <Handshake className="w-10 h-10 text-teal-400" />
            Partner Account Creation
          </h1>
          <p className="text-gray-400">Create accounts for dealers, shops, and partners</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="p-8 bg-gray-800 border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">New Partner Account</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Company Name *</label>
                  <Input
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    required
                    placeholder="ABC Motors"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Contact Name *</label>
                  <Input
                    value={formData.contact_name}
                    onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                    required
                    placeholder="John Smith"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Email *</label>
                  <Input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    required
                    placeholder="john@abcmotors.com"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Phone</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(555) 123-4567"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-gray-300 text-sm mb-2 block">Partnership Type *</label>
                  <select
                    value={formData.partnership_type}
                    onChange={(e) => setFormData({...formData, partnership_type: e.target.value})}
                    className="w-full p-3 rounded-lg bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="dealer">Licensed Dealer</option>
                    <option value="shop">Repair Shop</option>
                    <option value="towing">Towing Service</option>
                    <option value="insurance">Insurance Partner</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-gray-300 text-sm mb-2 block">Notes</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Additional information about the partnership..."
                    className="bg-gray-700 border-gray-600 text-white h-24"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 bg-green-600 hover:bg-green-700">
                <Plus className="w-5 h-5 mr-2" />
                Create Partner Account
              </Button>
            </form>
          </Card>
        </div>

        <SuperAdminQuickActions />
      </div>
    </div>
  );
}