import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft, DollarSign, MapPin, FileText, AlertTriangle, 
  CheckCircle, Package, TrendingUp, Calendar, Shield
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import SuperAdminQuickActions from "../components/admin/SuperAdminQuickActions";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function TaxManagement() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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

  const { data: taxRegions } = useQuery({
    queryKey: ['tax-regions'],
    queryFn: () => base44.entities.TaxRegion.list("-created_date"),
    initialData: []
  });

  const { data: taxOverrides } = useQuery({
    queryKey: ['tax-overrides'],
    queryFn: () => base44.entities.TaxOverride.list("-created_date"),
    initialData: []
  });

  const { data: taxCategories } = useQuery({
    queryKey: ['tax-categories'],
    queryFn: () => base44.entities.ProductTaxCategory.list(),
    initialData: []
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const activeRegions = taxRegions.filter(r => r.collect_tax);
  const registeredRegions = taxRegions.filter(r => r.registered);
  const thresholdMet = taxRegions.filter(r => r.threshold_met);
  const uncategorizedProducts = 7; // This would come from vehicle query

  const totalTransactionFees = activeRegions.length * 0.0035; // 0.35% per region

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
            <DollarSign className="w-10 h-10 text-green-400" />
            Tax Management Center
          </h1>
          <p className="text-gray-400">Manage tax collection, regions, and compliance</p>
        </div>

        {/* Tax Service Status */}
        <Card className="p-8 bg-gradient-to-br from-green-900 to-emerald-900 border-green-700 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">STOCRX Tax Service</h2>
              <p className="text-green-200 mb-4">Complete • Enabled • Active</p>
              <Badge className="bg-green-600 text-white text-sm px-3 py-1">
                {totalTransactionFees.toFixed(2)}% transaction fees when you reach $100,000 in global sales
              </Badge>
            </div>
            <CheckCircle className="w-16 h-16 text-green-400" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
              <FileText className="w-8 h-8 text-green-400 mb-2" />
              <p className="text-white font-bold">File & Remit</p>
              <p className="text-green-200 text-sm">Access data to file in each jurisdiction</p>
            </div>
            <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
              <TrendingUp className="w-8 h-8 text-yellow-400 mb-2" />
              <p className="text-white font-bold">Tax Liability Insights</p>
              <p className="text-green-200 text-sm">Stay compliant with threshold tracking</p>
            </div>
            <div className="bg-white/10 backdrop-blur p-4 rounded-lg">
              <Shield className="w-8 h-8 text-blue-400 mb-2" />
              <p className="text-white font-bold">Automatic Compliance</p>
              <p className="text-green-200 text-sm">Know when to start collecting</p>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-blue-900 border-blue-700">
            <MapPin className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-blue-200 text-sm mb-1">Collecting In</p>
            <p className="text-4xl font-bold text-blue-400">{activeRegions.length}</p>
            <p className="text-xs text-blue-300 mt-1">States</p>
          </Card>

          <Card className="p-6 bg-green-900 border-green-700">
            <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-green-200 text-sm mb-1">Registered</p>
            <p className="text-4xl font-bold text-green-400">{registeredRegions.length}</p>
            <p className="text-xs text-green-300 mt-1">Regions</p>
          </Card>

          <Card className="p-6 bg-yellow-900 border-yellow-700">
            <AlertTriangle className="w-8 h-8 text-yellow-400 mb-2" />
            <p className="text-yellow-200 text-sm mb-1">Threshold Met</p>
            <p className="text-4xl font-bold text-yellow-400">{thresholdMet.length}</p>
            <p className="text-xs text-yellow-300 mt-1">States</p>
          </Card>

          <Card className="p-6 bg-purple-900 border-purple-700">
            <Package className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-purple-200 text-sm mb-1">Overrides</p>
            <p className="text-4xl font-bold text-purple-400">{taxOverrides.length}</p>
            <p className="text-xs text-purple-300 mt-1">Active</p>
          </Card>
        </div>

        {/* Important Notice */}
        <Alert className="mb-8 bg-orange-900/30 border-orange-700">
          <AlertTriangle className="h-4 w-4 text-orange-400" />
          <AlertDescription className="text-orange-200">
            <strong>Tax is Your Responsibility:</strong> STOCRX does not file your taxes for you unless you use automated filing. 
            The calculations and reports we provide help make things easier when it's time to file and pay your taxes. 
            If you're unsure about your tax liability, consult with a tax professional.
          </AlertDescription>
        </Alert>

        {/* Tax Management Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className="p-6 bg-gray-800 border-gray-700 cursor-pointer hover:border-blue-500 transition-all"
            onClick={() => navigate(createPageUrl("TaxRegions"))}
          >
            <MapPin className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Tax Regions</h3>
            <p className="text-gray-400 mb-4">
              Areas where your customers pay tax, and where you collect and remit. 
              Register with each state before collecting sales tax.
            </p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Manage Tax Regions →
            </Button>
          </Card>

          <Card 
            className="p-6 bg-gray-800 border-gray-700 cursor-pointer hover:border-green-500 transition-all"
            onClick={() => navigate(createPageUrl("TaxRates"))}
          >
            <DollarSign className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Tax Rates & Exemptions</h3>
            <p className="text-gray-400 mb-4">
              Automatically improve regional tax rate accuracy with product categorization. 
              Manage shipping and product overrides.
            </p>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Configure Tax Rates →
            </Button>
          </Card>

          <Card 
            className="p-6 bg-gray-800 border-gray-700 cursor-pointer hover:border-purple-500 transition-all"
            onClick={() => navigate(createPageUrl("ProductTaxCategories"))}
          >
            <Package className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Product Tax Categories</h3>
            <p className="text-gray-400 mb-4">
              Improve tax accuracy by categorizing products. 
              {uncategorizedProducts > 0 && (
                <span className="text-yellow-400"> {uncategorizedProducts} uncategorized products</span>
              )}
            </p>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              Categorize Products →
            </Button>
          </Card>

          <Card 
            className="p-6 bg-gray-800 border-gray-700 cursor-pointer hover:border-yellow-500 transition-all"
            onClick={() => navigate(createPageUrl("TaxReports"))}
          >
            <FileText className="w-12 h-12 text-yellow-400 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Tax Reports & Filing</h3>
            <p className="text-gray-400 mb-4">
              Access the data you need to file in each jurisdiction. 
              View tax liability insights and filing schedules.
            </p>
            <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
              View Reports →
            </Button>
          </Card>
        </div>

        {/* Threshold Notifications */}
        {thresholdMet.length > 0 && (
          <Card className="p-6 bg-red-900/30 border-red-700 mt-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              Action Required: Tax Thresholds Met
            </h3>
            <div className="space-y-3">
              {thresholdMet.map((region) => (
                <div key={region.id} className="bg-red-800/30 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white">{region.region_name}</p>
                      <p className="text-sm text-red-200">
                        ${region.current_sales?.toLocaleString()} / ${region.threshold_amount?.toLocaleString()} threshold
                      </p>
                    </div>
                    {!region.registered && (
                      <Badge className="bg-red-600 text-white">Register Required</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <SuperAdminQuickActions />
      </div>
    </div>
  );
}