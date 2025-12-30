import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, TrendingUp, DollarSign, MapPin, 
  Calendar, Eye, Filter, ArrowRight, BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function VehicleResearchFlow() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedState, setSelectedState] = useState("");
  const [selectedMake, setSelectedMake] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin' && currentUser.email !== "fordmoneyroad@gmail.com") {
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

  const { data: allVehicles } = useQuery({
    queryKey: ['research-vehicles'],
    queryFn: () => base44.entities.Vehicle.list("-created_date"),
    initialData: []
  });

  const { data: searchTracking } = useQuery({
    queryKey: ['search-analytics'],
    queryFn: () => base44.entities.SearchTracking.list("-created_date", 100),
    initialData: []
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Analytics
  const totalVehicles = allVehicles.length;
  const avgPrice = allVehicles.reduce((sum, v) => sum + (v.price || 0), 0) / totalVehicles || 0;
  const totalViews = allVehicles.reduce((sum, v) => sum + (v.view_count || 0), 0);
  
  // Group by make
  const makeDistribution = {};
  allVehicles.forEach(v => {
    makeDistribution[v.make] = (makeDistribution[v.make] || 0) + 1;
  });
  const topMakes = Object.entries(makeDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Group by state
  const stateDistribution = {};
  allVehicles.forEach(v => {
    if (v.location_state) {
      stateDistribution[v.location_state] = (stateDistribution[v.location_state] || 0) + 1;
    }
  });
  const topStates = Object.entries(stateDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Price ranges
  const priceRanges = {
    "Under $5k": allVehicles.filter(v => v.price < 5000).length,
    "$5k - $10k": allVehicles.filter(v => v.price >= 5000 && v.price < 10000).length,
    "$10k - $15k": allVehicles.filter(v => v.price >= 10000 && v.price < 15000).length,
    "$15k - $20k": allVehicles.filter(v => v.price >= 15000 && v.price < 20000).length,
    "$20k+": allVehicles.filter(v => v.price >= 20000).length
  };

  // Filter vehicles
  let filteredVehicles = allVehicles;
  if (searchQuery) {
    filteredVehicles = filteredVehicles.filter(v =>
      v.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  if (priceRange.min) {
    filteredVehicles = filteredVehicles.filter(v => v.price >= parseFloat(priceRange.min));
  }
  if (priceRange.max) {
    filteredVehicles = filteredVehicles.filter(v => v.price <= parseFloat(priceRange.max));
  }
  if (selectedState) {
    filteredVehicles = filteredVehicles.filter(v => v.location_state === selectedState);
  }
  if (selectedMake) {
    filteredVehicles = filteredVehicles.filter(v => v.make === selectedMake);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <BarChart3 className="w-10 h-10 text-blue-400" />
            Vehicle Research & Analytics
          </h1>
          <p className="text-gray-400">Deep insights into inventory, trends, and market data</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 border-none text-white">
            <TrendingUp className="w-8 h-8 mb-2" />
            <p className="text-blue-200 text-sm mb-1">Total Inventory</p>
            <p className="text-3xl font-bold">{totalVehicles}</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-600 to-green-700 border-none text-white">
            <DollarSign className="w-8 h-8 mb-2" />
            <p className="text-green-200 text-sm mb-1">Avg Price</p>
            <p className="text-3xl font-bold">${avgPrice.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-purple-600 to-purple-700 border-none text-white">
            <Eye className="w-8 h-8 mb-2" />
            <p className="text-purple-200 text-sm mb-1">Total Views</p>
            <p className="text-3xl font-bold">{totalViews.toLocaleString()}</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-orange-600 to-orange-700 border-none text-white">
            <MapPin className="w-8 h-8 mb-2" />
            <p className="text-orange-200 text-sm mb-1">States</p>
            <p className="text-3xl font-bold">{Object.keys(stateDistribution).length}</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Filters & Search */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Filter className="w-6 h-6 text-blue-400" />
                Advanced Filters
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Search</label>
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Make or model..."
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Price Range</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
                      placeholder="Min"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Input
                      type="number"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
                      placeholder="Max"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">State</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="">All States</option>
                    {Object.keys(stateDistribution).sort().map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Make</label>
                  <select
                    value={selectedMake}
                    onChange={(e) => setSelectedMake(e.target.value)}
                    className="w-full p-2 rounded-lg bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="">All Makes</option>
                    {Object.keys(makeDistribution).sort().map(make => (
                      <option key={make} value={make}>{make}</option>
                    ))}
                  </select>
                </div>

                <Button
                  onClick={() => {
                    setSearchQuery("");
                    setPriceRange({ min: "", max: "" });
                    setSelectedState("");
                    setSelectedMake("");
                  }}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300"
                >
                  Clear Filters
                </Button>
              </div>
            </Card>

            {/* Price Distribution */}
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h3 className="text-lg font-bold text-white mb-4">Price Distribution</h3>
              <div className="space-y-3">
                {Object.entries(priceRanges).map(([range, count]) => (
                  <div key={range} className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">{range}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500"
                          style={{ width: `${(count / totalVehicles) * 100}%` }}
                        />
                      </div>
                      <span className="text-white font-semibold text-sm w-12 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column - Results & Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Top Makes */}
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Top Makes</h3>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Make</TableHead>
                    <TableHead className="text-gray-300">Count</TableHead>
                    <TableHead className="text-gray-300">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topMakes.map(([make, count]) => (
                    <TableRow key={make} className="border-gray-700">
                      <TableCell className="text-white font-semibold">{make}</TableCell>
                      <TableCell className="text-white">{count}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-600">
                          {((count / totalVehicles) * 100).toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Top States */}
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h3 className="text-xl font-bold text-white mb-4">Top States</h3>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">State</TableHead>
                    <TableHead className="text-gray-300">Vehicles</TableHead>
                    <TableHead className="text-gray-300">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topStates.map(([state, count]) => (
                    <TableRow key={state} className="border-gray-700">
                      <TableCell className="text-white font-semibold capitalize">{state}</TableCell>
                      <TableCell className="text-white">{count}</TableCell>
                      <TableCell>
                        <Badge className="bg-green-600">
                          {((count / totalVehicles) * 100).toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Filtered Results */}
            <Card className="p-6 bg-gray-800 border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">
                  Research Results ({filteredVehicles.length})
                </h3>
                <Button
                  onClick={() => navigate(createPageUrl("VehicleManagement"))}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  View Management
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {filteredVehicles.slice(0, 20).map((vehicle) => (
                  <div key={vehicle.id} className="p-4 bg-gray-700 rounded-lg flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h4>
                      <p className="text-sm text-gray-400">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {vehicle.location_city}, {vehicle.location_state}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-400">
                        ${vehicle.price?.toLocaleString()}
                      </p>
                      <Badge className={vehicle.admin_approved ? 'bg-green-600' : 'bg-yellow-600'}>
                        {vehicle.admin_approved ? 'Approved' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}