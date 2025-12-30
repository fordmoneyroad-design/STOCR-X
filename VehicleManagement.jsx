import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Car, MapPin, CheckCircle, Clock, AlertTriangle, 
  Filter, Search, TrendingUp, Eye, UserCheck, Map as MapIcon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import VehicleLocationMap from "../components/vehicles/VehicleLocationMap";
import VehicleActivityFeed from "../components/vehicles/VehicleActivityFeed";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function VehicleManagement() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [mapView, setMapView] = useState(false);
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

  const { data: allVehicles } = useQuery({
    queryKey: ['all-vehicles-management'],
    queryFn: () => base44.entities.Vehicle.list("-created_date"),
    initialData: []
  });

  const { data: activityLogs } = useQuery({
    queryKey: ['vehicle-activity-logs'],
    queryFn: () => base44.entities.ActivityLog.filter({ 
      entity_type: "Vehicle" 
    }, "-created_date", 50),
    initialData: []
  });

  const assignApproverMutation = useMutation({
    mutationFn: async ({ vehicleId, approverEmail }) => {
      await base44.entities.Vehicle.update(vehicleId, {
        assigned_approver: approverEmail
      });

      await base44.integrations.Core.SendEmail({
        to: approverEmail,
        subject: "Vehicle Approval Assignment",
        body: `You've been assigned to approve a vehicle. Please review it in the Vehicle Management dashboard.`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-vehicles-management']);
      alert("✅ Approver assigned!");
    }
  });

  const quickApproveMutation = useMutation({
    mutationFn: async (vehicleId) => {
      await base44.entities.Vehicle.update(vehicleId, {
        admin_approved: true,
        approved_by: user.email,
        approval_date: new Date().toISOString().split('T')[0],
        status: "available"
      });

      await base44.entities.ActivityLog.create({
        user_email: user.email,
        action_type: "approve_vehicle",
        action_details: `Quick approved vehicle ID: ${vehicleId}`,
        entity_type: "Vehicle",
        related_entity_id: vehicleId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-vehicles-management']);
      queryClient.invalidateQueries(['vehicle-activity-logs']);
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Categorize vehicles
  const pendingApproval = allVehicles.filter(v => v.status === "pending_approval" || !v.admin_approved);
  const recentlyApproved = allVehicles.filter(v => v.admin_approved && v.approval_date).slice(0, 20);
  const availableVehicles = allVehicles.filter(v => v.status === "available" && v.admin_approved);
  const aiGeneratedVehicles = allVehicles.filter(v => v.source === "ai_generated" || v.created_by === "ai_system");
  const manualUploads = allVehicles.filter(v => !v.source || v.source === "manual_upload");
  const recentActivity = allVehicles.slice(0, 10); // Last 10 added

  // Filter based on category and search
  let filteredVehicles = allVehicles;
  if (selectedCategory === "pending") filteredVehicles = pendingApproval;
  else if (selectedCategory === "approved") filteredVehicles = recentlyApproved;
  else if (selectedCategory === "available") filteredVehicles = availableVehicles;
  else if (selectedCategory === "ai") filteredVehicles = aiGeneratedVehicles;
  else if (selectedCategory === "manual") filteredVehicles = manualUploads;
  else if (selectedCategory === "recent") filteredVehicles = recentActivity;

  if (searchQuery) {
    filteredVehicles = filteredVehicles.filter(v =>
      v.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.location_city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.location_state?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Car className="w-10 h-10 text-orange-400" />
              Vehicle Management Center
            </h1>
            <p className="text-gray-400">Manage inventory, approvals, and vehicle tracking</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setMapView(!mapView)}
              className={mapView ? "bg-blue-600" : "bg-gray-700"}
            >
              <MapIcon className="w-5 h-5 mr-2" />
              {mapView ? "List View" : "Map View"}
            </Button>
            <Button
              onClick={() => navigate(createPageUrl("PendingVehicleApprovals"))}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Clock className="w-5 h-5 mr-2" />
              Pending ({pendingApproval.length})
            </Button>
            <Button
              onClick={() => navigate(createPageUrl("SuperAdminCars"))}
              className="bg-green-600 hover:bg-green-700"
            >
              Add Vehicle
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-6 gap-4 mb-8">
          <Card className="p-4 bg-gray-800 border-gray-700">
            <Car className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-gray-400 text-xs mb-1">Total Vehicles</p>
            <p className="text-2xl font-bold text-white">{allVehicles.length}</p>
          </Card>
          <Card className="p-4 bg-yellow-900 border-yellow-700">
            <Clock className="w-6 h-6 text-yellow-400 mb-2" />
            <p className="text-yellow-200 text-xs mb-1">Pending Approval</p>
            <p className="text-2xl font-bold text-yellow-400">{pendingApproval.length}</p>
          </Card>
          <Card className="p-4 bg-green-900 border-green-700">
            <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-green-200 text-xs mb-1">Available</p>
            <p className="text-2xl font-bold text-green-400">{availableVehicles.length}</p>
          </Card>
          <Card className="p-4 bg-purple-900 border-purple-700">
            <TrendingUp className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-purple-200 text-xs mb-1">AI Generated</p>
            <p className="text-2xl font-bold text-purple-400">{aiGeneratedVehicles.length}</p>
          </Card>
          <Card className="p-4 bg-blue-900 border-blue-700">
            <UserCheck className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-blue-200 text-xs mb-1">Manual Uploads</p>
            <p className="text-2xl font-bold text-blue-400">{manualUploads.length}</p>
          </Card>
          <Card className="p-4 bg-indigo-900 border-indigo-700">
            <TrendingUp className="w-6 h-6 text-indigo-400 mb-2" />
            <p className="text-indigo-200 text-xs mb-1">Recent Activity</p>
            <p className="text-2xl font-bold text-indigo-400">{recentActivity.length}</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Search and Filters */}
            <Card className="p-6 bg-gray-800 border-gray-700 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 flex items-center gap-2">
                  <Search className="w-5 h-5 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by make, model, VIN, location..."
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="p-2 rounded-lg bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="all">All Vehicles</option>
                    <option value="pending">Pending Approval</option>
                    <option value="approved">Recently Approved</option>
                    <option value="available">Available</option>
                    <option value="ai">AI Generated</option>
                    <option value="manual">Manual Uploads</option>
                    <option value="recent">Recent Activity</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Map View */}
            {mapView && (
              <Card className="p-6 bg-gray-800 border-gray-700 mb-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <MapIcon className="w-6 h-6 text-blue-400" />
                  Vehicle Locations ({filteredVehicles.length})
                </h3>
                <VehicleLocationMap vehicles={filteredVehicles} />
              </Card>
            )}

            {/* Vehicle List */}
            {!mapView && (
              <Card className="p-6 bg-gray-800 border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">
                  {selectedCategory === "all" ? "All Vehicles" :
                   selectedCategory === "pending" ? "Pending Approval" :
                   selectedCategory === "approved" ? "Recently Approved" :
                   selectedCategory === "available" ? "Available Vehicles" :
                   selectedCategory === "ai" ? "AI Generated" :
                   selectedCategory === "manual" ? "Manual Uploads" :
                   "Recent Activity"} ({filteredVehicles.length})
                </h3>

                <div className="space-y-4">
                  {filteredVehicles.length === 0 ? (
                    <div className="text-center py-12">
                      <Car className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-400">No vehicles found</p>
                    </div>
                  ) : (
                    filteredVehicles.map((vehicle) => (
                      <Card key={vehicle.id} className="p-4 bg-gray-700 border-gray-600">
                        <div className="flex gap-4">
                          {vehicle.images && vehicle.images[0] && (
                            <img
                              src={vehicle.images[0]}
                              alt={`${vehicle.year} ${vehicle.make}`}
                              className="w-32 h-24 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-bold text-white text-lg">
                                  {vehicle.year} {vehicle.make} {vehicle.model}
                                </h4>
                                <p className="text-sm text-gray-400">
                                  <MapPin className="w-3 h-3 inline mr-1" />
                                  {vehicle.location_city}, {vehicle.location_state}
                                </p>
                              </div>
                              <div className="flex flex-col gap-2 items-end">
                                <Badge className={
                                  vehicle.status === "available" && vehicle.admin_approved ? 'bg-green-600' :
                                  vehicle.status === "pending_approval" || !vehicle.admin_approved ? 'bg-yellow-600' :
                                  'bg-gray-600'
                                }>
                                  {vehicle.admin_approved ? '✅ Approved' : '⏳ Pending'}
                                </Badge>
                                {vehicle.source === "ai_generated" && (
                                  <Badge className="bg-purple-600 text-xs">AI Generated</Badge>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-4 gap-2 text-sm mb-3">
                              <div>
                                <p className="text-gray-400 text-xs">Price</p>
                                <p className="text-white font-semibold">${vehicle.price?.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-xs">Mileage</p>
                                <p className="text-white">{vehicle.mileage?.toLocaleString() || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-xs">Condition</p>
                                <p className="text-white capitalize">{vehicle.condition?.replace('_', ' ')}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-xs">Added</p>
                                <p className="text-white">
                                  {vehicle.created_date && new Date(vehicle.created_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => navigate(createPageUrl("CarDetails") + `?id=${vehicle.id}`)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Details
                              </Button>
                              
                              {!vehicle.admin_approved && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => quickApproveMutation.mutate(vehicle.id)}
                                    disabled={quickApproveMutation.isLoading}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Quick Approve
                                  </Button>
                                  
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      const email = prompt("Enter approver email:");
                                      if (email) {
                                        assignApproverMutation.mutate({ 
                                          vehicleId: vehicle.id, 
                                          approverEmail: email 
                                        });
                                      }
                                    }}
                                    className="bg-purple-600 hover:bg-purple-700"
                                  >
                                    <UserCheck className="w-4 h-4 mr-1" />
                                    Assign
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Activity Sidebar */}
          <div className="lg:col-span-1">
            <VehicleActivityFeed activities={activityLogs} vehicles={allVehicles} />
          </div>
        </div>
      </div>
    </div>
  );
}