import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft, Users, Shield, Globe, Star, MapPin, Truck, 
  Search, CheckCircle, XCircle, Clock, AlertTriangle, Briefcase,
  Award, Filter
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

// Service zones (major hubs)
const SERVICE_ZONES = [
  { city: "Detroit", state: "MI", zip: "48201" },
  { city: "Los Angeles", state: "CA", zip: "90001" },
  { city: "Miami", state: "FL", zip: "33101" },
  { city: "Houston", state: "TX", zip: "77001" },
  { city: "Phoenix", state: "AZ", zip: "85001" }
];

export default function PendingUsers() {
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [zipFilter, setZipFilter] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const navigate = useNavigate();
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

  const { data: pendingUsers } = useQuery({
    queryKey: ['pending-users'],
    queryFn: () => base44.entities.PendingUser.list("-created_date"),
    initialData: []
  });

  const { data: shippingQuotes } = useQuery({
    queryKey: ['shipping-quotes'],
    queryFn: () => base44.entities.ShippingQuote.list("-created_date"),
    initialData: []
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, approvedTier }) => {
      return await base44.entities.PendingUser.update(id, {
        status: 'approved',
        approved_tier: approvedTier,
        reviewed_by: user.email,
        review_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-users']);
      alert("✅ User approved!");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }) => {
      return await base44.entities.PendingUser.update(id, {
        status: 'rejected',
        rejection_reason: reason,
        reviewed_by: user.email,
        review_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-users']);
      alert("❌ User rejected");
    }
  });

  const generateShippingQuoteMutation = useMutation({
    mutationFn: async (pendingUser) => {
      // Calculate distance from nearest hub
      const userZip = parseInt(pendingUser.zip_code);
      let nearestHub = SERVICE_ZONES[0];
      let minDistance = 999999;

      SERVICE_ZONES.forEach(hub => {
        const hubZip = parseInt(hub.zip);
        const distance = Math.abs(userZip - hubZip) * 0.7; // Rough estimate
        if (distance < minDistance) {
          minDistance = distance;
          nearestHub = hub;
        }
      });

      // Calculate shipping quote
      const baseRate = 200;
      const perMileRate = 1.5;
      const distance = minDistance;
      const quoteAmount = baseRate + (distance * perMileRate);

      // Create shipping quote
      const quote = await base44.entities.ShippingQuote.create({
        customer_email: pendingUser.email,
        pending_user_id: pendingUser.id,
        from_zip: nearestHub.zip,
        to_zip: pendingUser.zip_code,
        distance_miles: distance,
        quote_amount: quoteAmount,
        quote_source: 'calculated',
        base_rate: baseRate,
        per_mile_rate: perMileRate,
        delivery_timeframe: distance > 500 ? "7-10 business days" : "3-5 business days",
        carrier_type: 'open_transport',
        status: 'draft',
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });

      // Update pending user
      await base44.entities.PendingUser.update(pendingUser.id, {
        shipping_quote_requested: true,
        shipping_quote_amount: quoteAmount,
        copart_shipping_quote: quoteAmount,
        distance_from_hub: distance
      });

      return quote;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-users']);
      queryClient.invalidateQueries(['shipping-quotes']);
      alert("✅ Shipping quote generated!");
    }
  });

  const getCopartQuoteMutation = useMutation({
    mutationFn: async (pendingUser) => {
      // Simulate Copart API call with AI
      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Calculate shipping quote from ${pendingUser.city}, ${pendingUser.state} (${pendingUser.zip_code}) to nearest STOCRX hub.

Hubs: Detroit MI, Los Angeles CA, Miami FL, Houston TX, Phoenix AZ

Provide realistic shipping quote for open transport of a sedan.
Base rate $200 + $1.50/mile. Include estimated distance.

Return JSON with: distance_miles, quote_amount, delivery_days`,
          response_json_schema: {
            type: "object",
            properties: {
              distance_miles: { type: "number" },
              quote_amount: { type: "number" },
              delivery_days: { type: "number" }
            }
          }
        });

        // Create quote
        await base44.entities.ShippingQuote.create({
          customer_email: pendingUser.email,
          pending_user_id: pendingUser.id,
          from_zip: "48201",
          to_zip: pendingUser.zip_code,
          distance_miles: response.distance_miles,
          quote_amount: response.quote_amount,
          quote_source: 'copart_api',
          delivery_timeframe: `${response.delivery_days} business days`,
          carrier_type: 'open_transport',
          status: 'draft',
          copart_reference: `COPART-${Date.now()}`
        });

        // Update pending user
        await base44.entities.PendingUser.update(pendingUser.id, {
          shipping_quote_requested: true,
          copart_shipping_quote: response.quote_amount,
          distance_from_hub: response.distance_miles
        });

        alert(`✅ Copart Quote: $${response.quote_amount} (${response.distance_miles} miles)`);
      } catch (error) {
        alert("❌ Copart API error. Using standard calculation.");
        generateShippingQuoteMutation.mutate(pendingUser);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-users']);
      queryClient.invalidateQueries(['shipping-quotes']);
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Filter users
  const filteredUsers = pendingUsers.filter(u => {
    const matchesSearch = !searchTerm || 
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesZip = !zipFilter || u.zip_code?.includes(zipFilter);
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'new' && u.request_type === 'new_user') ||
      (activeTab === 'military' && u.request_type === 'military_verification') ||
      (activeTab === 'travelers' && u.request_type === 'travelers_tier') ||
      (activeTab === 'high_end' && u.request_type === 'high_end_tier') ||
      (activeTab === 'careers' && u.request_type === 'career_application') ||
      (activeTab === 'shipping' && u.requires_shipping);

    return matchesSearch && matchesZip && matchesTab;
  });

  // Stats
  const stats = {
    total: pendingUsers.length,
    new: pendingUsers.filter(u => u.request_type === 'new_user').length,
    military: pendingUsers.filter(u => u.request_type === 'military_verification').length,
    travelers: pendingUsers.filter(u => u.request_type === 'travelers_tier').length,
    highEnd: pendingUsers.filter(u => u.request_type === 'high_end_tier').length,
    careers: pendingUsers.filter(u => u.request_type === 'career_application').length,
    shipping: pendingUsers.filter(u => u.requires_shipping).length,
    pending: pendingUsers.filter(u => u.status === 'pending').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("SuperAdmin"))}
          className="text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Super Admin
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-blue-400" />
            Pending Users Management
          </h1>
          <p className="text-gray-400">Review and approve user requests by category</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <Card className="p-4 bg-blue-900 border-blue-700">
            <Users className="w-6 h-6 text-blue-400 mb-2" />
            <p className="text-blue-200 text-xs mb-1">Total Pending</p>
            <p className="text-2xl font-bold text-blue-400">{stats.total}</p>
          </Card>
          <Card className="p-4 bg-green-900 border-green-700">
            <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
            <p className="text-green-200 text-xs mb-1">New Users</p>
            <p className="text-2xl font-bold text-green-400">{stats.new}</p>
          </Card>
          <Card className="p-4 bg-yellow-900 border-yellow-700">
            <Shield className="w-6 h-6 text-yellow-400 mb-2" />
            <p className="text-yellow-200 text-xs mb-1">Military</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.military}</p>
          </Card>
          <Card className="p-4 bg-purple-900 border-purple-700">
            <Globe className="w-6 h-6 text-purple-400 mb-2" />
            <p className="text-purple-200 text-xs mb-1">Travelers</p>
            <p className="text-2xl font-bold text-purple-400">{stats.travelers}</p>
          </Card>
          <Card className="p-4 bg-pink-900 border-pink-700">
            <Star className="w-6 h-6 text-pink-400 mb-2" />
            <p className="text-pink-200 text-xs mb-1">High End</p>
            <p className="text-2xl font-bold text-pink-400">{stats.highEnd}</p>
          </Card>
          <Card className="p-4 bg-indigo-900 border-indigo-700">
            <Briefcase className="w-6 h-6 text-indigo-400 mb-2" />
            <p className="text-indigo-200 text-xs mb-1">Careers</p>
            <p className="text-2xl font-bold text-indigo-400">{stats.careers}</p>
          </Card>
          <Card className="p-4 bg-orange-900 border-orange-700">
            <Truck className="w-6 h-6 text-orange-400 mb-2" />
            <p className="text-orange-200 text-xs mb-1">Need Shipping</p>
            <p className="text-2xl font-bold text-orange-400">{stats.shipping}</p>
          </Card>
        </div>

        {/* Search & Filters */}
        <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Filter by zip code..."
                value={zipFilter}
                onChange={(e) => setZipFilter(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <Button
              onClick={() => {
                setSearchTerm("");
                setZipFilter("");
              }}
              className="bg-gray-700 hover:bg-gray-600"
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7 mb-6 bg-gray-800">
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="new">New ({stats.new})</TabsTrigger>
            <TabsTrigger value="military">Military ({stats.military})</TabsTrigger>
            <TabsTrigger value="travelers">Travelers ({stats.travelers})</TabsTrigger>
            <TabsTrigger value="high_end">High End ({stats.highEnd})</TabsTrigger>
            <TabsTrigger value="careers">Careers ({stats.careers})</TabsTrigger>
            <TabsTrigger value="shipping">Shipping ({stats.shipping})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="space-y-4">
              {filteredUsers.length === 0 ? (
                <Card className="p-12 bg-gray-800 border-gray-700 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">No pending users in this category</p>
                </Card>
              ) : (
                filteredUsers.map((pendingUser) => (
                  <Card key={pendingUser.id} className="p-6 bg-gray-800 border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">{pendingUser.full_name}</h3>
                          <Badge className={
                            pendingUser.request_type === 'military_verification' ? 'bg-yellow-600' :
                            pendingUser.request_type === 'travelers_tier' ? 'bg-purple-600' :
                            pendingUser.request_type === 'high_end_tier' ? 'bg-pink-600' :
                            pendingUser.request_type === 'career_application' ? 'bg-indigo-600' :
                            'bg-blue-600'
                          }>
                            {pendingUser.request_type?.replace('_', ' ')}
                          </Badge>
                          {pendingUser.status === 'pending' && (
                            <Badge className="bg-orange-600">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending Review
                            </Badge>
                          )}
                          {!pendingUser.in_service_zone && (
                            <Badge className="bg-red-600">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Out of Zone
                            </Badge>
                          )}
                          {pendingUser.requires_shipping && (
                            <Badge className="bg-orange-600">
                              <Truck className="w-3 h-3 mr-1" />
                              Needs Shipping
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mb-1">{pendingUser.email}</p>
                        <p className="text-gray-500 text-xs">
                          {pendingUser.city}, {pendingUser.state} {pendingUser.zip_code}
                        </p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-gray-400 text-xs">Tier Requested</p>
                        <p className="text-white font-semibold">{pendingUser.subscription_tier}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Status</p>
                        <p className="text-white font-semibold">{pendingUser.status}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Priority</p>
                        <p className="text-white font-semibold">{pendingUser.priority}</p>
                      </div>
                      {pendingUser.distance_from_hub && (
                        <div>
                          <p className="text-gray-400 text-xs">Distance from Hub</p>
                          <p className="text-white font-semibold">{pendingUser.distance_from_hub.toFixed(0)} miles</p>
                        </div>
                      )}
                    </div>

                    {/* Shipping Quote Section */}
                    {(pendingUser.requires_shipping || !pendingUser.in_service_zone) && (
                      <div className="bg-orange-900/30 border border-orange-700 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-orange-200 font-semibold mb-1 flex items-center gap-2">
                              <Truck className="w-4 h-4" />
                              Shipping Required
                            </p>
                            {pendingUser.shipping_quote_amount ? (
                              <p className="text-white text-lg font-bold">
                                ${pendingUser.shipping_quote_amount.toFixed(2)}
                              </p>
                            ) : (
                              <p className="text-orange-300 text-sm">No quote generated yet</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => generateShippingQuoteMutation.mutate(pendingUser)}
                              disabled={generateShippingQuoteMutation.isLoading}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Calculate Quote
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => getCopartQuoteMutation.mutate(pendingUser)}
                              disabled={getCopartQuoteMutation.isLoading}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              Copart Quote
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Military Verification */}
                    {pendingUser.request_type === 'military_verification' && pendingUser.military_verification && (
                      <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-4">
                        <p className="text-yellow-200 font-semibold mb-2">Military Details</p>
                        <div className="grid md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-gray-400">Branch</p>
                            <p className="text-white">{pendingUser.military_verification.branch}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Rank</p>
                            <p className="text-white">{pendingUser.military_verification.rank}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Status</p>
                            <p className="text-white">
                              {pendingUser.military_verification.active_duty ? 'Active Duty' : 'Veteran'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => navigate(createPageUrl("PendingUserApproval") + `?id=${pendingUser.id}`)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Review Details
                      </Button>
                      {pendingUser.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => approveMutation.mutate({ 
                              id: pendingUser.id, 
                              approvedTier: pendingUser.subscription_tier 
                            })}
                            disabled={approveMutation.isLoading}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => {
                              const reason = prompt("Rejection reason:");
                              if (reason) rejectMutation.mutate({ id: pendingUser.id, reason });
                            }}
                            disabled={rejectMutation.isLoading}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}