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
  Link as LinkIcon, Send, CheckCircle, Clock, 
  Bot, Mail, ArrowLeft, Eye, Sparkles
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
const VEHICLE_IMPORT_EMAIL = "vehicles@stocrx.com"; // Special email for AI to monitor

export default function CopartLinkImporter() {
  const [user, setUser] = useState(null);
  const [copartLinks, setCopartLinks] = useState("");
  const [notes, setNotes] = useState("");
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

  const { data: pendingImports } = useQuery({
    queryKey: ['pending-copart-imports'],
    queryFn: () => base44.entities.CopartListing.filter({ 
      imported_to_inventory: false 
    }),
    initialData: []
  });

  const sendLinksMutation = useMutation({
    mutationFn: async () => {
      const linksArray = copartLinks.split('\n').filter(l => l.trim());
      
      // Send to special email that AI monitors
      await base44.integrations.Core.SendEmail({
        to: VEHICLE_IMPORT_EMAIL,
        subject: `[COPART_IMPORT] ${linksArray.length} Vehicles to Add`,
        from_name: user.full_name || "STOCRX Admin",
        body: `
          NEW COPART VEHICLES FOR IMPORT
          
          Submitted by: ${user.email}
          Date: ${new Date().toLocaleString()}
          
          === COPART LINKS ===
          ${linksArray.map((link, idx) => `${idx + 1}. ${link}`).join('\n')}
          
          === NOTES ===
          ${notes || 'None'}
          
          === AI INSTRUCTIONS ===
          Please process these Copart links and:
          1. Extract vehicle details
          2. Download photos
          3. Generate descriptions
          4. Create CopartListing records
          5. Mark as "Coming Soon" in inventory
          6. Notify admin when ready for review
          
          AI will process within 24 hours.
        `
      });

      // Also notify admin
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: "Copart Import Request Submitted",
        body: `
          Your Copart import request has been sent!
          
          ${linksArray.length} vehicles submitted for processing.
          
          The AI assistant will:
          ✅ Process links within 24 hours
          ✅ Extract vehicle data
          ✅ Download photos
          ✅ Generate descriptions
          ✅ Add to "Coming Soon" inventory
          
          You'll receive a notification when ready for review.
          
          Monitor progress: ${window.location.origin}/app/CopartLocator
        `
      });

      // Log activity
      await base44.entities.ActivityLog.create({
        user_email: user.email,
        action_type: "copart_import_request",
        action_details: `Submitted ${linksArray.length} Copart links for AI processing`
      });

      return { success: true, count: linksArray.length };
    },
    onSuccess: (result) => {
      alert(`✅ Sent ${result.count} vehicles to AI for processing!`);
      setCopartLinks("");
      setNotes("");
    }
  });

  const markComingSoonMutation = useMutation({
    mutationFn: async (listingId) => {
      const listing = pendingImports.find(l => l.id === listingId);
      
      // Create vehicle as "Coming Soon"
      await base44.entities.Vehicle.create({
        make: listing.make,
        model: listing.model,
        year: listing.year,
        vin: listing.vin,
        price: (listing.buy_now_price || listing.estimated_value) + 700,
        buy_now_price: (listing.buy_now_price || listing.estimated_value) + 700,
        base_cost: listing.buy_now_price || listing.estimated_value,
        condition: listing.condition,
        damages: listing.damages,
        mileage: listing.odometer,
        images: listing.images || [],
        status: "reserved", // Coming Soon status
        location: `${listing.copart_location_city}, ${listing.copart_location_state}`,
        down_payment: Math.round(((listing.buy_now_price || listing.estimated_value) + 700) * 0.1),
        weekly_subscription: Math.round(((listing.buy_now_price || listing.estimated_value) + 700) / 52),
        monthly_subscription: Math.round(((listing.buy_now_price || listing.estimated_value) + 700) / 12),
        category: listing.category || "sedan"
      });

      // Mark as imported
      await base44.entities.CopartListing.update(listingId, {
        imported_to_inventory: true
      });

      return listing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-copart-imports']);
    }
  });

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
            <LinkIcon className="w-10 h-10 text-blue-400" />
            Copart Link Importer
          </h1>
          <p className="text-gray-400">Send Copart vehicle links for AI to process automatically</p>
        </div>

        <Alert className="mb-8 bg-blue-900 border-blue-700">
          <Bot className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-200">
            <strong>AI-Powered Import:</strong> Send Copart links via email. AI will extract data, download photos, generate descriptions, and add to "Coming Soon" inventory within 24 hours.
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Send Links Form */}
          <Card className="p-8 bg-gray-800 border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Submit Copart Links</h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-gray-300 text-sm mb-2 block">
                  Copart Vehicle Links *
                </label>
                <Textarea
                  value={copartLinks}
                  onChange={(e) => setCopartLinks(e.target.value)}
                  placeholder="Paste Copart links (one per line):
https://www.copart.com/lot/12345678
https://www.copart.com/lot/87654321
https://www.copart.com/lot/11223344"
                  className="bg-gray-700 border-gray-600 text-white h-48 font-mono text-sm"
                />
                <p className="text-xs text-gray-400 mt-2">
                  Paste one link per line. AI will process all links.
                </p>
              </div>

              <div>
                <label className="text-gray-300 text-sm mb-2 block">
                  Notes (Optional)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any special instructions for AI processing..."
                  className="bg-gray-700 border-gray-600 text-white h-24"
                />
              </div>

              <Button
                onClick={() => sendLinksMutation.mutate()}
                disabled={!copartLinks.trim() || sendLinksMutation.isLoading}
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg"
              >
                {sendLinksMutation.isLoading ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send to AI for Processing
                  </>
                )}
              </Button>
            </div>

            {/* How It Works */}
            <div className="mt-8 bg-gray-700 p-6 rounded-lg">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                How AI Processing Works
              </h3>
              <ol className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-400">1.</span>
                  You paste Copart links and click "Send"
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-400">2.</span>
                  Email sent to AI monitoring system
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-400">3.</span>
                  AI extracts vehicle data from Copart
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-400">4.</span>
                  AI downloads all photos
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-400">5.</span>
                  AI generates professional descriptions
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-400">6.</span>
                  Creates CopartListing record (Coming Soon)
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-400">7.</span>
                  You receive email when ready for review
                </li>
              </ol>
            </div>
          </Card>

          {/* Pending Imports */}
          <Card className="p-8 bg-gray-800 border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">
              AI Processed - Ready to Add ({pendingImports.length})
            </h2>

            {pendingImports.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">No pending imports</p>
                <p className="text-sm text-gray-500 mt-2">
                  Submit Copart links to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {pendingImports.map((listing) => (
                  <Card key={listing.id} className="p-4 bg-gray-700 border-gray-600">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-white text-lg">
                          {listing.year} {listing.make} {listing.model}
                        </p>
                        <p className="text-sm text-gray-400">
                          Lot: {listing.copart_lot_number}
                        </p>
                      </div>
                      <Badge className="bg-purple-600">AI Processed</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div>
                        <p className="text-gray-400">Price</p>
                        <p className="text-white font-bold">
                          ${listing.buy_now_price?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Location</p>
                        <p className="text-white">
                          {listing.copart_location_city}, {listing.copart_location_state}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Condition</p>
                        <Badge className="bg-orange-600">{listing.condition}</Badge>
                      </div>
                      <div>
                        <p className="text-gray-400">Photos</p>
                        <p className="text-white">{listing.images?.length || 0} images</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          // Preview first image
                          if (listing.images && listing.images.length > 0) {
                            window.open(listing.images[0], '_blank');
                          }
                        }}
                        variant="outline"
                        className="border-blue-500 text-blue-400"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => markComingSoonMutation.mutate(listing.id)}
                        disabled={markComingSoonMutation.isLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Add as Coming Soon
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Email Instructions */}
        <Card className="p-8 bg-gradient-to-br from-purple-900 to-blue-900 border-purple-700 mt-8">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-8 h-8 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">AI Email Monitoring</h2>
          </div>
          
          <Alert className="mb-6 bg-white/10 border-white/20">
            <Sparkles className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-white">
              <strong>Smart Feature:</strong> You can also email Copart links directly to <span className="font-mono bg-black/30 px-2 py-1 rounded">{VEHICLE_IMPORT_EMAIL}</span> and AI will auto-process them!
            </AlertDescription>
          </Alert>

          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <h3 className="font-bold text-white mb-4">Email Format:</h3>
            <div className="bg-black/30 p-4 rounded font-mono text-sm text-gray-300 whitespace-pre">
{`To: ${VEHICLE_IMPORT_EMAIL}
Subject: Add Vehicles

https://www.copart.com/lot/12345678
https://www.copart.com/lot/87654321

Notes: These look promising for inventory`}
            </div>
            <p className="text-purple-200 text-sm mt-4">
              AI monitors this email 24/7 and auto-processes within 1 hour.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}