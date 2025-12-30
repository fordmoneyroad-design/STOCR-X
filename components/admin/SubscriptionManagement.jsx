import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, CheckCircle, XCircle, Eye } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SubscriptionManagement({ subscriptions, vehicles }) {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const filteredSubscriptions = subscriptions?.filter(s =>
    s.customer_email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const updateSubscriptionMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Subscription.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-subscriptions']);
    }
  });

  const handleVerifyKYC = (subscriptionId) => {
    updateSubscriptionMutation.mutate({
      id: subscriptionId,
      data: { kyc_verified: true, status: 'active' }
    });
  };

  const handleRejectKYC = (subscriptionId) => {
    updateSubscriptionMutation.mutate({
      id: subscriptionId,
      data: { status: 'rejected' }
    });
  };

  const getVehicleName = (vehicleId) => {
    const vehicle = vehicles?.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown';
  };

  return (
    <Card className="p-6 border-none shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-green-600" />
          Subscription Management
        </h2>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search by customer email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>KYC Verified</TableHead>
              <TableHead>Total Paid</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions?.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>
                  <div className="font-semibold">{sub.customer_email}</div>
                  <div className="text-sm text-gray-500">
                    {sub.created_date && new Date(sub.created_date).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>{getVehicleName(sub.vehicle_id)}</TableCell>
                <TableCell>
                  <Badge className={
                    sub.status === 'active' ? 'bg-green-500' :
                    sub.status === 'pending' ? 'bg-yellow-500' :
                    sub.status === 'suspended' ? 'bg-red-500' : 'bg-gray-500'
                  }>
                    {sub.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={sub.kyc_verified ? 'bg-green-500' : 'bg-yellow-500'}>
                    {sub.kyc_verified ? 'Verified' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell>${sub.total_paid?.toLocaleString() || 0}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {!sub.kyc_verified && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleVerifyKYC(sub.id)}
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRejectKYC(sub.id)}
                        >
                          <XCircle className="w-4 h-4 text-red-600" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}