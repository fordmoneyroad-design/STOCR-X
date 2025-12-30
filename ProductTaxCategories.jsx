import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Package, Plus, Edit, Trash2, AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function ProductTaxCategories() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [categoryData, setCategoryData] = useState({
    category_name: "",
    category_code: "",
    description: "",
    default_taxable: true
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

  const { data: taxCategories } = useQuery({
    queryKey: ['tax-categories'],
    queryFn: () => base44.entities.ProductTaxCategory.list(),
    initialData: []
  });

  const { data: vehicles } = useQuery({
    queryKey: ['all-vehicles'],
    queryFn: () => base44.entities.Vehicle.list(),
    initialData: []
  });

  const createCategoryMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.ProductTaxCategory.create({
        ...categoryData,
        product_count: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tax-categories']);
      alert("✅ Tax category created!");
      setShowForm(false);
      setCategoryData({
        category_name: "",
        category_code: "",
        description: "",
        default_taxable: true
      });
    }
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.ProductTaxCategory.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['tax-categories']);
      alert("✅ Category deleted!");
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const uncategorizedCount = vehicles.length - taxCategories.reduce((sum, cat) => sum + (cat.product_count || 0), 0);

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
              <Package className="w-10 h-10 text-purple-400" />
              Product Tax Categories
            </h1>
            <p className="text-gray-400">Improve tax accuracy with product categorization</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Uncategorized Warning */}
        {uncategorizedCount > 0 && (
          <Card className="p-6 bg-yellow-900/30 border-yellow-700 mb-8">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
              <div>
                <h3 className="text-lg font-bold text-white">Uncategorized Products: {uncategorizedCount}</h3>
                <p className="text-yellow-200 text-sm">
                  Assign tax categories to improve regional tax rate accuracy
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Add Category Form */}
        {showForm && (
          <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Add Tax Category</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              createCategoryMutation.mutate();
            }} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Category Name *</label>
                  <Input
                    value={categoryData.category_name}
                    onChange={(e) => setCategoryData({...categoryData, category_name: e.target.value})}
                    required
                    placeholder="e.g., Vehicles"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Category Code *</label>
                  <Input
                    value={categoryData.category_code}
                    onChange={(e) => setCategoryData({...categoryData, category_code: e.target.value.toUpperCase()})}
                    required
                    placeholder="e.g., VEH"
                    maxLength={10}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-gray-300 text-sm mb-2 block">Description</label>
                  <Textarea
                    value={categoryData.description}
                    onChange={(e) => setCategoryData({...categoryData, description: e.target.value})}
                    placeholder="What products fall under this category..."
                    className="bg-gray-700 border-gray-600 text-white h-24"
                  />
                </div>

                <div className="flex items-center pt-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={categoryData.default_taxable}
                      onChange={(e) => setCategoryData({...categoryData, default_taxable: e.target.checked})}
                      className="w-5 h-5"
                    />
                    <span className="text-gray-300">Taxable by Default</span>
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
                  disabled={createCategoryMutation.isLoading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Create Category
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Categories List */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">
            Tax Categories ({taxCategories.length})
          </h2>

          {taxCategories.length === 0 ? (
            <p className="text-gray-400 text-center py-12">No tax categories configured</p>
          ) : (
            <div className="space-y-4">
              {taxCategories.map((category) => (
                <Card key={category.id} className="p-6 bg-gray-700 border-gray-600">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{category.category_name}</h3>
                        <Badge className="bg-purple-600">{category.category_code}</Badge>
                        {category.default_taxable ? (
                          <Badge className="bg-green-600">Taxable</Badge>
                        ) : (
                          <Badge className="bg-gray-600">Non-Taxable</Badge>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{category.description}</p>
                      <p className="text-sm text-gray-500">
                        {category.product_count || 0} products in this category
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (confirm("Delete this category?")) {
                          deleteCategoryMutation.mutate(category.id);
                        }
                      }}
                      disabled={deleteCategoryMutation.isLoading}
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

        {/* Info Card */}
        <Card className="p-6 bg-blue-900/30 border-blue-700 mt-8">
          <h3 className="text-lg font-bold text-white mb-3">How Tax Categories Work</h3>
          <div className="space-y-2 text-sm text-blue-200">
            <p>• Products in exempt categories won't have tax applied in any region</p>
            <p>• Categories help improve regional tax accuracy automatically</p>
            <p>• If a product has both a category and an override, the override takes priority</p>
            <p>• Categories can have special rules for specific states (coming soon)</p>
          </div>
        </Card>
      </div>
    </div>
  );
}