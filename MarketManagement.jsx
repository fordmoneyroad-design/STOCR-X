import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft, Globe, Plus, Edit, Trash2, DollarSign, Map
} from "lucide-react";
import SuperAdminQuickActions from "../components/admin/SuperAdminQuickActions";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function MarketManagement() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingMarket, setEditingMarket] = useState(null);
  const [marketData, setMarketData] = useState({
    market_name: "",
    type: "region",
    countries: ["United States"],
    currency: "USD",
    language: "en",
    enabled: true
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

  const { data: markets } = useQuery({
    queryKey: ['markets'],
    queryFn: () => base44.entities.Market.list("-created_date"),
    initialData: []
  });

  const createMarketMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.Market.create(marketData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['markets']);
      alert("✅ Market created!");
      setShowForm(false);
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const usMarket = markets.find(m => m.countries?.includes("United States"));

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
            <Globe className="w-10 h-10 text-blue-400" />
            Markets Management
          </h1>
          <p className="text-gray-400">Manage regional markets and international expansion</p>
        </div>

        {/* US Market Card */}
        <Card className="p-8 bg-gradient-to-br from-blue-900 to-indigo-900 border-blue-700 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">🇺🇸 United States</h2>
              <p className="text-blue-200">Primary market • Active</p>
            </div>
            <Badge className="bg-green-600 text-white text-lg px-4 py-2">
              {usMarket?.customizations_count || 1} Customization
            </Badge>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
              <DollarSign className="w-8 h-8 text-green-400 mb-2" />
              <p className="text-white font-bold text-2xl">USD</p>
              <p className="text-blue-200 text-sm">Currency</p>
            </div>
            <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
              <Globe className="w-8 h-8 text-purple-400 mb-2" />
              <p className="text-white font-bold text-2xl">EN</p>
              <p className="text-blue-200 text-sm">Language</p>
            </div>
            <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
              <Map className="w-8 h-8 text-yellow-400 mb-2" />
              <p className="text-white font-bold text-2xl">50</p>
              <p className="text-blue-200 text-sm">States</p>
            </div>
            <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
              <Edit className="w-8 h-8 text-cyan-400 mb-2" />
              <p className="text-white font-bold text-2xl">Active</p>
              <p className="text-blue-200 text-sm">Status</p>
            </div>
          </div>
        </Card>

        {/* International Markets */}
        <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">International Markets</h2>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create International Market
            </Button>
          </div>

          {showForm && (
            <Card className="p-6 bg-gray-700 border-gray-600 mb-6">
              <h3 className="text-lg font-bold text-white mb-4">New Market</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                createMarketMutation.mutate();
              }} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Market Name *</label>
                    <Input
                      value={marketData.market_name}
                      onChange={(e) => setMarketData({...marketData, market_name: e.target.value})}
                      required
                      placeholder="e.g., Canada, Mexico"
                      className="bg-gray-600 border-gray-500 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Currency *</label>
                    <select
                      value={marketData.currency}
                      onChange={(e) => setMarketData({...marketData, currency: e.target.value})}
                      className="w-full p-3 rounded-lg bg-gray-600 border-gray-500 text-white"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="MXN">MXN - Mexican Peso</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="button" onClick={() => setShowForm(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMarketMutation.isLoading} className="flex-1 bg-blue-600">
                    Create Market
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {markets.filter(m => !m.countries?.includes("United States")).length === 0 ? (
            <p className="text-gray-400 text-center py-8">No international markets yet</p>
          ) : (
            <div className="space-y-3">
              {markets.filter(m => !m.countries?.includes("United States")).map((market) => (
                <Card key={market.id} className="p-4 bg-gray-700 border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white text-lg">{market.market_name}</p>
                      <p className="text-sm text-gray-400">
                        {market.currency} • {market.language}
                      </p>
                    </div>
                    <Badge className={market.enabled ? 'bg-green-600' : 'bg-gray-600'}>
                      {market.enabled ? 'Active' : 'Disabled'}
                    </Badge>
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