import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, AlertTriangle, Trash2 } from "lucide-react";
import SuperAdminQuickActions from "../components/admin/SuperAdminQuickActions";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function VehicleAutoRemoval() {
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

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles-expiration'],
    queryFn: () => base44.entities.Vehicle.list("-created_date"),
    initialData: []
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const calculateDaysRemaining = (vehicle) => {
    if (!vehicle.created_date) return vehicle.remove_after_days || 90;
    const created = new Date(vehicle.created_date);
    const removeDate = new Date(created);
    removeDate.setDate(removeDate.getDate() + (vehicle.remove_after_days || 90));
    const today = new Date();
    const daysLeft = Math.ceil((removeDate - today) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };

  const expiringSoon = vehicles
    .map(v => ({ ...v, daysLeft: calculateDaysRemaining(v) }))
    .filter(v => v.daysLeft <= 30 && v.status === 'available')
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const expiredVehicles = vehicles
    .map(v => ({ ...v, daysLeft: calculateDaysRemaining(v) }))
    .filter(v => v.daysLeft === 0 && v.status === 'available');

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
            <Clock className="w-10 h-10 text-red-400" />
            Vehicle Auto-Removal System
          </h1>
          <p className="text-gray-400">Vehicles automatically removed after 90 days</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Active</p>
            <p className="text-3xl font-bold text-white">
              {vehicles.filter(v => v.status === 'available').length}
            </p>
          </Card>
          <Card className="p-6 bg-yellow-900 border-yellow-700">
            <p className="text-yellow-200 text-sm mb-1">Expiring Soon (30d)</p>
            <p className="text-3xl font-bold text-yellow-400">{expiringSoon.length}</p>
          </Card>
          <Card className="p-6 bg-red-900 border-red-700">
            <p className="text-red-200 text-sm mb-1">Ready for Removal</p>
            <p className="text-3xl font-bold text-red-400">{expiredVehicles.length}</p>
          </Card>
        </div>

        {/* Expiring Soon */}
        <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-yellow-400" />
            Expiring Soon (30 Days or Less)
          </h2>
          {expiringSoon.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No vehicles expiring soon</p>
          ) : (
            <div className="space-y-4">
              {expiringSoon.map((vehicle) => (
                <Card key={vehicle.id} className="p-4 bg-gray-700 border-gray-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-lg">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Listed: {vehicle.created_date && new Date(vehicle.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={
                        vehicle.daysLeft <= 7 ? 'bg-red-600' :
                        vehicle.daysLeft <= 14 ? 'bg-orange-600' : 'bg-yellow-600'
                      }>
                        {vehicle.daysLeft} days left
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">
                        Removes after {vehicle.remove_after_days || 90} days
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Ready for Removal */}
        {expiredVehicles.length > 0 && (
          <Card className="p-6 bg-red-900/20 border-red-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-red-400" />
              Ready for Auto-Removal ({expiredVehicles.length})
            </h2>
            <div className="space-y-4">
              {expiredVehicles.map((vehicle) => (
                <Card key={vehicle.id} className="p-4 bg-gray-700 border-red-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-lg">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Listed: {vehicle.created_date && new Date(vehicle.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button className="bg-red-600 hover:bg-red-700">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Now
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        )}

        <SuperAdminQuickActions />
      </div>
    </div>
  );
}