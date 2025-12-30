import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft, DollarSign, Package, Truck, Plus, Edit, Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function TaxRates() {
  const [user, setUser] = useState(null);
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [overrideData, setOverrideData] = useState({
    override_name: "",
    override_type: "product",
    custom_rate: 0,
    exempt: false
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

  const { data: taxOverrides } = useQuery({
    queryKey: ['tax-overrides'],
    queryFn: () => base44.entities.TaxOverride.list(),
    initialData: []
  });

  const createOverrideMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.TaxOverride.create(overrideData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tax-overrides']);
      alert("✅ Tax override created!");
      setShowOverrideForm(false);
      setOverrideData({
        override_name: "",
        override_type: "product",
        custom_rate: 0,
        exempt: false
      });
    }
  });

  const deleteOverrideMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.TaxOverride.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tax-overrides']);
      alert("✅ Override deleted!");
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const shippingOverrides = taxOverrides.filter(o => o.override_type === 'shipping');
  const productOverrides = taxOverrides.filter(o => o.override_type === 'product');

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

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <DollarSign className="w-10 h-10 text-green-400" />
            Tax Rates & Exemptions
          </h1>
          <p className="text-gray-400">Manage tax overrides and exemptions</p>
        </div>

        <Card className="p-6 bg-blue-900/30 border-blue-700 mb-8">
          <h3 className="text-lg font-bold text-white mb-3">Tax Rate Management</h3>
          <p className="text-blue-200 text-sm">
            Automatically improve regional tax rate accuracy with product categorization.
            If a product has both an override and an assigned category, it will be taxed according 
            to the override rate (in jurisdictions where it applies). In all other jurisdictions, 
            taxes will be calculated using the product category.
          </p>
        </Card>

        <Tabs defaultValue="shipping">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-700">
            <TabsTrigger value="shipping">Shipping Overrides</TabsTrigger>
            <TabsTrigger value="product">Product Overrides</TabsTrigger>
          </TabsList>

          {/* Shipping Overrides */}
          <TabsContent value="shipping">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Truck className="w-6 h-6 text-blue-400" />
                  Shipping Tax Overrides ({shippingOverrides.length})
                </h2>
                <Button
                  onClick={() => {
                    setOverrideData({ ...overrideData, override_type: 'shipping' });
                    setShowOverrideForm(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Override
                </Button>
              </div>

              {shippingOverrides.length === 0 ? (
                <p className="text-gray-400 text-center py-12">No shipping tax overrides</p>
              ) : (
                <div className="space-y-3">
                  {shippingOverrides.map((override) => (
                    <Card key={override.id} className="p-4 bg-gray-700 border-gray-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">{override.override_name}</p>
                          <p className="text-sm text-gray-400">
                            {override.exempt ? 'Tax Exempt' : `Custom Rate: ${override.custom_rate}%`}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            if (confirm("Delete this override?")) {
                              deleteOverrideMutation.mutate(override.id);
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Product Overrides */}
          <TabsContent value="product">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Package className="w-6 h-6 text-purple-400" />
                  Product Tax Overrides ({productOverrides.length})
                </h2>
                <Button
                  onClick={() => {
                    setOverrideData({ ...overrideData, override_type: 'product' });
                    setShowOverrideForm(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Override
                </Button>
              </div>

              {productOverrides.length === 0 ? (
                <p className="text-gray-400 text-center py-12">No product tax overrides</p>
              ) : (
                <div className="space-y-3">
                  {productOverrides.map((override) => (
                    <Card key={override.id} className="p-4 bg-gray-700 border-gray-600">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">{override.override_name}</p>
                          <p className="text-sm text-gray-400">
                            {override.exempt ? 'Tax Exempt' : `Custom Rate: ${override.custom_rate}%`}
                          </p>
                          {override.reason && (
                            <p className="text-xs text-gray-500 mt-1">Reason: {override.reason}</p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => {
                            if (confirm("Delete this override?")) {
                              deleteOverrideMutation.mutate(override.id);
                            }
                          }}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Override Form */}
        {showOverrideForm && (
          <Card className="p-8 bg-gray-800 border-gray-700 mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Add Tax Override</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              createOverrideMutation.mutate();
            }} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Override Name *</label>
                  <Input
                    value={overrideData.override_name}
                    onChange={(e) => setOverrideData({...overrideData, override_name: e.target.value})}
                    required
                    placeholder="e.g., Free Shipping Tax"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Type</label>
                  <select
                    value={overrideData.override_type}
                    onChange={(e) => setOverrideData({...overrideData, override_type: e.target.value})}
                    className="w-full p-3 rounded-lg bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="product">Product</option>
                    <option value="shipping">Shipping</option>
                    <option value="customer">Customer</option>
                    <option value="category">Category</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Custom Tax Rate (%)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={overrideData.custom_rate}
                    onChange={(e) => setOverrideData({...overrideData, custom_rate: parseFloat(e.target.value)})}
                    disabled={overrideData.exempt}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={overrideData.exempt}
                      onChange={(e) => setOverrideData({
                        ...overrideData,
                        exempt: e.target.checked,
                        custom_rate: e.target.checked ? 0 : overrideData.custom_rate
                      })}
                      className="w-5 h-5"
                    />
                    <span className="text-gray-300">Tax Exempt</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowOverrideForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createOverrideMutation.isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Create Override
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}