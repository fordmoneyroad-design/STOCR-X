import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Camera, Upload, CheckCircle, AlertTriangle, 
  ArrowLeft, Car, MapPin, Calendar, Star, Eye
} from "lucide-react";

export default function VehicleInspection() {
  const [user, setUser] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [inspectionData, setInspectionData] = useState({
    inspection_type: "pre_purchase",
    location: "",
    mileage: "",
    exterior_condition: "good",
    interior_condition: "good",
    mechanical_condition: "good",
    tire_condition: "good",
    damages_found: "",
    issues_found: "",
    notes: "",
    overall_rating: 7,
    recommended_action: "approve_delivery"
  });
  const [exteriorPhotos, setExteriorPhotos] = useState([]);
  const [interiorPhotos, setInteriorPhotos] = useState([]);
  const [enginePhotos, setEnginePhotos] = useState([]);
  const [damagePhotos, setDamagePhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (err) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  // Fetch user's subscribed vehicles
  const { data: subscriptions } = useQuery({
    queryKey: ['user-subscriptions', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const subs = await base44.entities.Subscription.filter({ 
        customer_email: user.email 
      });
      return subs;
    },
    enabled: !!user,
    initialData: []
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles-for-inspection'],
    queryFn: () => base44.entities.Vehicle.list(),
    initialData: []
  });

  const handlePhotoUpload = async (e, category) => {
    const files = Array.from(e.target.files);
    setUploadingPhotos(true);

    const uploadedUrls = [];
    for (const file of files) {
      try {
        const result = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(result.file_url);
      } catch (error) {
        console.error("Upload error:", error);
      }
    }

    switch(category) {
      case 'exterior':
        setExteriorPhotos([...exteriorPhotos, ...uploadedUrls]);
        break;
      case 'interior':
        setInteriorPhotos([...interiorPhotos, ...uploadedUrls]);
        break;
      case 'engine':
        setEnginePhotos([...enginePhotos, ...uploadedUrls]);
        break;
      case 'damage':
        setDamagePhotos([...damagePhotos, ...uploadedUrls]);
        break;
    }

    setUploadingPhotos(false);
  };

  const submitInspectionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedVehicle) {
        throw new Error("Please select a vehicle");
      }

      const subscription = subscriptions.find(s => s.vehicle_id === selectedVehicle.id);

      const inspection = await base44.entities.VehicleInspection.create({
        vehicle_id: selectedVehicle.id,
        subscription_id: subscription?.id || null,
        inspector_email: user.email,
        inspector_name: user.full_name || user.email,
        inspection_date: new Date().toISOString().split('T')[0],
        exterior_photos: exteriorPhotos,
        interior_photos: interiorPhotos,
        engine_photos: enginePhotos,
        damage_photos: damagePhotos,
        ...inspectionData,
        status: "submitted"
      });

      // Create damage report if damages found
      if (inspectionData.damages_found && subscription) {
        await base44.entities.DamageReport.create({
          subscription_id: subscription.id,
          vehicle_id: selectedVehicle.id,
          report_type: "damage",
          description: inspectionData.damages_found,
          incident_date: new Date().toISOString().split('T')[0],
          location: inspectionData.location,
          photos: damagePhotos,
          status: "submitted"
        });
      }

      // Send notification to admin
      await base44.integrations.Core.SendEmail({
        to: "fordmoneyroad@gmail.com",
        subject: `🔍 New Vehicle Inspection - ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`,
        body: `
          New vehicle inspection submitted:
          
          Vehicle: ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}
          Inspector: ${user.full_name || user.email}
          Type: ${inspectionData.inspection_type}
          Overall Rating: ${inspectionData.overall_rating}/10
          Recommendation: ${inspectionData.recommended_action}
          
          Exterior: ${inspectionData.exterior_condition}
          Interior: ${inspectionData.interior_condition}
          Mechanical: ${inspectionData.mechanical_condition}
          Tires: ${inspectionData.tire_condition}
          
          Photos:
          - Exterior: ${exteriorPhotos.length}
          - Interior: ${interiorPhotos.length}
          - Engine: ${enginePhotos.length}
          - Damage: ${damagePhotos.length}
          
          Damages Found: ${inspectionData.damages_found || 'None'}
          Issues Found: ${inspectionData.issues_found || 'None'}
          
          View inspection: ${window.location.origin}/app/InspectionReview?id=${inspection.id}
        `
      });

      // Log activity
      await base44.entities.ActivityLog.create({
        user_email: user.email,
        action_type: "vehicle_inspection",
        action_details: `Submitted inspection for ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`,
        related_entity_id: inspection.id,
        entity_type: "VehicleInspection"
      });

      return inspection;
    },
    onSuccess: () => {
      alert("✅ Inspection submitted successfully! Admin will review.");
      // Reset form
      setSelectedVehicle(null);
      setExteriorPhotos([]);
      setInteriorPhotos([]);
      setEnginePhotos([]);
      setDamagePhotos([]);
      setInspectionData({
        inspection_type: "pre_purchase",
        location: "",
        mileage: "",
        exterior_condition: "good",
        interior_condition: "good",
        mechanical_condition: "good",
        tire_condition: "good",
        damages_found: "",
        issues_found: "",
        notes: "",
        overall_rating: 7,
        recommended_action: "approve_delivery"
      });
    },
    onError: (error) => {
      alert("Error: " + error.message);
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const userVehicles = vehicles.filter(v => 
    subscriptions.some(s => s.vehicle_id === v.id)
  );

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
            <Camera className="w-10 h-10 text-blue-600" />
            Vehicle Inspection
          </h1>
          <p className="text-gray-600">
            Document your vehicle's condition with photos and detailed inspection
          </p>
        </div>

        {/* Vehicle Selection */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Vehicle</h2>
          
          {userVehicles.length === 0 ? (
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                You don't have any active subscriptions. Subscribe to a vehicle first to perform an inspection.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {userVehicles.map((vehicle) => (
                <button
                  key={vehicle.id}
                  onClick={() => setSelectedVehicle(vehicle)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedVehicle?.id === vehicle.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {vehicle.images && vehicle.images[0] && (
                    <img
                      src={vehicle.images[0]}
                      alt={`${vehicle.year} ${vehicle.make}`}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <p className="font-bold text-gray-900">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                  <p className="text-sm text-gray-600">{vehicle.vin || 'N/A'}</p>
                  {selectedVehicle?.id === vehicle.id && (
                    <Badge className="mt-2 bg-blue-600">Selected</Badge>
                  )}
                </button>
              ))}
            </div>
          )}
        </Card>

        {selectedVehicle && (
          <>
            {/* Inspection Details */}
            <Card className="p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Inspection Details</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-gray-700 text-sm mb-2 block">Inspection Type</label>
                  <select
                    value={inspectionData.inspection_type}
                    onChange={(e) => setInspectionData({...inspectionData, inspection_type: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="pre_purchase">Pre-Purchase Inspection</option>
                    <option value="pre_delivery">Pre-Delivery Check</option>
                    <option value="routine_check">Routine Check</option>
                    <option value="damage_assessment">Damage Assessment</option>
                    <option value="return_inspection">Return Inspection</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-2 block">Current Mileage</label>
                  <Input
                    type="number"
                    value={inspectionData.mileage}
                    onChange={(e) => setInspectionData({...inspectionData, mileage: e.target.value})}
                    placeholder="85000"
                    className="h-12"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-gray-700 text-sm mb-2 block">Inspection Location</label>
                  <Input
                    value={inspectionData.location}
                    onChange={(e) => setInspectionData({...inspectionData, location: e.target.value})}
                    placeholder="123 Main St, Detroit, MI"
                    className="h-12"
                  />
                </div>
              </div>
            </Card>

            {/* Condition Assessment */}
            <Card className="p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Condition Assessment</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-gray-700 text-sm mb-2 block">Exterior Condition</label>
                  <select
                    value={inspectionData.exterior_condition}
                    onChange={(e) => setInspectionData({...inspectionData, exterior_condition: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-2 block">Interior Condition</label>
                  <select
                    value={inspectionData.interior_condition}
                    onChange={(e) => setInspectionData({...inspectionData, interior_condition: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-2 block">Mechanical Condition</label>
                  <select
                    value={inspectionData.mechanical_condition}
                    onChange={(e) => setInspectionData({...inspectionData, mechanical_condition: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-2 block">Tire Condition</label>
                  <select
                    value={inspectionData.tire_condition}
                    onChange={(e) => setInspectionData({...inspectionData, tire_condition: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-gray-700 text-sm mb-2 block">Overall Rating (1-10)</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={inspectionData.overall_rating}
                    onChange={(e) => setInspectionData({...inspectionData, overall_rating: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>Poor (1)</span>
                    <span className="font-bold text-blue-600 text-lg">{inspectionData.overall_rating}</span>
                    <span>Excellent (10)</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Photo Upload Sections */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Exterior Photos */}
              <Card className="p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-600" />
                  Exterior Photos ({exteriorPhotos.length})
                </h3>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handlePhotoUpload(e, 'exterior')}
                  className="hidden"
                  id="exterior-upload"
                />
                <label
                  htmlFor="exterior-upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload exterior photos</p>
                </label>
                {exteriorPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {exteriorPhotos.map((url, idx) => (
                      <img key={idx} src={url} alt={`Exterior ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                    ))}
                  </div>
                )}
              </Card>

              {/* Interior Photos */}
              <Card className="p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-purple-600" />
                  Interior Photos ({interiorPhotos.length})
                </h3>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handlePhotoUpload(e, 'interior')}
                  className="hidden"
                  id="interior-upload"
                />
                <label
                  htmlFor="interior-upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-purple-500 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload interior photos</p>
                </label>
                {interiorPhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {interiorPhotos.map((url, idx) => (
                      <img key={idx} src={url} alt={`Interior ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                    ))}
                  </div>
                )}
              </Card>

              {/* Engine/Mechanical Photos */}
              <Card className="p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-orange-600" />
                  Engine/Mechanical ({enginePhotos.length})
                </h3>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handlePhotoUpload(e, 'engine')}
                  className="hidden"
                  id="engine-upload"
                />
                <label
                  htmlFor="engine-upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-orange-500 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload engine/mechanical photos</p>
                </label>
                {enginePhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {enginePhotos.map((url, idx) => (
                      <img key={idx} src={url} alt={`Engine ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                    ))}
                  </div>
                )}
              </Card>

              {/* Damage Photos */}
              <Card className="p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-red-600" />
                  Damage Photos ({damagePhotos.length})
                </h3>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handlePhotoUpload(e, 'damage')}
                  className="hidden"
                  id="damage-upload"
                />
                <label
                  htmlFor="damage-upload"
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-red-500 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload damage photos (if any)</p>
                </label>
                {damagePhotos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    {damagePhotos.map((url, idx) => (
                      <img key={idx} src={url} alt={`Damage ${idx + 1}`} className="w-full h-20 object-cover rounded" />
                    ))}
                  </div>
                )}
              </Card>
            </div>

            {/* Damages & Issues */}
            <Card className="p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Damages & Issues</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="text-gray-700 text-sm mb-2 block">Damages Found</label>
                  <Textarea
                    value={inspectionData.damages_found}
                    onChange={(e) => setInspectionData({...inspectionData, damages_found: e.target.value})}
                    placeholder="Describe any visible damages (scratches, dents, rust, etc.)"
                    className="h-24"
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-2 block">Mechanical/Functional Issues</label>
                  <Textarea
                    value={inspectionData.issues_found}
                    onChange={(e) => setInspectionData({...inspectionData, issues_found: e.target.value})}
                    placeholder="Describe any mechanical or functional issues found"
                    className="h-24"
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-2 block">Additional Notes</label>
                  <Textarea
                    value={inspectionData.notes}
                    onChange={(e) => setInspectionData({...inspectionData, notes: e.target.value})}
                    placeholder="Any additional observations or notes"
                    className="h-24"
                  />
                </div>

                <div>
                  <label className="text-gray-700 text-sm mb-2 block">Recommended Action</label>
                  <select
                    value={inspectionData.recommended_action}
                    onChange={(e) => setInspectionData({...inspectionData, recommended_action: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="approve_delivery">Approve for Delivery</option>
                    <option value="minor_repairs_needed">Minor Repairs Needed</option>
                    <option value="major_repairs_needed">Major Repairs Needed</option>
                    <option value="not_recommended">Not Recommended</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Submit Button */}
            <Card className="p-6">
              <Alert className="mb-6 bg-blue-50 border-blue-200">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Review before submitting:</strong> Make sure all photos are uploaded and information is accurate. Admin will review your inspection.
                </AlertDescription>
              </Alert>

              <Button
                onClick={() => submitInspectionMutation.mutate()}
                disabled={submitInspectionMutation.isLoading || uploadingPhotos || exteriorPhotos.length === 0}
                className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
              >
                {submitInspectionMutation.isLoading ? (
                  "Submitting..."
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Submit Inspection
                  </>
                )}
              </Button>
              
              {exteriorPhotos.length === 0 && (
                <p className="text-center text-sm text-red-600 mt-3">
                  ⚠️ At least one exterior photo is required
                </p>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}