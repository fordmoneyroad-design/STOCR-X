import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Gavel, Eye, DollarSign } from "lucide-react";
import SuperAdminQuickActions from "../components/admin/SuperAdminQuickActions";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function AuctionAssessment() {
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

  const { data: auctionVehicles } = useQuery({
    queryKey: ['auction-vehicles'],
    queryFn: () => base44.entities.Vehicle.filter({ is_auction: true }),
    initialData: []
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
            <Gavel className="w-10 h-10 text-purple-400" />
            Auction Vehicle Assessment
          </h1>
          <p className="text-gray-400">Evaluate vehicles from auctions before adding to inventory</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Auction Vehicles</p>
            <p className="text-3xl font-bold text-white">{auctionVehicles.length}</p>
          </Card>
          <Card className="p-6 bg-purple-900 border-purple-700">
            <p className="text-purple-200 text-sm mb-1">Awaiting Assessment</p>
            <p className="text-3xl font-bold text-purple-400">
              {auctionVehicles.filter(v => !v.auction_value_estimate).length}
            </p>
          </Card>
          <Card className="p-6 bg-green-900 border-green-700">
            <p className="text-green-200 text-sm mb-1">Assessed</p>
            <p className="text-3xl font-bold text-green-400">
              {auctionVehicles.filter(v => v.auction_value_estimate).length}
            </p>
          </Card>
        </div>

        {/* Auction Vehicles */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Auction Vehicles</h2>
          
          {auctionVehicles.length === 0 ? (
            <div className="text-center py-12">
              <Gavel className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">No auction vehicles to assess</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctionVehicles.map((vehicle) => (
                <Card key={vehicle.id} className="p-4 bg-gray-700 border-gray-600">
                  {vehicle.images && vehicle.images[0] && (
                    <img
                      src={vehicle.images[0]}
                      alt={`${vehicle.year} ${vehicle.make}`}
                      className="w-full h-40 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-bold text-white mb-2">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Condition</span>
                      <Badge className="bg-orange-600">{vehicle.condition || 'Unknown'}</Badge>
                    </div>
                    {vehicle.auction_value_estimate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Est. Value</span>
                        <span className="text-green-400 font-bold">
                          ${vehicle.auction_value_estimate.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Assess
                    </Button>
                    <Button className="flex-1 bg-green-600 hover:bg-green-700" size="sm">
                      <DollarSign className="w-4 h-4 mr-1" />
                      Add to Inventory
                    </Button>
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