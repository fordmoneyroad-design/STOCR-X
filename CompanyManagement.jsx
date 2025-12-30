import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Building2, Plus, AlertTriangle } from "lucide-react";
import SuperAdminQuickActions from "../components/admin/SuperAdminQuickActions";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function CompanyManagement() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    company_type: "subscription_only",
    state: "Michigan",
    max_vehicles_allowed: 3,
    dealer_license_number: "",
    tax_id: ""
  });
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
  }, []);

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => base44.entities.CompanyEntity.list("-created_date"),
    initialData: []
  });

  const createCompanyMutation = useMutation({
    mutationFn: (data) => base44.entities.CompanyEntity.create({
      ...data,
      year: new Date().getFullYear(),
      vehicles_sold_this_year: 0,
      is_active: true
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['companies']);
      setShowForm(false);
      setFormData({
        company_name: "",
        company_type: "subscription_only",
        state: "Michigan",
        max_vehicles_allowed: 3,
        dealer_license_number: "",
        tax_id: ""
      });
    }
  });

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

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Building2 className="w-10 h-10 text-indigo-400" />
              Company Management
            </h1>
            <p className="text-gray-400">Manage companies with vehicle sale limits</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Company
          </Button>
        </div>

        {/* Michigan 3-Car Rule Alert */}
        <Card className="p-6 bg-yellow-900 border-yellow-700 mb-8">
          <AlertTriangle className="w-6 h-6 text-yellow-400 mb-2" />
          <h3 className="text-lg font-bold text-yellow-200 mb-2">Michigan 3-Car Rule</h3>
          <p className="text-yellow-100 text-sm">
            Michigan law allows up to 3 vehicle sales per year without a dealer license. 
            Track sales per company to ensure compliance.
          </p>
        </Card>

        {showForm && (
          <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Add New Company</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              createCompanyMutation.mutate(formData);
            }} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Company Name</label>
                  <Input
                    value={formData.company_name}
                    onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Company Type</label>
                  <select
                    value={formData.company_type}
                    onChange={(e) => setFormData({...formData, company_type: e.target.value})}
                    className="w-full p-3 rounded-lg bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="subscription_only">Subscription Only</option>
                    <option value="licensed_dealer">Licensed Dealer</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">State</label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Max Vehicles/Year</label>
                  <Input
                    type="number"
                    value={formData.max_vehicles_allowed}
                    onChange={(e) => setFormData({...formData, max_vehicles_allowed: parseInt(e.target.value)})}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                  Create Company
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">All Companies</h2>
          <div className="space-y-4">
            {companies.map((company) => (
              <Card key={company.id} className="p-4 bg-gray-700 border-gray-600">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-lg">{company.company_name}</h3>
                    <p className="text-sm text-gray-400">{company.state} • {company.company_type}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={
                      company.vehicles_sold_this_year >= company.max_vehicles_allowed
                        ? 'bg-red-600'
                        : 'bg-green-600'
                    }>
                      {company.vehicles_sold_this_year || 0} / {company.max_vehicles_allowed} vehicles
                    </Badge>
                    <p className="text-xs text-gray-400 mt-1">{company.year || new Date().getFullYear()}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        <SuperAdminQuickActions />
      </div>
    </div>
  );
}