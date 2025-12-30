import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calculator, DollarSign, FileText } from "lucide-react";
import SuperAdminQuickActions from "../components/admin/SuperAdminQuickActions";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function IRSTaxCalculator() {
  const [user, setUser] = useState(null);
  const [employeeType, setEmployeeType] = useState("w2");
  const [annualIncome, setAnnualIncome] = useState("");
  const [taxResults, setTaxResults] = useState(null);

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

  const calculateTaxes = () => {
    const income = parseFloat(annualIncome);
    
    // 2024 Federal Tax Brackets (simplified)
    let federalTax = 0;
    if (income <= 11000) {
      federalTax = income * 0.10;
    } else if (income <= 44725) {
      federalTax = 1100 + (income - 11000) * 0.12;
    } else if (income <= 95375) {
      federalTax = 5147 + (income - 44725) * 0.22;
    } else {
      federalTax = 16290 + (income - 95375) * 0.24;
    }

    // Social Security & Medicare (FICA)
    const socialSecurity = Math.min(income * 0.062, 160200 * 0.062);
    const medicare = income * 0.0145;
    
    // Michigan State Tax (4.25%)
    const stateTax = income * 0.0425;

    // 1099 additional self-employment tax
    const selfEmploymentTax = employeeType === "1099" ? (income * 0.153) : 0;

    const totalTax = federalTax + socialSecurity + medicare + stateTax + selfEmploymentTax;
    const netIncome = income - totalTax;

    setTaxResults({
      grossIncome: income,
      federalTax,
      socialSecurity,
      medicare,
      stateTax,
      selfEmploymentTax,
      totalTax,
      netIncome,
      effectiveRate: (totalTax / income * 100).toFixed(2)
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
            <Calculator className="w-10 h-10 text-yellow-400" />
            IRS Tax Calculator
          </h1>
          <p className="text-gray-400">Calculate W-2 and 1099 tax obligations</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calculator Input */}
          <Card className="p-8 bg-gray-800 border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Tax Calculator</h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-gray-300 text-sm mb-2 block">Employee Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setEmployeeType("w2")}
                    className={employeeType === "w2" ? "bg-blue-600" : "bg-gray-700"}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    W-2 Employee
                  </Button>
                  <Button
                    onClick={() => setEmployeeType("1099")}
                    className={employeeType === "1099" ? "bg-purple-600" : "bg-gray-700"}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    1099 Contractor
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">Annual Income</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="number"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                    placeholder="50000"
                    className="bg-gray-700 border-gray-600 text-white pl-10 h-12 text-lg"
                  />
                </div>
              </div>

              <Button
                onClick={calculateTaxes}
                disabled={!annualIncome}
                className="w-full h-12 bg-green-600 hover:bg-green-700"
              >
                Calculate Taxes
              </Button>
            </div>
          </Card>

          {/* Results */}
          {taxResults && (
            <Card className="p-8 bg-gray-800 border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6">Tax Breakdown</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                  <span className="text-gray-300">Gross Income</span>
                  <span className="font-bold text-white text-lg">
                    ${taxResults.grossIncome.toLocaleString()}
                  </span>
                </div>

                <div className="border-t border-gray-600 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Federal Tax</span>
                    <span className="text-red-400">-${taxResults.federalTax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Social Security</span>
                    <span className="text-red-400">-${taxResults.socialSecurity.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Medicare</span>
                    <span className="text-red-400">-${taxResults.medicare.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Michigan State Tax</span>
                    <span className="text-red-400">-${taxResults.stateTax.toLocaleString()}</span>
                  </div>
                  {employeeType === "1099" && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Self-Employment Tax</span>
                      <span className="text-red-400">-${taxResults.selfEmploymentTax.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-600 pt-4">
                  <div className="flex justify-between items-center p-3 bg-red-900/30 rounded-lg mb-3">
                    <span className="text-gray-300 font-semibold">Total Tax</span>
                    <span className="font-bold text-red-400 text-lg">
                      -${taxResults.totalTax.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-green-900/30 rounded-lg">
                    <span className="text-gray-300 font-semibold">Net Income</span>
                    <span className="font-bold text-green-400 text-xl">
                      ${taxResults.netIncome.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Badge className="w-full justify-center py-2 bg-blue-600">
                  Effective Tax Rate: {taxResults.effectiveRate}%
                </Badge>
              </div>
            </Card>
          )}
        </div>

        <SuperAdminQuickActions />
      </div>
    </div>
  );
}