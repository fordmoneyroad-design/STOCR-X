import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, ArrowLeft, Plus, Clock, CheckCircle, X, Navigation } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

const CITIES = [
  "Detroit, MI", "Grand Rapids, MI", "Ann Arbor, MI", "Lansing, MI",
  "Chicago, IL", "Indianapolis, IN", "Cleveland, OH", "Columbus, OH",
  "Milwaukee, WI", "Minneapolis, MN", "St. Louis, MO", "Kansas City, MO"
];

export default function CallCenterDispatch() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    request_type: "tow_truck",
    city: "Detroit, MI",
    pickup_location: "",
    dropoff_location: "",
    vehicle_id: "",
    customer_email: "",
    priority: "medium",
    notes: ""
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.email !== SUPER_ADMIN_EMAIL && currentUser.role !== 'admin' && currentUser.department !== 'incidents') {
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

  const { data: dispatches } = useQuery({
    queryKey: ['dispatch-requests'],
    queryFn: () => base44.entities.DispatchRequest.list("-created_date", 100),
    initialData: []
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles-dispatch'],
    queryFn: () => base44.entities.Vehicle.list("-created_date"),
    initialData: []
  });

  const createDispatchMutation = useMutation({
    mutationFn: async (data) => {
      // Mock geocoding (in production, use real geocoding API)
      const pickupCoords = { lat: 42.3314 + Math.random() * 0.1, lng: -83.0458 + Math.random() * 0.1 };
      const dropoffCoords = { lat: 42.3314 + Math.random() * 0.1, lng: -83.0458 + Math.random() * 0.1 };
      
      const distance = Math.sqrt(
        Math.pow(dropoffCoords.lat - pickupCoords.lat, 2) + 
        Math.pow(dropoffCoords.lng - pickupCoords.lng, 2)
      );
      const etaMinutes = Math.round(distance * 1000 + 30);
      
      return await base44.entities.DispatchRequest.create({
        ...data,
        pickup_lat: pickupCoords.lat,
        pickup_lng: pickupCoords.lng,
        dropoff_lat: dropoffCoords.lat,
        dropoff_lng: dropoffCoords.lng,
        estimated_eta: `${etaMinutes} minutes`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['dispatch-requests']);
      setShowForm(false);
      setFormData({
        request_type: "tow_truck",
        city: "Detroit, MI",
        pickup_location: "",
        dropoff_location: "",
        vehicle_id: "",
        customer_email: "",
        priority: "medium",
        notes: ""
      });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.DispatchRequest.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries(['dispatch-requests'])
  });

  const deleteDispatchMutation = useMutation({
    mutationFn: (id) => base44.entities.DispatchRequest.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['dispatch-requests'])
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
    createDispatchMutation.mutate(formData);
  };

  // Group by city
  const dispatchesByCity = {};
  dispatches.forEach(dispatch => {
    if (!dispatchesByCity[dispatch.city]) {
      dispatchesByCity[dispatch.city] = [];
    }
    dispatchesByCity[dispatch.city].push(dispatch);
  });

  // Stats
  const pendingCount = dispatches.filter(d => d.status === 'pending').length;
  const inTransitCount = dispatches.filter(d => d.status === 'in_transit').length;
  const completedToday = dispatches.filter(d => {
    if (!d.completed_date) return false;
    const today = new Date().toDateString();
    return new Date(d.completed_date).toDateString() === today;
  }).length;

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
              <Truck className="w-10 h-10 text-orange-400" />
              Call Center Dispatch
            </h1>
            <p className="text-gray-400">Tow trucks, pickups & deliveries</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Dispatch
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Active</p>
            <p className="text-3xl font-bold text-white">{dispatches.length}</p>
          </Card>
          <Card className="p-6 bg-yellow-900 border-yellow-700">
            <p className="text-yellow-200 text-sm mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-400">{pendingCount}</p>
          </Card>
          <Card className="p-6 bg-blue-900 border-blue-700">
            <p className="text-blue-200 text-sm mb-1">In Transit</p>
            <p className="text-3xl font-bold text-blue-400">{inTransitCount}</p>
          </Card>
          <Card className="p-6 bg-green-900 border-green-700">
            <p className="text-green-200 text-sm mb-1">Completed Today</p>
            <p className="text-3xl font-bold text-green-400">{completedToday}</p>
          </Card>
        </div>

        {/* Create Form */}
        {showForm && (
          <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Create Dispatch Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Request Type *</label>
                  <select
                    value={formData.request_type}
                    onChange={(e) => setFormData({...formData, request_type: e.target.value})}
                    className="w-full p-2 rounded-lg bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="tow_truck">Tow Truck</option>
                    <option value="car_pickup">Car Pickup</option>
                    <option value="car_delivery">Car Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">City *</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full p-2 rounded-lg bg-gray-700 border-gray-600 text-white"
                  >
                    {CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Priority *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    className="w-full p-2 rounded-lg bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Pickup Location *</label>
                  <Input
                    value={formData.pickup_location}
                    onChange={(e) => setFormData({...formData, pickup_location: e.target.value})}
                    required
                    placeholder="123 Main St, Detroit, MI"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Dropoff Location *</label>
                  <Input
                    value={formData.dropoff_location}
                    onChange={(e) => setFormData({...formData, dropoff_location: e.target.value})}
                    required
                    placeholder="456 Oak Ave, Detroit, MI"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Vehicle (Optional)</label>
                  <select
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({...formData, vehicle_id: e.target.value})}
                    className="w-full p-2 rounded-lg bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="">Select Vehicle...</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.year} {v.make} {v.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-gray-300 text-sm mb-2 block">Customer Email</label>
                  <Input
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                    placeholder="customer@example.com"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="text-gray-300 text-sm mb-2 block">Notes</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Additional details..."
                    className="bg-gray-700 border-gray-600 text-white h-20"
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
                  Create Dispatch
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Map View */}
        <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Live Map</h2>
          <div className="h-96 rounded-lg overflow-hidden">
            <MapContainer
              center={[42.3314, -83.0458]}
              zoom={10}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />
              
              {dispatches.filter(d => d.status !== 'completed' && d.status !== 'cancelled').map((dispatch) => (
                <Marker key={dispatch.id} position={[dispatch.pickup_lat || 42.3314, dispatch.pickup_lng || -83.0458]}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{dispatch.request_type.replace('_', ' ').toUpperCase()}</p>
                      <p>{dispatch.city}</p>
                      <p>ETA: {dispatch.estimated_eta}</p>
                      <Badge className={
                        dispatch.priority === 'urgent' ? 'bg-red-600' :
                        dispatch.priority === 'high' ? 'bg-orange-600' :
                        'bg-blue-600'
                      }>
                        {dispatch.status}
                      </Badge>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </Card>

        {/* Dispatches by City */}
        {Object.entries(dispatchesByCity).map(([city, cityDispatches]) => (
          <Card key={city} className="p-6 bg-gray-800 border-gray-700 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-400" />
              {city} ({cityDispatches.length})
            </h2>

            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Type</TableHead>
                  <TableHead className="text-gray-300">Pickup → Dropoff</TableHead>
                  <TableHead className="text-gray-300">Priority</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">ETA</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cityDispatches.map((dispatch) => (
                  <TableRow key={dispatch.id} className="border-gray-700">
                    <TableCell>
                      <Badge className="bg-purple-600">
                        {dispatch.request_type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300 text-sm">
                      <div className="flex items-center gap-2">
                        <span>{dispatch.pickup_location}</span>
                        <Navigation className="w-4 h-4 text-blue-400" />
                        <span>{dispatch.dropoff_location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        dispatch.priority === 'urgent' ? 'bg-red-600' :
                        dispatch.priority === 'high' ? 'bg-orange-600' :
                        dispatch.priority === 'medium' ? 'bg-yellow-600' :
                        'bg-gray-600'
                      }>
                        {dispatch.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        dispatch.status === 'completed' ? 'bg-green-600' :
                        dispatch.status === 'in_transit' ? 'bg-blue-600' :
                        dispatch.status === 'assigned' ? 'bg-purple-600' :
                        'bg-yellow-600'
                      }>
                        {dispatch.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm">
                      {dispatch.estimated_eta || 'TBD'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {dispatch.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ id: dispatch.id, status: 'assigned' })}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Assign
                          </Button>
                        )}
                        {dispatch.status === 'assigned' && (
                          <Button
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ id: dispatch.id, status: 'in_transit' })}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            In Transit
                          </Button>
                        )}
                        {dispatch.status === 'in_transit' && (
                          <Button
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ id: dispatch.id, status: 'completed' })}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            if (confirm('Delete this dispatch?')) {
                              deleteDispatchMutation.mutate(dispatch.id);
                            }
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ))}
      </div>
    </div>
  );
}