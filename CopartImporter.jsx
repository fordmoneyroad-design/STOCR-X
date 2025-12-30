import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Link as LinkIcon, Sparkles, CheckCircle, AlertTriangle, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function CopartImporter() {
  const [user, setUser] = useState(null);
  const [copartLinks, setCopartLinks] = useState("");
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);
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

  const processCopartLinks = async () => {
    if (!copartLinks.trim()) {
      alert("Please enter Copart links or lot numbers");
      return;
    }

    setProcessing(true);
    setResults(null);

    try {
      // Use AI to extract and process Copart data
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a Copart vehicle data processor. Extract vehicle information from these Copart links or lot numbers:

${copartLinks}

For each vehicle, extract:
- Lot number (if available)
- Make and model (guess if not in link)
- Year (guess recent years if not specified)
- Condition hints from URL (runs/drives, damage type)
- Generate a Copart URL (format: https://www.copart.com/lot/LOTNUMBER)

Categorize each vehicle:
1. Condition: runs_drives, runs_only, does_not_run, unknown
2. Damage: none, hail, normal_wear, minor_dents_scratches, front_end, rear_end, side_damage, major_damage
3. Title: clean, salvage, rebuilt, unknown
4. Subscription tier fit: free, standard, premium, military, high_end
5. Dealer only: true/false
6. Status: approved_for_import (if good condition), needs_review (if damaged/unclear)

Return JSON array of vehicles.`,
        response_json_schema: {
          type: "object",
          properties: {
            vehicles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  copart_lot_number: { type: "string" },
                  vehicle_make: { type: "string" },
                  vehicle_model: { type: "string" },
                  vehicle_year: { type: "number" },
                  condition: { type: "string" },
                  damage_type: { type: "string" },
                  title_status: { type: "string" },
                  subscription_tier_target: { type: "string" },
                  dealer_only: { type: "boolean" },
                  copart_url: { type: "string" },
                  status: { type: "string" },
                  ai_notes: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Save to watchlist
      const vehicles = aiResponse.vehicles || [];
      const importedVehicles = [];

      for (const vehicle of vehicles) {
        try {
          const created = await base44.entities.CopartWatchlist.create(vehicle);
          importedVehicles.push(created);
        } catch (err) {
          console.error("Error importing vehicle:", err);
        }
      }

      setResults({
        total: vehicles.length,
        imported: importedVehicles.length,
        approved: importedVehicles.filter(v => v.status === 'approved_for_import').length,
        needsReview: importedVehicles.filter(v => v.status === 'needs_review').length,
        vehicles: importedVehicles
      });

      queryClient.invalidateQueries(['copart-watchlist']);
      
    } catch (error) {
      alert("Error processing Copart data: " + error.message);
    } finally {
      setProcessing(false);
    }
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Upload className="w-10 h-10 text-blue-400" />
            Copart AI Importer
          </h1>
          <p className="text-gray-400">Import vehicles from Copart using AI processing</p>
        </div>

        <Alert className="mb-8 bg-blue-900/30 border-blue-700">
          <Sparkles className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-200">
            <strong>AI-Powered Import:</strong> Paste Copart links or lot numbers below. 
            AI will automatically extract vehicle details, categorize condition, and recommend subscription tiers.
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Import Form */}
          <Card className="p-8 bg-gray-800 border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <LinkIcon className="w-6 h-6 text-green-400" />
              Paste Copart Data
            </h2>

            <div className="space-y-6">
              <div>
                <label className="text-white font-semibold mb-2 block">Copart Links or Lot Numbers</label>
                <Textarea
                  value={copartLinks}
                  onChange={(e) => setCopartLinks(e.target.value)}
                  placeholder={`Paste Copart links or lot numbers, one per line:

https://www.copart.com/lot/12345678
https://www.copart.com/lot/87654321
12345678
87654321

Or paste comma-separated: 12345678, 87654321, 11223344`}
                  className="bg-gray-700 border-gray-600 text-white h-64"
                />
              </div>

              <Button
                onClick={processCopartLinks}
                disabled={processing}
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg h-14"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 mr-2" />
                    Process with AI
                  </>
                )}
              </Button>

              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-yellow-400" />
                  What AI Does:
                </h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>✅ Extracts lot numbers and vehicle details</li>
                  <li>✅ Determines condition (runs/drives, damage)</li>
                  <li>✅ Categorizes damage type</li>
                  <li>✅ Recommends subscription tier</li>
                  <li>✅ Flags dealer-only vehicles</li>
                  <li>✅ Auto-approves good condition cars</li>
                  <li>✅ Marks damaged cars for review</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Results */}
          <Card className="p-8 bg-gray-800 border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Import Results</h2>

            {!results ? (
              <div className="text-center py-12">
                <Upload className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">No import results yet</p>
                <p className="text-sm text-gray-500 mt-2">Paste links and click "Process with AI"</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 bg-blue-900 border-blue-700">
                    <p className="text-blue-200 text-sm">Total Processed</p>
                    <p className="text-4xl font-bold text-white">{results.total}</p>
                  </Card>
                  <Card className="p-4 bg-green-900 border-green-700">
                    <p className="text-green-200 text-sm">Imported</p>
                    <p className="text-4xl font-bold text-white">{results.imported}</p>
                  </Card>
                  <Card className="p-4 bg-green-900 border-green-700">
                    <p className="text-green-200 text-sm">Auto-Approved</p>
                    <p className="text-4xl font-bold text-white">{results.approved}</p>
                  </Card>
                  <Card className="p-4 bg-yellow-900 border-yellow-700">
                    <p className="text-yellow-200 text-sm">Needs Review</p>
                    <p className="text-4xl font-bold text-white">{results.needsReview}</p>
                  </Card>
                </div>

                {/* Vehicle List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {results.vehicles.map((vehicle, idx) => (
                    <Card key={idx} className="p-4 bg-gray-700 border-gray-600">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-bold text-white">
                            {vehicle.vehicle_year} {vehicle.vehicle_make} {vehicle.vehicle_model}
                          </p>
                          <p className="text-sm text-gray-400">Lot: {vehicle.copart_lot_number}</p>
                        </div>
                        <Badge className={
                          vehicle.status === 'approved_for_import' ? 'bg-green-600' : 'bg-yellow-600'
                        }>
                          {vehicle.status === 'approved_for_import' ? 'Approved' : 'Review'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <Badge className="bg-blue-600 text-xs">{vehicle.condition}</Badge>
                        <Badge className="bg-purple-600 text-xs">{vehicle.damage_type}</Badge>
                        <Badge className="bg-orange-600 text-xs">{vehicle.subscription_tier_target}</Badge>
                      </div>
                      {vehicle.ai_notes && (
                        <p className="text-xs text-gray-400 mt-2">{vehicle.ai_notes}</p>
                      )}
                    </Card>
                  ))}
                </div>

                <Button
                  onClick={() => window.location.href = '/CopartWatchlist'}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  View Full Watchlist
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}