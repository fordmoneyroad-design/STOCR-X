import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Fuel, Gauge, DollarSign } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function VehicleCard({ vehicle }) {
  const TAX_RATE = 0.006; // 0.6% tax
  
  // Calculate subscription prices with tax
  const weeklyWithTax = vehicle.weekly_subscription * (1 + TAX_RATE);
  const monthlyWithTax = vehicle.monthly_subscription * (1 + TAX_RATE);
  const weeklyTax = vehicle.weekly_subscription * TAX_RATE;
  const monthlyTax = vehicle.monthly_subscription * TAX_RATE;

  return (
    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-none shadow-lg group">
      <Link to={createPageUrl("CarDetails") + `?id=${vehicle.id}`}>
        <div className="relative h-64 overflow-hidden">
          <img
            src={vehicle.images?.[0] || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800'}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4">
            <Badge className={`${
              vehicle.status === 'available' ? 'bg-green-500' : 'bg-gray-500'
            } text-white`}>
              {vehicle.status}
            </Badge>
          </div>
        </div>
      </Link>

      <div className="p-6">
        <Link to={createPageUrl("CarDetails") + `?id=${vehicle.id}`}>
          <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
        </Link>

        <div className="flex items-center gap-2 text-gray-600 mb-4">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{vehicle.location || 'Available'}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{vehicle.mileage?.toLocaleString() || 'N/A'} mi</span>
          </div>
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 capitalize">{vehicle.fuel_type || 'Gas'}</span>
          </div>
        </div>

        {/* Standard Subscription Pricing with Tax */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
          <p className="text-sm text-gray-600 mb-2 font-semibold">Standard Subscription</p>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Weekly</p>
                <p className="text-lg font-bold text-blue-600">
                  ${weeklyWithTax.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  Base: ${vehicle.weekly_subscription} + Tax: ${weeklyTax.toFixed(2)}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-gray-500">Monthly</p>
                <p className="text-lg font-bold text-purple-600">
                  ${monthlyWithTax.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  Base: ${vehicle.monthly_subscription} + Tax: ${monthlyTax.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Price */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <span className="text-gray-600">Total Price</span>
          <span className="text-2xl font-bold text-gray-900">
            ${vehicle.price?.toLocaleString()}
          </span>
        </div>

        <Link to={createPageUrl("CarDetails") + `?id=${vehicle.id}`}>
          <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg">
            View Details
          </Button>
        </Link>
      </div>
    </Card>
  );
}