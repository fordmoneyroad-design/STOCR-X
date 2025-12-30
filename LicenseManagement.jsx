import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

const LICENSE_TYPES = [
  { id: "dealer_license", name: "Dealer License", department: "operations", required: true },
  { id: "wholesaler_license", name: "Wholesaler License", department: "operations", required: false },
  { id: "business_license", name: "Business License", department: "finance", required: true },
  { id: "sales_tax_permit", name: "Sales Tax Permit", department: "finance", required: true },
  { id: "dmv_registration", name: "DMV Registration", department: "fleet", required: true },
  { id: "towing_certification", name: "Towing Certification", department: "incidents", required: false },
  { id: "mechanic_certification", name: "Mechanic Certification", department: "fleet", required: false },
  { id: "insurance_policy", name: "Insurance Policy", department: "finance", required: true },
  { id: "w9_form", name: "W9 Form", department: "finance", required: true },
  { id: "resale_certificate", name: "Resale Certificate", department: "operations", required: false }
];

export default function LicenseManagement() {
  const [user, setUser] = useState(null);
  const [uploadingType, setUploadingType] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [expirationDate, setExpirationDate] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
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
  }, []);

  const { data: licenses } = useQuery({
    queryKey: ['company-licenses'],
    queryFn: () => base44.entities.Document.filter({ document_type: { $in: LICENSE_TYPES.map(l => l.id) } }),
    initialData: []
  });

  const uploadLicenseMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error("No file selected");
      
      const uploadResult = await base44.integrations.Core.UploadFile({ file: selectedFile });
      
      return await base44.entities.Document.create({
        customer_email: "STOCRX_COMPANY",
        document_type: uploadingType,
        document_url: uploadResult.file_url,
        uploaded_by: user.email,
        retention_until: expirationDate || null,
        notes: `License #: ${licenseNumber}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['company-licenses']);
      setUploadingType(null);
      setSelectedFile(null);
      setExpirationDate("");
      setLicenseNumber("");
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getLicenseStatus = (licenseType) => {
    const license = licenses.find(l => l.document_type === licenseType.id);
    if (!license) return licenseType.required ? 'missing' : 'optional';
    
    if (license.retention_until) {
      const expDate = new Date(license.retention_until);
      const today = new Date();
      const daysUntilExpiry = Math.floor((expDate - today) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry < 0) return 'expired';
      if (daysUntilExpiry < 30) return 'expiring';
    }
    
    return 'active';
  };

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
            <FileText className="w-10 h-10 text-blue-400" />
            License & Certification Management
          </h1>
          <p className="text-gray-400">Upload and track all company licenses and certifications</p>
        </div>

        {/* By Department */}
        {['operations', 'finance', 'fleet', 'incidents'].map(dept => {
          const deptLicenses = LICENSE_TYPES.filter(l => l.department === dept);
          
          return (
            <Card key={dept} className="p-6 bg-gray-800 border-gray-700 mb-6">
              <h2 className="text-2xl font-bold text-white mb-6 capitalize">{dept} Department</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {deptLicenses.map(licenseType => {
                  const status = getLicenseStatus(licenseType);
                  const license = licenses.find(l => l.document_type === licenseType.id);
                  
                  return (
                    <Card key={licenseType.id} className={`p-4 ${
                      status === 'expired' ? 'bg-red-900 border-red-700' :
                      status === 'expiring' ? 'bg-yellow-900 border-yellow-700' :
                      status === 'missing' ? 'bg-gray-700 border-gray-600' :
                      'bg-green-900 border-green-700'
                    }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-white">{licenseType.name}</h3>
                          {licenseType.required && (
                            <Badge className="bg-red-600 mt-1">Required</Badge>
                          )}
                        </div>
                        <Badge className={
                          status === 'active' ? 'bg-green-600' :
                          status === 'expiring' ? 'bg-yellow-600' :
                          status === 'expired' ? 'bg-red-600' :
                          'bg-gray-600'
                        }>
                          {status}
                        </Badge>
                      </div>

                      {license ? (
                        <div className="space-y-2 mb-3">
                          <p className="text-sm text-gray-300">
                            License #: {license.notes?.replace('License #: ', '') || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-300">
                            Expires: {license.retention_until ? new Date(license.retention_until).toLocaleDateString() : 'N/A'}
                          </p>
                          <Button
                            size="sm"
                            onClick={() => window.open(license.document_url, '_blank')}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            View Document
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 mb-3">No document uploaded</p>
                      )}

                      <Button
                        size="sm"
                        onClick={() => setUploadingType(licenseType.id)}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {license ? 'Update' : 'Upload'}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </Card>
          );
        })}

        {/* Upload Modal */}
        {uploadingType && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <Card className="p-8 bg-gray-800 border-gray-700 max-w-md w-full">
              <h3 className="text-2xl font-bold text-white mb-6">
                Upload {LICENSE_TYPES.find(l => l.id === uploadingType)?.name}
              </h3>

              <div className="space-y-4 mb-6">
                <div>
                  <Label className="text-gray-300 mb-2 block">License Number</Label>
                  <Input
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="ABC123456"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300 mb-2 block">Expiration Date</Label>
                  <Input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-gray-300 mb-2 block">Upload Document</Label>
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="w-full text-white"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setUploadingType(null);
                    setSelectedFile(null);
                    setExpirationDate("");
                    setLicenseNumber("");
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => uploadLicenseMutation.mutate()}
                  disabled={!selectedFile || uploadLicenseMutation.isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {uploadLicenseMutation.isLoading ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}