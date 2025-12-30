import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft, MapPin, Plus, Edit, CheckCircle, XCircle, AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

const US_STATES = [
  { name: "Michigan", code: "MI", rate: 6.0 },
  { name: "California", code: "CA", rate: 7.25 },
  { name: "Texas", code: "TX", rate: 6.25 },
  { name: "Florida", code: "FL", rate: 6.0 },
  { name: "New York", code: "NY", rate: 4.0 },
  { name: "Illinois", code: "IL", rate: 6.25 },
  { name: "Ohio", code: "OH", rate: 5.75 },
  { name: "Georgia", code: "GA", rate: 4.0 },
  { name: "Arizona", code: "AZ", rate: 5.6 },
  { name: "Nevada", code: "NV", rate: 6.85 }
];

export default function TaxRegions() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [regionData, setRegionData] = useState({
    region_name: "",
    state_code: "",
    tax_rate: 6.0,
    collect_tax: false,
    registered: false,
    threshold_amount: 100000
  });

  const navigate = useNavigate();
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

  const { data: taxRegions } = useQuery({
    queryKey: ['tax-regions'],
    queryFn: () => base44.entities.TaxRegion.list(),
    initialData: []
  });

  const createRegionMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.TaxRegion.create({
        ...regionData,
        country: "United States",
        region_type: "state",
        current_sales: 0,
        threshold_met: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tax-regions']);
      alert("✅ Tax region created!");
      setShowForm(false);
      setRegionData({
        region_name: "",
        state_code: "",
        tax_rate: 6.0,
        collect_tax: false,
        registered: false,
        threshold_amount: 100000
      });
    }
  });

  const toggleCollectionMutation = useMutation({
    mutationFn: async ({ id, collect_tax }) => {
      return await base44.entities.TaxRegion.update(id, { collect_tax });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tax-regions']);
    }
  });

  const updateRegistrationMutation = useMutation({
    mutationFn: async ({ id, registered, registration_number }) => {
      return await base44.entities.TaxRegion.update(id, { registered, registration_number });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tax-regions']);
      alert("✅ Registration updated!");
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
          onClick={() => navigate(createPageUrl("TaxManagement"))}
          className="text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tax Management
        </Button>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <MapPin className="w-10 h-10 text-blue-400" />
              Tax Regions
            </h1>
            <p className="text-gray-400">Manage where you collect and remit taxes</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Tax Region
          </Button>
        </div>

        {/* Add Region Form */}
        {showForm && (
          <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Add New Tax Region</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              createRegionMutation.mutate();
            }} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">State *</label>
                  <select
                    value={regionData.state_code}
                    onChange={(e) => {
                      const state = US_STATES.find(s => s.code === e.target.value);
                      setRegionData({
                        ...regionData,
                        state_code: e.target.value,
                        region_name: state?.name || "",
                        tax_rate: state?.rate || 6.0
                      });
                    }}
                    required
                    className="w-full p-3 rounded-lg bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="">Select state...</option>
                    {US_STATES.map((state) => (
                      <option key={state.code} value={state.code}>
                        {state.name} ({state.code}) - {state.rate}%
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Tax Rate (%) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={regionData.tax_rate}
                    onChange={(e) => setRegionData({...regionData, tax_rate: parseFloat(e.target.value)})}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Sales Threshold ($)</label>
                  <Input
                    type="number"
                    value={regionData.threshold_amount}
                    onChange={(e) => setRegionData({...regionData, threshold_amount: parseFloat(e.target.value)})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">Default: $100,000</p>
                </div>

                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Switch
                      checked={regionData.registered}
                      onCheckedChange={(checked) => setRegionData({...regionData, registered: checked})}
                    />
                    <span className="text-gray-300">Registered with State</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createRegionMutation.isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Add Tax Region
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Tax Regions List */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">
            States You're Collecting In ({taxRegions.filter(r => r.collect_tax).length})
          </h2>

          {taxRegions.length === 0 ? (
            <p className="text-gray-400 text-center py-12">No tax regions configured</p>
          ) : (
            <div className="space-y-4">
              {taxRegions.map((region) => (
                <Card key={region.id} className="p-6 bg-gray-700 border-gray-600">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {region.region_name} ({region.state_code})
                      </h3>
                      <div className="flex gap-2 mb-3">
                        {region.collect_tax ? (
                          <Badge className="bg-green-600">Collecting Tax</Badge>
                        ) : (
                          <Badge className="bg-gray-600">Not Collecting</Badge>
                        )}
                        {region.registered ? (
                          <Badge className="bg-blue-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Registered
                          </Badge>
                        ) : (
                          <Badge className="bg-red-600">
                            <XCircle className="w-3 h-3 mr-1" />
                            Not Registered
                          </Badge>
                        )}
                        {region.threshold_met && (
                          <Badge className="bg-yellow-600">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Threshold Met
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Switch
                        checked={region.collect_tax}
                        onCheckedChange={(checked) => 
                          toggleCollectionMutation.mutate({ id: region.id, collect_tax: checked })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Tax Rate</p>
                      <p className="text-white font-bold">{region.tax_rate}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Current Sales</p>
                      <p className="text-white font-bold">${region.current_sales?.toLocaleString() || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Threshold</p>
                      <p className="text-white font-bold">${region.threshold_amount?.toLocaleString()}</p>
                    </div>
                  </div>

                  {!region.registered && region.collect_tax && (
                    <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded">
                      <p className="text-red-200 text-sm mb-2">
                        ⚠️ Register with {region.region_name} before collecting sales tax
                      </p>
                      <Button
                        size="sm"
                        onClick={() => {
                          const regNumber = prompt("Enter registration/permit number:");
                          if (regNumber) {
                            updateRegistrationMutation.mutate({
                              id: region.id,
                              registered: true,
                              registration_number: regNumber
                            });
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Mark as Registered
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}