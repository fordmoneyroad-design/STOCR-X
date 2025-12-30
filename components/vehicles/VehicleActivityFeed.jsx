import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle, Upload, Edit, Eye } from "lucide-react";

export default function VehicleActivityFeed({ activities, vehicles }) {
  const vehicleActivities = activities.filter(a => 
    a.action_type?.includes('vehicle') || 
    a.action_type === 'approve_vehicle' ||
    a.entity_type === 'Vehicle'
  );

  const getActivityIcon = (actionType) => {
    if (actionType?.includes('approve')) return CheckCircle;
    if (actionType?.includes('upload') || actionType?.includes('create')) return Upload;
    if (actionType?.includes('update')) return Edit;
    if (actionType?.includes('view')) return Eye;
    return Activity;
  };

  const getActivityColor = (actionType) => {
    if (actionType?.includes('approve')) return 'text-green-400';
    if (actionType?.includes('upload') || actionType?.includes('create')) return 'text-blue-400';
    if (actionType?.includes('update')) return 'text-yellow-400';
    if (actionType?.includes('view')) return 'text-purple-400';
    return 'text-gray-400';
  };

  return (
    <Card className="p-6 bg-gray-800 border-gray-700 sticky top-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Activity className="w-6 h-6 text-green-400" />
        Recent Activity
      </h3>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {vehicleActivities.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No recent activity</p>
        ) : (
          vehicleActivities.map((activity) => {
            const Icon = getActivityIcon(activity.action_type);
            const colorClass = getActivityColor(activity.action_type);
            const vehicle = vehicles.find(v => v.id === activity.related_entity_id);

            return (
              <div key={activity.id} className="p-3 bg-gray-700 rounded-lg border border-gray-600">
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-1 ${colorClass}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <Badge className="text-xs capitalize">
                        {activity.action_type?.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {activity.created_date && new Date(activity.created_date).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-white mb-1">{activity.action_details}</p>
                    {vehicle && (
                      <p className="text-xs text-gray-400">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      By: {activity.user_email}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}