import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle, X, Eye, Clock } from "lucide-react";
import SuperAdminQuickActions from "../components/admin/SuperAdminQuickActions";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function PendingVehicleApprovals() {
  const [user, setUser] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
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

  const { data: pendingVehicles } = useQuery({
    queryKey: ['pending-vehicle-approvals'],
    queryFn: () => base44.entities.Vehicle.filter({ status: "pending_approval", admin_approved: false }),
    initialData: []
  });

  const approveMutation = useMutation({
    mutationFn: (vehicleId) => base44.entities.Vehicle.update(vehicleId, {
      admin_approved: true,
      approved_by: user.email,
      approval_date: new Date().toISOString().split('T')[0],
      status: "available"
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-vehicle-approvals']);
      setSelectedVehicle(null);
      alert("✅ Vehicle approved and now available!");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (vehicleId) => base44.entities.Vehicle.delete(vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-vehicle-approvals']);
      setSelectedVehicle(null);
      setRejectionReason("");
      alert("❌ Vehicle rejected and removed");
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

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Clock className="w-10 h-10 text-yellow-400" />
            Pending Vehicle Approvals
          </h1>
          <p className="text-gray-400">Review and approve vehicles before they go live</p>
        </div>

        {/* Stats */}
        <Card className="p-6 bg-yellow-900 border-yellow-700 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-200 text-sm mb-1">Pending Approval</p>
              <p className="text-4xl font-bold text-yellow-400">{pendingVehicles.length}</p>
            </div>
            <Clock className="w-16 h-16 text-yellow-400" />
          </div>
        </Card>

        {/* Vehicle Detail Modal */}
        {selectedVehicle && (
          <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Review Vehicle: {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                {selectedVehicle.images && selectedVehicle.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedVehicle.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Vehicle ${idx + 1}`}
                        className="w-full h-40 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-700 h-80 rounded-lg flex items-center justify-center">
                    <p className="text-gray-400">No images</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Make</p>
                    <p className="text-white font-semibold">{selectedVehicle.make}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Model</p>
                    <p className="text-white font-semibold">{selectedVehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Year</p>
                    <p className="text-white font-semibold">{selectedVehicle.year}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Price</p>
                    <p className="text-white font-semibold">${selectedVehicle.price?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Mileage</p>
                    <p className="text-white font-semibold">{selectedVehicle.mileage?.toLocaleString() || 'N/A'} mi</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Color</p>
                    <p className="text-white font-semibold">{selectedVehicle.color || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Condition</p>
                    <Badge className="bg-blue-600">{selectedVehicle.condition?.replace('_', ' ')}</Badge>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Damage Type</p>
                    <Badge className="bg-orange-600">{selectedVehicle.damage_type?.replace('_', ' ')}</Badge>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">State</p>
                    <p className="text-white font-semibold">{selectedVehicle.location_state || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">City</p>
                    <p className="text-white font-semibold">{selectedVehicle.location_city || 'N/A'}</p>
                  </div>
                </div>

                {selectedVehicle.description && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Description</p>
                    <p className="text-white bg-gray-700 p-3 rounded">{selectedVehicle.description}</p>
                  </div>
                )}

                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Rejection Reason (optional)</label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Reason for rejection..."
                    className="bg-gray-700 border-gray-600 text-white h-20"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setSelectedVehicle(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => rejectMutation.mutate(selectedVehicle.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => approveMutation.mutate(selectedVehicle.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Pending Vehicles Grid */}
        {pendingVehicles.length === 0 ? (
          <Card className="p-12 bg-gray-800 border-gray-700 text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg">No pending vehicle approvals</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {pendingVehicles.map((vehicle) => (
              <Card key={vehicle.id} className="p-6 bg-gray-800 border-yellow-700">
                {vehicle.images && vehicle.images[0] && (
                  <img
                    src={vehicle.images[0]}
                    alt={`${vehicle.year} ${vehicle.make}`}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="font-bold text-white text-lg mb-2">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Price</span>
                    <span className="text-white font-semibold">${vehicle.price?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Mileage</span>
                    <span className="text-white">{vehicle.mileage?.toLocaleString() || 'N/A'} mi</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Location</span>
                    <span className="text-white text-sm">{vehicle.location_city}, {vehicle.location_state}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-orange-600">{vehicle.damage_type?.replace('_', ' ')}</Badge>
                    <Badge className="bg-blue-600">{vehicle.condition?.replace('_', ' ')}</Badge>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedVehicle(vehicle)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Review
                </Button>
              </Card>
            ))}
          </div>
        )}

        <SuperAdminQuickActions />
      </div>
    </div>
  );
}