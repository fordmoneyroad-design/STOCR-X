import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, CheckCircle, XCircle, ExternalLink, Search, Filter, Car } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function CopartWatchlist() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCondition, setFilterCondition] = useState("all");
  const [filterDamage, setFilterDamage] = useState("all");
  const [filterTier, setFilterTier] = useState("all");
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

  const { data: watchlist } = useQuery({
    queryKey: ['copart-watchlist'],
    queryFn: () => base44.entities.CopartWatchlist.list("-created_date"),
    initialData: []
  });

  const approveVehicleMutation = useMutation({
    mutationFn: (id) => base44.entities.CopartWatchlist.update(id, { status: "approved_for_import" }),
    onSuccess: () => {
      queryClient.invalidateQueries(['copart-watchlist']);
      alert("✅ Vehicle approved for import!");
    }
  });

  const importToInventoryMutation = useMutation({
    mutationFn: async (watchlistItem) => {
      // Create vehicle from watchlist data
      const vehicleData = {
        make: watchlistItem.vehicle_make,
        model: watchlistItem.vehicle_model,
        year: watchlistItem.vehicle_year,
        vin: watchlistItem.vin,
        price: watchlistItem.estimated_total_cost || watchlistItem.buy_now_price || 0,
        condition: watchlistItem.condition,
        damage_type: watchlistItem.damage_type,
        images: watchlistItem.images || [],
        location_city: watchlistItem.location_city,
        location_state: watchlistItem.location_state,
        requires_tier: watchlistItem.subscription_tier_target,
        status: "pending_approval",
        source: "copart_import"
      };
      
      await base44.entities.Vehicle.create(vehicleData);
      await base44.entities.CopartWatchlist.update(watchlistItem.id, { status: "imported" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['copart-watchlist']);
      alert("✅ Vehicle imported to inventory!");
    }
  });

  const filteredWatchlist = watchlist.filter(item => {
    const matchesSearch = !searchQuery || 
      item?.vehicle_make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item?.vehicle_model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item?.copart_lot_number?.includes(searchQuery);
    
    const matchesStatus = filterStatus === "all" || item?.status === filterStatus;
    const matchesCondition = filterCondition === "all" || item?.condition === filterCondition;
    const matchesDamage = filterDamage === "all" || item?.damage_type === filterDamage;
    const matchesTier = filterTier === "all" || item?.subscription_tier_target === filterTier;

    return matchesSearch && matchesStatus && matchesCondition && matchesDamage && matchesTier;
  });

  const stats = {
    total: watchlist.length,
    watching: watchlist.filter(v => v?.status === 'watching').length,
    approved: watchlist.filter(v => v?.status === 'approved_for_import').length,
    needsReview: watchlist.filter(v => v?.status === 'needs_review').length,
    imported: watchlist.filter(v => v?.status === 'imported').length
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Eye className="w-10 h-10 text-green-400" />
            Copart Watchlist
          </h1>
          <p className="text-gray-400">Monitor and approve vehicles from Copart</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <Card className="p-6 bg-blue-900 border-blue-700">
            <p className="text-blue-200 text-sm">Total Watched</p>
            <p className="text-4xl font-bold text-white">{stats.total}</p>
          </Card>
          <Card className="p-6 bg-purple-900 border-purple-700">
            <p className="text-purple-200 text-sm">Watching</p>
            <p className="text-4xl font-bold text-white">{stats.watching}</p>
          </Card>
          <Card className="p-6 bg-green-900 border-green-700">
            <p className="text-green-200 text-sm">Approved</p>
            <p className="text-4xl font-bold text-white">{stats.approved}</p>
          </Card>
          <Card className="p-6 bg-yellow-900 border-yellow-700">
            <p className="text-yellow-200 text-sm">Needs Review</p>
            <p className="text-4xl font-bold text-white">{stats.needsReview}</p>
          </Card>
          <Card className="p-6 bg-cyan-900 border-cyan-700">
            <p className="text-cyan-200 text-sm">Imported</p>
            <p className="text-4xl font-bold text-white">{stats.imported}</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
          <div className="grid md:grid-cols-6 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search make, model, lot..."
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="watching">Watching</SelectItem>
                <SelectItem value="approved_for_import">Approved</SelectItem>
                <SelectItem value="needs_review">Needs Review</SelectItem>
                <SelectItem value="imported">Imported</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCondition} onValueChange={setFilterCondition}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                <SelectItem value="runs_drives">Runs & Drives</SelectItem>
                <SelectItem value="runs_only">Runs Only</SelectItem>
                <SelectItem value="does_not_run">Does Not Run</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterDamage} onValueChange={setFilterDamage}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Damage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Damage Types</SelectItem>
                <SelectItem value="none">No Damage</SelectItem>
                <SelectItem value="hail">Hail</SelectItem>
                <SelectItem value="normal_wear">Normal Wear</SelectItem>
                <SelectItem value="minor_dents_scratches">Minor Dents/Scratches</SelectItem>
                <SelectItem value="front_end">Front End</SelectItem>
                <SelectItem value="rear_end">Rear End</SelectItem>
                <SelectItem value="side_damage">Side Damage</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterTier} onValueChange={setFilterTier}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="high_end">High-End</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
                setFilterCondition("all");
                setFilterDamage("all");
                setFilterTier("all");
              }}
              variant="outline"
              className="border-gray-600 hover:bg-gray-700"
            >
              Clear Filters
            </Button>
          </div>
        </Card>

        {/* Vehicle List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWatchlist.map((vehicle) => (
            <Card key={vehicle.id} className="p-6 bg-gray-800 border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {vehicle.vehicle_year} {vehicle.vehicle_make} {vehicle.vehicle_model}
                  </h3>
                  <p className="text-sm text-gray-400">Lot: {vehicle.copart_lot_number}</p>
                </div>
                <Badge className={
                  vehicle.status === 'approved_for_import' ? 'bg-green-600' :
                  vehicle.status === 'needs_review' ? 'bg-yellow-600' :
                  vehicle.status === 'imported' ? 'bg-cyan-600' : 'bg-blue-600'
                }>
                  {vehicle.status?.replace(/_/g, ' ')}
                </Badge>
              </div>

              {vehicle.images && vehicle.images.length > 0 && (
                <img
                  src={vehicle.images[0]}
                  alt={`${vehicle.vehicle_make} ${vehicle.vehicle_model}`}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Condition:</span>
                  <Badge className="bg-blue-600">{vehicle.condition?.replace(/_/g, ' ')}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Damage:</span>
                  <Badge className="bg-orange-600">{vehicle.damage_type?.replace(/_/g, ' ')}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Title:</span>
                  <Badge className={vehicle.title_status === 'clean' ? 'bg-green-600' : 'bg-red-600'}>
                    {vehicle.title_status}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Target Tier:</span>
                  <Badge className="bg-purple-600">{vehicle.subscription_tier_target}</Badge>
                </div>
                {vehicle.buy_now_price > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Buy Now:</span>
                    <span className="text-white font-bold">${vehicle.buy_now_price?.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {vehicle.ai_notes && (
                <p className="text-xs text-gray-400 mb-4 italic">{vehicle.ai_notes}</p>
              )}

              <div className="flex gap-2">
                {vehicle.status === 'needs_review' && (
                  <Button
                    size="sm"
                    onClick={() => approveVehicleMutation.mutate(vehicle.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                )}
                {vehicle.status === 'approved_for_import' && (
                  <Button
                    size="sm"
                    onClick={() => importToInventoryMutation.mutate(vehicle)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Car className="w-4 h-4 mr-1" />
                    Import
                  </Button>
                )}
                {vehicle.copart_url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(vehicle.copart_url, '_blank')}
                    className="flex-1 border-gray-600 hover:bg-gray-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredWatchlist.length === 0 && (
          <Card className="p-12 bg-gray-800 border-gray-700 text-center">
            <Eye className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-2xl font-bold text-white mb-2">No vehicles in watchlist</h2>
            <p className="text-gray-400 mb-6">Import vehicles from Copart to get started</p>
            <Button
              onClick={() => window.location.href = '/CopartImporter'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Go to Importer
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}