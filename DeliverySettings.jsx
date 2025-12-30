import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft, Truck, MapPin, Package, Plus, Edit, Trash2, GripVertical
} from "lucide-react";
import SuperAdminQuickActions from "../components/admin/SuperAdminQuickActions";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function DeliverySettings() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [deliveryData, setDeliveryData] = useState({
    name: "",
    type: "pickup_in_store",
    enabled: true,
    display_name: "",
    description: "",
    price: 0,
    estimated_days: "",
    applies_to_subscriptions: true,
    pickup_locations: []
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

  const { data: deliveryOptions } = useQuery({
    queryKey: ['delivery-options'],
    queryFn: () => base44.entities.DeliveryOption.list("sort_order"),
    initialData: []
  });

  const createOptionMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.DeliveryOption.create({
        ...deliveryData,
        price: parseFloat(deliveryData.price) || 0,
        sort_order: deliveryOptions.length
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['delivery-options']);
      alert("✅ Delivery option created!");
      setShowForm(false);
      resetForm();
    }
  });

  const updateOptionMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.DeliveryOption.update(editingOption.id, deliveryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['delivery-options']);
      alert("✅ Delivery option updated!");
      setShowForm(false);
      setEditingOption(null);
      resetForm();
    }
  });

  const deleteOptionMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.DeliveryOption.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['delivery-options']);
      alert("✅ Delivery option deleted!");
    }
  });

  const resetForm = () => {
    setDeliveryData({
      name: "",
      type: "pickup_in_store",
      enabled: true,
      display_name: "",
      description: "",
      price: 0,
      estimated_days: "",
      applies_to_subscriptions: true,
      pickup_locations: []
    });
  };

  const handleEdit = (option) => {
    setEditingOption(option);
    setDeliveryData({
      name: option.name,
      type: option.type,
      enabled: option.enabled,
      display_name: option.display_name || "",
      description: option.description || "",
      price: option.price || 0,
      estimated_days: option.estimated_days || "",
      applies_to_subscriptions: option.applies_to_subscriptions !== false,
      pickup_locations: option.pickup_locations || []
    });
    setShowForm(true);
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

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Truck className="w-10 h-10 text-blue-400" />
              Delivery Customizations
            </h1>
            <p className="text-gray-400">Control how delivery options appear at checkout</p>
          </div>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setEditingOption(null);
              resetForm();
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Delivery Option
          </Button>
        </div>

        {/* Form */}
        {showForm && (
          <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingOption ? 'Edit' : 'Add'} Delivery Option
            </h2>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (editingOption) {
                updateOptionMutation.mutate();
              } else {
                createOptionMutation.mutate();
              }
            }} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Internal Name *</label>
                  <Input
                    value={deliveryData.name}
                    onChange={(e) => setDeliveryData({...deliveryData, name: e.target.value})}
                    required
                    placeholder="e.g., Store Pickup"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Display Name</label>
                  <Input
                    value={deliveryData.display_name}
                    onChange={(e) => setDeliveryData({...deliveryData, display_name: e.target.value})}
                    placeholder="Name shown to customers"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Type *</label>
                  <select
                    value={deliveryData.type}
                    onChange={(e) => setDeliveryData({...deliveryData, type: e.target.value})}
                    className="w-full p-3 rounded-lg bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="pickup_in_store">Pickup in Store</option>
                    <option value="local_delivery">Local Delivery</option>
                    <option value="shipping">Shipping</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={deliveryData.price}
                    onChange={(e) => setDeliveryData({...deliveryData, price: e.target.value})}
                    placeholder="0.00"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-gray-300 text-sm mb-2 block">Description</label>
                  <Textarea
                    value={deliveryData.description}
                    onChange={(e) => setDeliveryData({...deliveryData, description: e.target.value})}
                    placeholder="Description shown to customers..."
                    className="bg-gray-700 border-gray-600 text-white h-24"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Estimated Time</label>
                  <Input
                    value={deliveryData.estimated_days}
                    onChange={(e) => setDeliveryData({...deliveryData, estimated_days: e.target.value})}
                    placeholder="e.g., 2-3 business days"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <Switch
                      checked={deliveryData.enabled}
                      onCheckedChange={(checked) => setDeliveryData({...deliveryData, enabled: checked})}
                    />
                    <span className="text-gray-300">Enabled</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <Switch
                      checked={deliveryData.applies_to_subscriptions}
                      onCheckedChange={(checked) => setDeliveryData({...deliveryData, applies_to_subscriptions: checked})}
                    />
                    <span className="text-gray-300">Apply to Subscriptions</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingOption(null);
                    resetForm();
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createOptionMutation.isLoading || updateOptionMutation.isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {editingOption ? 'Update' : 'Create'} Option
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Delivery Options List */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Current Delivery Options ({deliveryOptions.length})</h2>

          {deliveryOptions.length === 0 ? (
            <p className="text-gray-400 text-center py-12">No delivery options configured</p>
          ) : (
            <div className="space-y-4">
              {deliveryOptions.map((option) => (
                <Card key={option.id} className="p-6 bg-gray-700 border-gray-600">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <GripVertical className="w-5 h-5 text-gray-500 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">
                            {option.display_name || option.name}
                          </h3>
                          <Badge className={option.enabled ? 'bg-green-600' : 'bg-gray-600'}>
                            {option.enabled ? 'Active' : 'Disabled'}
                          </Badge>
                          {option.applies_to_subscriptions && (
                            <Badge className="bg-blue-600">Subscriptions</Badge>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{option.description}</p>
                        <div className="flex gap-4 text-sm text-gray-400">
                          <span>Type: {option.type?.replace('_', ' ')}</span>
                          {option.price > 0 && <span>Price: ${option.price}</span>}
                          {option.estimated_days && <span>Est: {option.estimated_days}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEdit(option)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          if (confirm("Delete this delivery option?")) {
                            deleteOptionMutation.mutate(option.id);
                          }
                        }}
                        disabled={deleteOptionMutation.isLoading}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        <SuperAdminQuickActions />
      </div>
    </div>
  );
}