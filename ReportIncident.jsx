import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createPageUrl } from "@/utils";

export default function ReportIncident() {
  const [user, setUser] = useState(null);
  const [reportType, setReportType] = useState("damage");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [photos, setPhotos] = useState([]);
  const [policeReport, setPoliceReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const { data: subscriptions } = useQuery({
    queryKey: ['subscriptions', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ customer_email: user?.email }, "-created_date"),
    enabled: !!user,
    initialData: []
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles', subscriptions],
    queryFn: async () => {
      if (!subscriptions || subscriptions.length === 0) return [];
      const vehicleIds = subscriptions.map(sub => sub.vehicle_id);
      const allVehicles = await Promise.all(
        vehicleIds.map(id => base44.entities.Vehicle.filter({ id }))
      );
      return allVehicles.flat();
    },
    enabled: subscriptions && subscriptions.length > 0,
    initialData: []
  });

  const activeSubscription = subscriptions?.find(sub => sub.status === "active");
  const activeVehicle = activeSubscription ? vehicles?.find(v => v.id === activeSubscription.vehicle_id) : null;

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    setLoading(true);
    
    try {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const result = await base44.integrations.Core.UploadFile({ file });
          return result.file_url;
        })
      );
      setPhotos([...photos, ...uploadedUrls]);
    } catch (err) {
      alert("Error uploading photos. Please try again.");
    }
    setLoading(false);
  };

  const handlePoliceReportUpload = async (e) => {
    const file = e.target.files[0];
    setLoading(true);
    
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setPoliceReport(result.file_url);
    } catch (err) {
      alert("Error uploading police report. Please try again.");
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!description || !location || !incidentDate) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Create damage report
      await base44.entities.DamageReport.create({
        subscription_id: activeSubscription.id,
        vehicle_id: activeVehicle.id,
        report_type: reportType,
        description: description,
        incident_date: incidentDate,
        location: location,
        photos: photos,
        police_report_url: policeReport,
        status: "submitted"
      });

      // Send email notification
      await base44.integrations.Core.SendEmail({
        to: "stocrx@gmail.com",
        subject: `Incident Report - ${reportType.toUpperCase()} - ${user.email}`,
        body: `
          Incident Report Submitted:
          
          Type: ${reportType.toUpperCase()}
          Customer: ${user.full_name || user.email}
          Email: ${user.email}
          
          Vehicle: ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}
          VIN: ${activeVehicle.vin}
          
          Date of Incident: ${incidentDate}
          Location: ${location}
          
          Description:
          ${description}
          
          Photos: ${photos.length} attached
          Police Report: ${policeReport ? 'Yes' : 'No'}
          
          Please review and contact the customer as soon as possible.
        `
      });

      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Error submitting report. Please try again.");
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!activeSubscription || !activeVehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-12 text-center border-none shadow-xl">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Active Subscription</h3>
            <p className="text-gray-600 mb-6">You need an active subscription to report an incident.</p>
            <Button onClick={() => window.location.href = createPageUrl("BrowseCars")}>
              Browse Available Cars
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {success && (
          <Alert className="mb-8 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Report submitted successfully! We'll contact you within 24 hours to address this incident.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-red-100 px-4 py-2 rounded-full text-red-800 mb-4">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold">Incident Report</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Report an Incident
          </h1>
          <p className="text-gray-600">
            Damage • Tow • Impound • Theft • Accident
          </p>
        </div>

        {/* Vehicle Info */}
        <Card className="p-6 border-none shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 mb-8">
          <h3 className="font-bold text-lg text-gray-900 mb-2">Your Vehicle</h3>
          <p className="text-2xl font-bold text-gray-900">
            {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
          </p>
          <p className="text-sm text-gray-600 mt-1">VIN: {activeVehicle.vin}</p>
        </Card>

        <Card className="p-8 border-none shadow-xl">
          <div className="space-y-6">
            {/* Incident Type */}
            <div>
              <Label className="text-lg font-semibold mb-3 block">Type of Incident *</Label>
              <RadioGroup value={reportType} onValueChange={setReportType}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { value: "damage", label: "Damage", icon: "🔧" },
                    { value: "tow", label: "Tow", icon: "🚛" },
                    { value: "impound", label: "Impound", icon: "🏢" },
                    { value: "stolen", label: "Stolen", icon: "🚨" },
                    { value: "accident", label: "Accident", icon: "💥" }
                  ].map((type) => (
                    <div key={type.value} className="flex items-center space-x-2 border-2 rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                      <RadioGroupItem value={type.value} id={type.value} />
                      <Label htmlFor={type.value} className="cursor-pointer flex items-center gap-2 flex-1">
                        <span className="text-2xl">{type.icon}</span>
                        <span>{type.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Incident Date */}
            <div>
              <Label className="text-lg font-semibold mb-3 block">Date of Incident *</Label>
              <Input
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="h-12"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Location */}
            <div>
              <Label className="text-lg font-semibold mb-3 block">Location *</Label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where did this happen?"
                className="h-12"
              />
            </div>

            {/* Description */}
            <div>
              <Label className="text-lg font-semibold mb-3 block">Detailed Description *</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide as much detail as possible about what happened..."
                className="h-40"
              />
            </div>

            {/* Photos */}
            <div>
              <Label className="text-lg font-semibold mb-3 block">Photos</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photos"
                />
                <label htmlFor="photos" className="cursor-pointer">
                  {photos.length > 0 ? (
                    <div>
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-600" />
                      <p className="text-green-600 font-semibold">{photos.length} photo(s) uploaded</p>
                      <p className="text-sm text-gray-500 mt-1">Click to add more</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">Click to upload photos of the incident</p>
                      <p className="text-sm text-gray-500 mt-1">Multiple photos recommended</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Police Report */}
            <div>
              <Label className="text-lg font-semibold mb-3 block">Police Report (if applicable)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handlePoliceReportUpload}
                  className="hidden"
                  id="police-report"
                />
                <label htmlFor="police-report" className="cursor-pointer">
                  {policeReport ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="w-6 h-6" />
                      <span>Police report uploaded</span>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">Click to upload police report</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Warning */}
            <Alert variant="destructive" className="bg-red-50 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Important:</strong> False reports may result in immediate termination of your subscription. Please provide accurate information.
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading || success || !description || !location || !incidentDate}
              className="w-full h-16 text-xl bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 shadow-xl"
            >
              {loading ? "Submitting Report..." : success ? "Report Submitted!" : "Submit Incident Report"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}