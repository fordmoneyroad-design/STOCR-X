import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Car, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import VehicleCard from "../components/vehicles/VehicleCard";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function NearbyVehicles() {
  const [user, setUser] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
        }
      } catch (err) {
        // Not authenticated
      }
    };
    checkAuth();
    requestLocation();
  }, []);

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoading(false);
        },
        (err) => {
          setError("Please enable location services to find nearby vehicles");
          setLoading(false);
        }
      );
    } else {
      setError("Location services not supported by your browser");
      setLoading(false);
    }
  };

  const { data: vehicles } = useQuery({
    queryKey: ['nearby-vehicles'],
    queryFn: () => base44.entities.Vehicle.filter({ status: "available" }),
    initialData: []
  });

  // Mock locations for demo (in production, vehicles would have real GPS coords)
  const vehiclesWithLocations = vehicles.map((v, idx) => ({
    ...v,
    lat: userLocation ? userLocation.lat + (Math.random() - 0.5) * 0.5 : 42.3314 + (Math.random() - 0.5) * 0.5,
    lng: userLocation ? userLocation.lng + (Math.random() - 0.5) * 0.5 : -83.0458 + (Math.random() - 0.5) * 0.5,
  }));

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // Radius of Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const sortedVehicles = userLocation ? vehiclesWithLocations
    .map(v => ({
      ...v,
      distance: calculateDistance(userLocation.lat, userLocation.lng, v.lat, v.lng)
    }))
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance))
    : vehiclesWithLocations;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Getting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Navigation className="w-10 h-10 text-blue-600" />
            Nearby Vehicles
          </h1>
          <p className="text-gray-600">Find available cars near your location</p>
        </div>

        {error && (
          <Alert className="mb-8 bg-yellow-50 border-yellow-200">
            <AlertDescription className="text-yellow-800">
              {error}. Showing all available vehicles.
            </AlertDescription>
          </Alert>
        )}

        {userLocation && (
          <Alert className="mb-8 bg-green-50 border-green-200">
            <MapPin className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Your location:</strong> {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </AlertDescription>
          </Alert>
        )}

        {/* Map View */}
        <Card className="p-6 mb-8 border-none shadow-xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Map View</h2>
          <div className="h-96 rounded-lg overflow-hidden">
            {userLocation && (
              <MapContainer
                center={[userLocation.lat, userLocation.lng]}
                zoom={11}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                
                {/* User Location Marker */}
                <Marker position={[userLocation.lat, userLocation.lng]}>
                  <Popup>Your Location</Popup>
                </Marker>

                {/* Vehicle Markers */}
                {sortedVehicles.slice(0, 20).map((vehicle) => (
                  <Marker key={vehicle.id} position={[vehicle.lat, vehicle.lng]}>
                    <Popup>
                      <div className="text-center">
                        <p className="font-bold">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                        <p className="text-sm">${vehicle.price?.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">{vehicle.distance} miles away</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        </Card>

        {/* List View */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {sortedVehicles.length} Vehicles Found
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedVehicles.map((vehicle) => (
              <div key={vehicle.id} className="relative">
                {vehicle.distance && (
                  <Badge className="absolute top-4 right-4 z-10 bg-blue-600">
                    <MapPin className="w-3 h-3 mr-1" />
                    {vehicle.distance} mi
                  </Badge>
                )}
                <VehicleCard vehicle={vehicle} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}