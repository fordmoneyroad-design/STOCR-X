import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Car } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function VehicleManagement({ vehicles }) {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  const filteredVehicles = vehicles?.filter(v =>
    v.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.year?.toString().includes(searchQuery)
  );

  const deleteVehicleMutation = useMutation({
    mutationFn: (id) => base44.entities.Vehicle.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-vehicles']);
    }
  });

  return (
    <Card className="p-6 border-none shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Car className="w-6 h-6 text-blue-600" />
          Vehicle Management
        </h2>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
          <Plus className="w-4 h-4 mr-2" />
          Add Vehicle
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search vehicles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vehicle</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Down Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles?.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>
                  <div className="font-semibold">{vehicle.make} {vehicle.model}</div>
                  <div className="text-sm text-gray-500">{vehicle.vin}</div>
                </TableCell>
                <TableCell>{vehicle.year}</TableCell>
                <TableCell>${vehicle.price?.toLocaleString()}</TableCell>
                <TableCell>${vehicle.down_payment?.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge className={
                    vehicle.status === 'available' ? 'bg-green-500' :
                    vehicle.status === 'subscribed' ? 'bg-blue-500' : 'bg-gray-500'
                  }>
                    {vehicle.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this vehicle?')) {
                          deleteVehicleMutation.mutate(vehicle.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
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