import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, FileText, Download, Calendar, DollarSign, MapPin, TrendingUp
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function TaxReports() {
  const [user, setUser] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("current_quarter");
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
    queryFn: () => base44.entities.TaxRegion.list(),
    initialData: []
  });

  const { data: payments } = useQuery({
    queryKey: ['all-payments'],
    queryFn: () => base44.entities.Payment.list("-created_date", 100),
    initialData: []
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalTaxCollected = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + (p.amount * 0.06), 0); // Assuming 6% average

  const nextFilingRegions = taxRegions
    .filter(r => r.collect_tax && r.next_filing_date)
    .sort((a, b) => new Date(a.next_filing_date) - new Date(b.next_filing_date));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("TaxManagement"))}
          className="text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tax Management
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <FileText className="w-10 h-10 text-yellow-400" />
            Tax Reports & Filing
          </h1>
          <p className="text-gray-400">Access data to file in each jurisdiction</p>
        </div>

        {/* Summary Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-green-900 border-green-700">
            <DollarSign className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-green-200 text-sm mb-1">Total Tax Collected</p>
            <p className="text-4xl font-bold text-green-400">${totalTaxCollected.toLocaleString()}</p>
            <p className="text-xs text-green-300 mt-1">Current Quarter</p>
          </Card>

          <Card className="p-6 bg-blue-900 border-blue-700">
            <MapPin className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-blue-200 text-sm mb-1">Active Jurisdictions</p>
            <p className="text-4xl font-bold text-blue-400">{taxRegions.filter(r => r.collect_tax).length}</p>
            <p className="text-xs text-blue-300 mt-1">Collecting tax</p>
          </Card>

          <Card className="p-6 bg-yellow-900 border-yellow-700">
            <Calendar className="w-8 h-8 text-yellow-400 mb-2" />
            <p className="text-yellow-200 text-sm mb-1">Next Filing</p>
            <p className="text-2xl font-bold text-yellow-400">
              {nextFilingRegions[0]?.next_filing_date 
                ? new Date(nextFilingRegions[0].next_filing_date).toLocaleDateString()
                : 'N/A'}
            </p>
            <p className="text-xs text-yellow-300 mt-1">{nextFilingRegions[0]?.region_name || 'No pending'}</p>
          </Card>
        </div>

        {/* Period Selector */}
        <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Select Report Period</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { value: 'current_month', label: 'Current Month' },
              { value: 'current_quarter', label: 'Current Quarter' },
              { value: 'last_quarter', label: 'Last Quarter' },
              { value: 'current_year', label: 'Current Year' }
            ].map((period) => (
              <Button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={selectedPeriod === period.value ? 'bg-blue-600' : 'bg-gray-700'}
              >
                {period.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* Tax by Region */}
        <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Tax by Region</h2>
            <Button className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>

          <div className="space-y-4">
            {taxRegions
              .filter(r => r.collect_tax)
              .map((region) => {
                const regionSales = region.current_sales || 0;
                const taxCollected = regionSales * (region.tax_rate / 100);

                return (
                  <Card key={region.id} className="p-6 bg-gray-700 border-gray-600">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{region.region_name}</h3>
                        <p className="text-sm text-gray-400">Tax Rate: {region.tax_rate}%</p>
                      </div>
                      <div className="flex gap-2">
                        {region.registered && (
                          <Badge className="bg-green-600">Registered</Badge>
                        )}
                        <Badge className="bg-blue-600">{region.filing_frequency}</Badge>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-gray-400 text-sm">Total Sales</p>
                        <p className="text-2xl font-bold text-white">${regionSales.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Tax Collected</p>
                        <p className="text-2xl font-bold text-green-400">${taxCollected.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Next Filing</p>
                        <p className="text-white font-bold">
                          {region.next_filing_date 
                            ? new Date(region.next_filing_date).toLocaleDateString()
                            : 'Not set'}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
          </div>
        </Card>

        {/* Filing Calendar */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-400" />
            Upcoming Filing Deadlines
          </h2>

          {nextFilingRegions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No upcoming filing deadlines</p>
          ) : (
            <div className="space-y-3">
              {nextFilingRegions.map((region) => (
                <div key={region.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-bold text-white">{region.region_name}</p>
                    <p className="text-sm text-gray-400">{region.filing_frequency} filing</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-yellow-400">
                      {new Date(region.next_filing_date).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {Math.ceil((new Date(region.next_filing_date) - new Date()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}