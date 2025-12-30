import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, Plus, ShoppingCart } from "lucide-react";
import SuperAdminQuickActions from "../components/admin/SuperAdminQuickActions";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

const STOCRX_SUPPLIES = [
  { name: "STOCRX Branded T-Shirt", price: 25, category: "Apparel", stock: 50 },
  { name: "STOCRX Hoodie", price: 45, category: "Apparel", stock: 30 },
  { name: "STOCRX Baseball Cap", price: 20, category: "Apparel", stock: 75 },
  { name: "STOCRX Window Decal", price: 5, category: "Accessories", stock: 200 },
  { name: "STOCRX License Plate Frame", price: 15, category: "Accessories", stock: 100 },
  { name: "STOCRX Air Freshener", price: 8, category: "Accessories", stock: 150 },
  { name: "STOCRX Keychain", price: 10, category: "Accessories", stock: 120 },
  { name: "STOCRX Water Bottle", price: 18, category: "Accessories", stock: 80 },
  { name: "STOCRX Phone Mount", price: 22, category: "Tech", stock: 60 },
  { name: "STOCRX USB Charger", price: 15, category: "Tech", stock: 90 }
];

export default function InventorySupplyList() {
  const [user, setUser] = useState(null);

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const categories = [...new Set(STOCRX_SUPPLIES.map(s => s.category))];

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
              <Package className="w-10 h-10 text-amber-400" />
              STOCRX Branded Supply Inventory
            </h1>
            <p className="text-gray-400">Manage branded merchandise and supplies</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-5 h-5 mr-2" />
            Add New Item
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Items</p>
            <p className="text-3xl font-bold text-white">{STOCRX_SUPPLIES.length}</p>
          </Card>
          <Card className="p-6 bg-gray-800 border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Stock</p>
            <p className="text-3xl font-bold text-white">
              {STOCRX_SUPPLIES.reduce((sum, s) => sum + s.stock, 0)}
            </p>
          </Card>
          <Card className="p-6 bg-gray-800 border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Categories</p>
            <p className="text-3xl font-bold text-white">{categories.length}</p>
          </Card>
          <Card className="p-6 bg-gray-800 border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Avg Price</p>
            <p className="text-3xl font-bold text-white">
              ${(STOCRX_SUPPLIES.reduce((sum, s) => sum + s.price, 0) / STOCRX_SUPPLIES.length).toFixed(0)}
            </p>
          </Card>
        </div>

        {/* Items by Category */}
        {categories.map((category) => (
          <Card key={category} className="p-6 bg-gray-800 border-gray-700 mb-6">
            <h2 className="text-2xl font-bold text-white mb-6">{category}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {STOCRX_SUPPLIES.filter(s => s.category === category).map((item, idx) => (
                <Card key={idx} className="p-4 bg-gray-700 border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-white">{item.name}</h3>
                    <Badge className={item.stock > 50 ? 'bg-green-600' : item.stock > 20 ? 'bg-yellow-600' : 'bg-red-600'}>
                      {item.stock} in stock
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-blue-400 mb-3">${item.price}</p>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Order
                  </Button>
                </Card>
              ))}
            </div>
          </Card>
        ))}

        <SuperAdminQuickActions />
      </div>
    </div>
  );
}