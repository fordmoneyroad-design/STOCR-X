import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Wrench, ArrowLeft, Plus, CheckCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

const MAINTENANCE_TYPES = [
  "Oil Change",
  "Tire Rotation",
  "Brake Inspection",
  "Body Work",
  "Paint Work",
  "Engine Repair",
  "Transmission Service",
  "AC Service",
  "State Inspection",
  "Detailing",
  "Other"
];

export default function MaintenanceTracking() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_id: "",
    maintenance_type: "Oil Change",
    location: "",
    performed_by: "",
    cost: "",
    notes: "",
    service_date: new Date().toISOString().split('T')[0]
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

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles-maintenance'],
    queryFn: () => base44.entities.Vehicle.list("-created_date"),
    initialData: []
  });

  const { data: maintenanceRecords } = useQuery({
    queryKey: ['maintenance-records'],
    queryFn: () => base44.entities.Document.filter({ document_type: "maintenance_record" }),
    initialData: []
  });

  const createMaintenanceMutation = useMutation({
    mutationFn: (data) => base44.entities.Document.create({
      customer_email: "MAINTENANCE_LOG",
      document_type: "maintenance_record",
      document_url: "N/A",
      uploaded_by: user.email,
      notes: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['maintenance-records']);
      setShowForm(false);
      setFormData({
        vehicle_id: "",
        maintenance_type: "Oil Change",
        location: "",
        performed_by: "",
        cost: "",
        notes: "",
        service_date: new Date().toISOString().split('T')[0]
      });
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    createMaintenanceMutation.mutate(formData);
  };

  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle';
  };

  const recordsByVehicle = {};
  maintenanceRecords.forEach(record => {
    try {
      const data = JSON.parse(record.notes);
      if (!recordsByVehicle[data.vehicle_id]) {
        recordsByVehicle[data.vehicle_id] = [];
      }
      recordsByVehicle[data.vehicle_id].push({
        ...data,
        created_date: record.created_date
      });
    } catch (e) {
      // Skip invalid records
    }
  });

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
              <Wrench className="w-10 h-10 text-orange-400" />
              Maintenance Tracking
            </h1>
            <p className="text-gray-400">Track service history for all vehicles</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Log Maintenance
          </Button>
        </div>

        {/* Add Form */}
        {showForm && (
          <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Log Maintenance Service</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300 mb-2 block">Vehicle *</Label>
                  <select
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})}
                    required
                    className="w-full p-2 rounded-lg bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="">Select Vehicle...</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.year} {v.make} {v.model} - {v.vin || v.id.slice(0, 8)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-gray-300 mb-2 block">Maintenance Type *</Label>
                  <select
                    value={formData.maintenance_type}
                    onChange={(e) => setFormData({...formData, maintenance_type: e.target.value})}
                    required
                    className="w-full p-2 rounded-lg bg-gray-700 border-gray-600 text-white"
                  >
                    {MAINTENANCE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-gray-300 mb-2 block">Service Date *</Label>
                  <Input
                    type="date"
                    value={formData.service_date}
                    onChange={(e) => setFormData({...formData, service_date: e.target.value})}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300 mb-2 block">Location/Shop *</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                    placeholder="ABC Auto Repair, Detroit"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300 mb-2 block">Performed By *</Label>
                  <Input
                    value={formData.performed_by}
                    onChange={(e) => setFormData({...formData, performed_by: e.target.value})}
                    required
                    placeholder="John Mechanic"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300 mb-2 block">Cost *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    required
                    placeholder="150.00"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label className="text-gray-300 mb-2 block">Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Additional details about the service..."
                    className="bg-gray-700 border-gray-600 text-white h-24"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Log Maintenance
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Records by Vehicle */}
        {Object.keys(recordsByVehicle).length === 0 ? (
          <Card className="p-12 text-center bg-gray-800 border-gray-700">
            <Wrench className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-2xl font-bold text-white mb-2">No Maintenance Records</h3>
            <p className="text-gray-400 mb-6">Start logging vehicle maintenance to track service history</p>
          </Card>
        ) : (
          Object.entries(recordsByVehicle).map(([vehicleId, records]) => (
            <Card key={vehicleId} className="p-6 bg-gray-800 border-gray-700 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                {getVehicleInfo(vehicleId)}
              </h2>
              <Badge className="mb-4 bg-blue-600">{records.length} Service Records</Badge>
              
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Type</TableHead>
                    <TableHead className="text-gray-300">Location</TableHead>
                    <TableHead className="text-gray-300">Performed By</TableHead>
                    <TableHead className="text-gray-300">Cost</TableHead>
                    <TableHead className="text-gray-300">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.sort((a, b) => new Date(b.service_date) - new Date(a.service_date)).map((record, idx) => (
                    <TableRow key={idx} className="border-gray-700">
                      <TableCell className="text-white">
                        {new Date(record.service_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-purple-600">{record.maintenance_type}</Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">{record.location}</TableCell>
                      <TableCell className="text-gray-300">{record.performed_by}</TableCell>
                      <TableCell className="text-green-400 font-bold">
                        ${parseFloat(record.cost).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-gray-400 text-sm">{record.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}