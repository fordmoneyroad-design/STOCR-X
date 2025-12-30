import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ClaimManagement({ claims, subscriptions, vehicles }) {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const updateClaimMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Claim.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-claims']);
    }
  });

  const handleApproveClaim = (claimId) => {
    updateClaimMutation.mutate({
      id: claimId,
      data: { status: 'approved' }
    });
  };

  const handleDenyClaim = (claimId) => {
    updateClaimMutation.mutate({
      id: claimId,
      data: { status: 'denied' }
    });
  };

  const getVehicleName = (vehicleId) => {
    const vehicle = vehicles?.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown';
  };

  const getCustomerEmail = (subscriptionId) => {
    const subscription = subscriptions?.find(s => s.id === subscriptionId);
    return subscription?.customer_email || 'Unknown';
  };

  return (
    <Card className="p-6 border-none shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          Claims Management
        </h2>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search claims..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {claims && claims.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((claim) => (
                <TableRow key={claim.id}>
                  <TableCell>{getCustomerEmail(claim.subscription_id)}</TableCell>
                  <TableCell>{getVehicleName(claim.vehicle_id)}</TableCell>
                  <TableCell className="capitalize">{claim.claim_type}</TableCell>
                  <TableCell>
                    <Badge className={
                      claim.status === 'approved' ? 'bg-green-500' :
                      claim.status === 'denied' ? 'bg-red-500' :
                      claim.status === 'under_review' ? 'bg-blue-500' : 'bg-yellow-500'
                    }>
                      {claim.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {claim.incident_date && new Date(claim.incident_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {claim.status === 'submitted' && (
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleApproveClaim(claim.id)}
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDenyClaim(claim.id)}
                        >
                          <XCircle className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-12">No claims to display</p>
      )}
    </Card>
  );
}