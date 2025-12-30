import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Car, Plus, Search, CheckCircle, Clock } from "lucide-react";
import SuperAdminQuickActions from "../components/admin/SuperAdminQuickActions";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function SuperAdminCars() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [vehicleData, setVehicleData] = useState({
    make: "",
    model: "",
    year: "",
    price: "",
    condition: "runs_drives",
    damage_type: "none",
    mileage: "",
    color: "",
    vin: "",
    location_state: "",
    location_city: "",
    description: "",
    images: []
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

  const { data: pendingVehicles } = useQuery({
    queryKey: ['pending-vehicles'],
    queryFn: () => base44.entities.Vehicle.filter({ status: "pending_approval" }),
    initialData: []
  });

  const { data: approvedVehicles } = useQuery({
    queryKey: ['approved-vehicles'],
    queryFn: () => base44.entities.Vehicle.filter({ admin_approved: true }, "-created_date", 20),
    initialData: []
  });

  const addVehicleMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.Vehicle.create({
        ...vehicleData,
        year: parseInt(vehicleData.year),
        price: parseFloat(vehicleData.price),
        mileage: vehicleData.mileage ? parseFloat(vehicleData.mileage) : null,
        status: "pending_approval",
        admin_approved: false,
        category: "sedan"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-vehicles']);
      alert("✅ Vehicle added! Waiting for approval.");
      setShowForm(false);
      setVehicleData({
        make: "",
        model: "",
        year: "",
        price: "",
        condition: "runs_drives",
        damage_type: "none",
        mileage: "",
        color: "",
        vin: "",
        location_state: "",
        location_city: "",
        description: "",
        images: []
      });
    }
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedUrls = [];
    
    for (const file of files) {
      try {
        const result = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(result.file_url);
      } catch (error) {
        console.error("Upload error:", error);
      }
    }

    setVehicleData(prev => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls]
    }));
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
              <Car className="w-10 h-10 text-orange-400" />
              Vehicle Management
            </h1>
            <p className="text-gray-400">Add vehicles manually - requires approval</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Vehicle
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-yellow-900 border-yellow-700">
            <Clock className="w-8 h-8 text-yellow-400 mb-2" />
            <p className="text-yellow-200 text-sm mb-1">Pending Approval</p>
            <p className="text-3xl font-bold text-yellow-400">{pendingVehicles.length}</p>
          </Card>
          <Card className="p-6 bg-green-900 border-green-700">
            <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-green-200 text-sm mb-1">Approved</p>
            <p className="text-3xl font-bold text-green-400">{approvedVehicles.length}</p>
          </Card>
        </div>

        {/* Add Vehicle Form */}
        {showForm && (
          <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Add New Vehicle</h2>

            <form onSubmit={(e) => {
              e.preventDefault();
              addVehicleMutation.mutate();
            }} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Make *</label>
                  <Input
                    value={vehicleData.make}
                    onChange={(e) => setVehicleData({...vehicleData, make: e.target.value})}
                    required
                    placeholder="Toyota"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Model *</label>
                  <Input
                    value={vehicleData.model}
                    onChange={(e) => setVehicleData({...vehicleData, model: e.target.value})}
                    required
                    placeholder="Camry"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Year *</label>
                  <Input
                    type="number"
                    value={vehicleData.year}
                    onChange={(e) => setVehicleData({...vehicleData, year: e.target.value})}
                    required
                    placeholder="2019"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Price *</label>
                  <Input
                    type="number"
                    value={vehicleData.price}
                    onChange={(e) => setVehicleData({...vehicleData, price: e.target.value})}
                    required
                    placeholder="18000"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Mileage</label>
                  <Input
                    type="number"
                    value={vehicleData.mileage}
                    onChange={(e) => setVehicleData({...vehicleData, mileage: e.target.value})}
                    placeholder="45000"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Color</label>
                  <Input
                    value={vehicleData.color}
                    onChange={(e) => setVehicleData({...vehicleData, color: e.target.value})}
                    placeholder="Black"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">VIN</label>
                  <Input
                    value={vehicleData.vin}
                    onChange={(e) => setVehicleData({...vehicleData, vin: e.target.value})}
                    placeholder="1HGBH41JXMN109186"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Condition *</label>
                  <select
                    value={vehicleData.condition}
                    onChange={(e) => setVehicleData({...vehicleData, condition: e.target.value})}
                    className="w-full p-3 rounded-lg bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="runs_drives">Runs & Drives</option>
                    <option value="runs_only">Runs Only</option>
                    <option value="does_not_run">Does Not Run</option>
                    <option value="parts_only">Parts Only</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Damage Type</label>
                  <select
                    value={vehicleData.damage_type}
                    onChange={(e) => setVehicleData({...vehicleData, damage_type: e.target.value})}
                    className="w-full p-3 rounded-lg bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="none">No Damage</option>
                    <option value="hail">Hail Damage</option>
                    <option value="front_end">Front End Damage</option>
                    <option value="back_end">Back End Damage</option>
                    <option value="normal_wear">Normal Wear & Tear</option>
                    <option value="minor_dents_scratches">Minor Dents/Scratches</option>
                    <option value="major_damage">Major Damage</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">State *</label>
                  <Input
                    value={vehicleData.location_state}
                    onChange={(e) => setVehicleData({...vehicleData, location_state: e.target.value})}
                    required
                    placeholder="Michigan"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">City *</label>
                  <Input
                    value={vehicleData.location_city}
                    onChange={(e) => setVehicleData({...vehicleData, location_city: e.target.value})}
                    required
                    placeholder="Detroit"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Description</label>
                <Textarea
                  value={vehicleData.description}
                  onChange={(e) => setVehicleData({...vehicleData, description: e.target.value})}
                  placeholder="Detailed vehicle description..."
                  className="bg-gray-700 border-gray-600 text-white h-24"
                />
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Images</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
                {vehicleData.images.length > 0 && (
                  <div className="grid grid-cols-5 gap-3 mt-4">
                    {vehicleData.images.map((url, idx) => (
                      <img key={idx} src={url} alt={`Vehicle ${idx + 1}`} className="w-full h-24 object-cover rounded" />
                    ))}
                  </div>
                )}
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
                  disabled={addVehicleMutation.isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {addVehicleMutation.isLoading ? "Adding..." : "Add Vehicle (Pending Approval)"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Pending Vehicles */}
        {pendingVehicles.length > 0 && (
          <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-yellow-400" />
              Pending Approval ({pendingVehicles.length})
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              {pendingVehicles.map((vehicle) => (
                <Card key={vehicle.id} className="p-4 bg-yellow-900/20 border-yellow-700">
                  {vehicle.images && vehicle.images[0] && (
                    <img
                      src={vehicle.images[0]}
                      alt={`${vehicle.year} ${vehicle.make}`}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-bold text-white mb-2">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-300">${vehicle.price?.toLocaleString()}</p>
                    <Badge className="bg-yellow-600">Pending Approval</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Recently Approved */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-400" />
            Recently Approved
          </h2>
          <div className="grid md:grid-cols-5 gap-4">
            {approvedVehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-gray-700 rounded-lg p-3">
                {vehicle.images && vehicle.images[0] && (
                  <img
                    src={vehicle.images[0]}
                    alt={`${vehicle.year} ${vehicle.make}`}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                )}
                <p className="text-white font-semibold text-sm">
                  {vehicle.year} {vehicle.make}
                </p>
                <p className="text-gray-400 text-xs">{vehicle.model}</p>
                <Badge className="mt-2 text-xs bg-green-600">Approved</Badge>
              </div>
            ))}
          </div>
        </Card>

        <SuperAdminQuickActions />
      </div>
    </div>
  );
}