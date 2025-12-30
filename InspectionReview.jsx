import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, CheckCircle, X, Eye, Calendar, 
  MapPin, Star, Camera, AlertTriangle
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function InspectionReview() {
  const [user, setUser] = useState(null);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");
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

    // Check for inspection ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const inspectionId = urlParams.get('id');
    if (inspectionId) {
      fetchInspection(inspectionId);
    }
  }, []);

  const fetchInspection = async (id) => {
    try {
      const inspections = await base44.entities.VehicleInspection.filter({ id });
      if (inspections.length > 0) {
        setSelectedInspection(inspections[0]);
        setAdminNotes(inspections[0].admin_notes || "");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const { data: allInspections } = useQuery({
    queryKey: ['all-inspections'],
    queryFn: () => base44.entities.VehicleInspection.list("-created_date"),
    initialData: []
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles-lookup'],
    queryFn: () => base44.entities.Vehicle.list(),
    initialData: []
  });

  const approveInspectionMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.VehicleInspection.update(selectedInspection.id, {
        status: "approved",
        admin_reviewed: true,
        reviewed_by: user.email,
        admin_notes: adminNotes
      });

      // Notify inspector
      await base44.integrations.Core.SendEmail({
        to: selectedInspection.inspector_email,
        subject: "✅ Vehicle Inspection Approved",
        body: `
          Your vehicle inspection has been approved!
          
          Vehicle: ${getVehicleName(selectedInspection.vehicle_id)}
          Inspection Date: ${selectedInspection.inspection_date}
          Overall Rating: ${selectedInspection.overall_rating}/10
          
          Admin Notes: ${adminNotes || 'No additional notes'}
          
          Thank you for your detailed inspection report.
        `
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-inspections']);
      alert("✅ Inspection approved!");
      setSelectedInspection(null);
    }
  });

  const rejectInspectionMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.VehicleInspection.update(selectedInspection.id, {
        status: "rejected",
        admin_reviewed: true,
        reviewed_by: user.email,
        admin_notes: adminNotes
      });

      // Notify inspector
      await base44.integrations.Core.SendEmail({
        to: selectedInspection.inspector_email,
        subject: "Vehicle Inspection - Additional Information Needed",
        body: `
          Your vehicle inspection requires additional information or clarification.
          
          Vehicle: ${getVehicleName(selectedInspection.vehicle_id)}
          
          Admin Notes: ${adminNotes}
          
          Please review and resubmit the inspection with the requested information.
        `
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-inspections']);
      alert("Inspection marked for revision");
      setSelectedInspection(null);
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getVehicleName = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle';
  };

  const pendingInspections = allInspections.filter(i => i.status === 'submitted');
  const reviewedInspections = allInspections.filter(i => i.status === 'under_review');

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
            <Camera className="w-10 h-10 text-blue-400" />
            Vehicle Inspection Review
          </h1>
          <p className="text-gray-400">Review and approve vehicle inspections</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Inspections</p>
            <p className="text-3xl font-bold text-white">{allInspections.length}</p>
          </Card>
          <Card className="p-6 bg-yellow-900 border-yellow-700">
            <p className="text-yellow-200 text-sm mb-1">Pending Review</p>
            <p className="text-3xl font-bold text-yellow-400">{pendingInspections.length}</p>
          </Card>
          <Card className="p-6 bg-blue-900 border-blue-700">
            <p className="text-blue-200 text-sm mb-1">Under Review</p>
            <p className="text-3xl font-bold text-blue-400">{reviewedInspections.length}</p>
          </Card>
          <Card className="p-6 bg-green-900 border-green-700">
            <p className="text-green-200 text-sm mb-1">Approved</p>
            <p className="text-3xl font-bold text-green-400">
              {allInspections.filter(i => i.status === 'approved').length}
            </p>
          </Card>
        </div>

        {selectedInspection ? (
          /* Detailed Inspection View */
          <div className="space-y-6">
            <Card className="p-8 bg-gray-800 border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {getVehicleName(selectedInspection.vehicle_id)}
                </h2>
                <Badge className={
                  selectedInspection.status === 'approved' ? 'bg-green-600' :
                  selectedInspection.status === 'rejected' ? 'bg-red-600' :
                  'bg-yellow-600'
                }>
                  {selectedInspection.status}
                </Badge>
              </div>

              {/* Inspection Details */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div>
                  <p className="text-gray-400 text-sm">Inspector</p>
                  <p className="text-white font-semibold">{selectedInspection.inspector_name}</p>
                  <p className="text-gray-500 text-xs">{selectedInspection.inspector_email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Inspection Date</p>
                  <p className="text-white font-semibold">
                    {selectedInspection.inspection_date && new Date(selectedInspection.inspection_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Type</p>
                  <Badge className="bg-purple-600">{selectedInspection.inspection_type}</Badge>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Location</p>
                  <p className="text-white">{selectedInspection.location || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Mileage</p>
                  <p className="text-white">{selectedInspection.mileage?.toLocaleString() || 'N/A'} mi</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Overall Rating</p>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <p className="text-white font-bold text-xl">{selectedInspection.overall_rating}/10</p>
                  </div>
                </div>
              </div>

              {/* Condition Summary */}
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <Card className="p-4 bg-gray-700 border-gray-600">
                  <p className="text-gray-400 text-xs mb-1">Exterior</p>
                  <Badge className="bg-blue-600">{selectedInspection.exterior_condition}</Badge>
                </Card>
                <Card className="p-4 bg-gray-700 border-gray-600">
                  <p className="text-gray-400 text-xs mb-1">Interior</p>
                  <Badge className="bg-purple-600">{selectedInspection.interior_condition}</Badge>
                </Card>
                <Card className="p-4 bg-gray-700 border-gray-600">
                  <p className="text-gray-400 text-xs mb-1">Mechanical</p>
                  <Badge className="bg-orange-600">{selectedInspection.mechanical_condition}</Badge>
                </Card>
                <Card className="p-4 bg-gray-700 border-gray-600">
                  <p className="text-gray-400 text-xs mb-1">Tires</p>
                  <Badge className="bg-green-600">{selectedInspection.tire_condition}</Badge>
                </Card>
              </div>

              {/* Photos */}
              <div className="space-y-6 mb-8">
                {selectedInspection.exterior_photos && selectedInspection.exterior_photos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Exterior Photos ({selectedInspection.exterior_photos.length})</h3>
                    <div className="grid grid-cols-4 gap-3">
                      {selectedInspection.exterior_photos.map((url, idx) => (
                        <img key={idx} src={url} alt={`Exterior ${idx + 1}`} className="w-full h-32 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform" onClick={() => window.open(url, '_blank')} />
                      ))}
                    </div>
                  </div>
                )}

                {selectedInspection.interior_photos && selectedInspection.interior_photos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Interior Photos ({selectedInspection.interior_photos.length})</h3>
                    <div className="grid grid-cols-4 gap-3">
                      {selectedInspection.interior_photos.map((url, idx) => (
                        <img key={idx} src={url} alt={`Interior ${idx + 1}`} className="w-full h-32 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform" onClick={() => window.open(url, '_blank')} />
                      ))}
                    </div>
                  </div>
                )}

                {selectedInspection.engine_photos && selectedInspection.engine_photos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Engine/Mechanical Photos ({selectedInspection.engine_photos.length})</h3>
                    <div className="grid grid-cols-4 gap-3">
                      {selectedInspection.engine_photos.map((url, idx) => (
                        <img key={idx} src={url} alt={`Engine ${idx + 1}`} className="w-full h-32 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform" onClick={() => window.open(url, '_blank')} />
                      ))}
                    </div>
                  </div>
                )}

                {selectedInspection.damage_photos && selectedInspection.damage_photos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3">Damage Photos ({selectedInspection.damage_photos.length})</h3>
                    <div className="grid grid-cols-4 gap-3">
                      {selectedInspection.damage_photos.map((url, idx) => (
                        <img key={idx} src={url} alt={`Damage ${idx + 1}`} className="w-full h-32 object-cover rounded-lg cursor-pointer hover:scale-105 transition-transform" onClick={() => window.open(url, '_blank')} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Findings */}
              {(selectedInspection.damages_found || selectedInspection.issues_found || selectedInspection.notes) && (
                <div className="space-y-4 mb-8">
                  {selectedInspection.damages_found && (
                    <div className="bg-red-900/20 border border-red-700 p-4 rounded-lg">
                      <p className="text-red-300 font-semibold mb-2">Damages Found:</p>
                      <p className="text-gray-300">{selectedInspection.damages_found}</p>
                    </div>
                  )}
                  {selectedInspection.issues_found && (
                    <div className="bg-orange-900/20 border border-orange-700 p-4 rounded-lg">
                      <p className="text-orange-300 font-semibold mb-2">Issues Found:</p>
                      <p className="text-gray-300">{selectedInspection.issues_found}</p>
                    </div>
                  )}
                  {selectedInspection.notes && (
                    <div className="bg-blue-900/20 border border-blue-700 p-4 rounded-lg">
                      <p className="text-blue-300 font-semibold mb-2">Additional Notes:</p>
                      <p className="text-gray-300">{selectedInspection.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Admin Review Section */}
              {selectedInspection.status !== 'approved' && selectedInspection.status !== 'rejected' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Admin Review Notes</label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add your review notes here..."
                      className="bg-gray-700 border-gray-600 text-white h-24"
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => approveInspectionMutation.mutate()}
                      disabled={approveInspectionMutation.isLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700 h-12"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Approve Inspection
                    </Button>
                    <Button
                      onClick={() => rejectInspectionMutation.mutate()}
                      disabled={rejectInspectionMutation.isLoading}
                      className="flex-1 bg-red-600 hover:bg-red-700 h-12"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Request Revision
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedInspection(null)}
                      className="border-gray-600 text-gray-300"
                    >
                      Back to List
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        ) : (
          /* Inspection List */
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">All Inspections</h2>
            
            {allInspections.length === 0 ? (
              <div className="text-center py-12">
                <Camera className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">No inspections submitted yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Vehicle</TableHead>
                    <TableHead className="text-gray-300">Inspector</TableHead>
                    <TableHead className="text-gray-300">Type</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Rating</TableHead>
                    <TableHead className="text-gray-300">Photos</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allInspections.map((inspection) => (
                    <TableRow key={inspection.id} className="border-gray-700">
                      <TableCell className="text-white font-semibold">
                        {getVehicleName(inspection.vehicle_id)}
                      </TableCell>
                      <TableCell className="text-gray-300 text-sm">
                        {inspection.inspector_name}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-purple-600 text-xs">
                          {inspection.inspection_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-400 text-sm">
                        {inspection.inspection_date && new Date(inspection.inspection_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-white font-bold">
                        {inspection.overall_rating}/10
                      </TableCell>
                      <TableCell className="text-gray-400 text-sm">
                        {(inspection.exterior_photos?.length || 0) + 
                         (inspection.interior_photos?.length || 0) + 
                         (inspection.engine_photos?.length || 0) + 
                         (inspection.damage_photos?.length || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          inspection.status === 'approved' ? 'bg-green-600' :
                          inspection.status === 'rejected' ? 'bg-red-600' :
                          'bg-yellow-600'
                        }>
                          {inspection.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => setSelectedInspection(inspection)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}