import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Search, Users, Car, DollarSign, FileText, Activity,
  Truck, CheckCircle, Clock, AlertTriangle, List, Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function UniversalSearchPanel({ users, vehicles, subscriptions, payments, documents, activityLogs }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const navigate = useNavigate();

  const categories = [
    { id: "all", name: "All", icon: Sparkles, color: "bg-purple-600" },
    { id: "users", name: "Users", icon: Users, color: "bg-blue-600" },
    { id: "vehicles", name: "Vehicles", icon: Car, color: "bg-green-600" },
    { id: "subscriptions", name: "Subscriptions", icon: CheckCircle, color: "bg-orange-600" },
    { id: "payments", name: "Payments", icon: DollarSign, color: "bg-yellow-600" },
    { id: "documents", name: "Documents", icon: FileText, color: "bg-pink-600" },
    { id: "activity", name: "Activity", icon: Activity, color: "bg-cyan-600" },
  ];

  const quickTasks = [
    {
      title: "Pending Approvals",
      count: subscriptions?.filter(s => !s.admin_approved).length || 0,
      icon: Clock,
      color: "bg-yellow-600",
      action: () => navigate(createPageUrl("PendingApprovals"))
    },
    {
      title: "Pending Payments",
      count: payments?.filter(p => p.status === "pending").length || 0,
      icon: DollarSign,
      color: "bg-green-600",
      action: () => navigate(createPageUrl("PaymentVerification"))
    },
    {
      title: "Pending Vehicles",
      count: vehicles?.filter(v => v.status === "pending_approval").length || 0,
      icon: Car,
      color: "bg-blue-600",
      action: () => navigate(createPageUrl("PendingVehicleApprovals"))
    },
    {
      title: "Active Dispatches",
      count: 0, // Would come from dispatch query
      icon: Truck,
      color: "bg-orange-600",
      action: () => navigate(createPageUrl("CallCenterDispatch"))
    },
  ];

  const filterData = (data, query) => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    let results = [];

    // Filter users
    if (activeCategory === "all" || activeCategory === "users") {
      const userResults = users?.filter(u =>
        u?.full_name?.toLowerCase().includes(lowerQuery) ||
        u?.email?.toLowerCase().includes(lowerQuery)
      ).slice(0, 5) || [];
      
      results = [...results, ...userResults.map(u => ({
        type: "user",
        data: u,
        title: u?.full_name || u?.email || 'User',
        subtitle: u?.email,
        badge: u?.role || 'customer'
      }))];
    }

    // Filter vehicles
    if (activeCategory === "all" || activeCategory === "vehicles") {
      const vehicleResults = vehicles?.filter(v =>
        v?.make?.toLowerCase().includes(lowerQuery) ||
        v?.model?.toLowerCase().includes(lowerQuery) ||
        v?.year?.toString().includes(query) ||
        v?.vin?.toLowerCase().includes(lowerQuery)
      ).slice(0, 5) || [];
      
      results = [...results, ...vehicleResults.map(v => ({
        type: "vehicle",
        data: v,
        title: `${v?.year || ''} ${v?.make || ''} ${v?.model || ''}`,
        subtitle: `$${v?.price?.toLocaleString() || '0'}`,
        badge: v?.status || 'unknown'
      }))];
    }

    // Filter subscriptions
    if (activeCategory === "all" || activeCategory === "subscriptions") {
      const subResults = subscriptions?.filter(s =>
        s?.customer_email?.toLowerCase().includes(lowerQuery)
      ).slice(0, 5) || [];
      
      results = [...results, ...subResults.map(s => ({
        type: "subscription",
        data: s,
        title: s?.customer_email || 'Unknown',
        subtitle: `Tier: ${s?.subscription_tier || 'free'}`,
        badge: s?.status || 'unknown'
      }))];
    }

    // Filter payments
    if (activeCategory === "all" || activeCategory === "payments") {
      const paymentResults = payments?.filter(p =>
        p?.subscription_id?.includes(query)
      ).slice(0, 5) || [];
      
      results = [...results, ...paymentResults.map(p => ({
        type: "payment",
        data: p,
        title: `Payment - $${p?.amount?.toLocaleString() || '0'}`,
        subtitle: p?.payment_type || 'Unknown',
        badge: p?.status || 'unknown'
      }))];
    }

    return results.slice(0, 10);
  };

  const searchResults = filterData(null, searchQuery);

  const handleResultClick = (result) => {
    switch (result.type) {
      case "user":
        navigate(createPageUrl("UserProfile") + `?email=${result.data.email}`);
        break;
      case "vehicle":
        navigate(createPageUrl("CarDetails") + `?id=${result.data.id}`);
        break;
      case "subscription":
        navigate(createPageUrl("SubscriptionProfile") + `?id=${result.data.id}`);
        break;
      case "payment":
        navigate(createPageUrl("PaymentDetail") + `?id=${result.data.id}`);
        break;
      default:
        break;
    }
  };

  return (
    <Card className="p-6 bg-gray-800 border-gray-700 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
      {/* Search Header */}
      <div className="flex items-center gap-2 mb-6">
        <Search className="w-5 h-5 text-blue-400" />
        <h3 className="font-bold text-white text-lg">Universal Search & Tasks</h3>
      </div>

      {/* Quick Tasks Section */}
      <div className="mb-6">
        <p className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-2">
          <List className="w-4 h-4" />
          QUICK TASKS
        </p>
        <div className="space-y-2">
          {quickTasks.map((task, idx) => (
            <button
              key={idx}
              onClick={task.action}
              className={`w-full ${task.color} hover:opacity-90 text-white p-3 rounded-lg flex items-center justify-between transition-all`}
            >
              <div className="flex items-center gap-3">
                <task.icon className="w-5 h-5" />
                <span className="text-sm font-semibold">{task.title}</span>
              </div>
              <Badge className="bg-white text-gray-900 font-bold">
                {task.count}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <p className="text-xs font-bold text-gray-400 mb-2">SEARCH EVERYTHING</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users, vehicles, payments..."
            className="pl-10 bg-gray-700 border-gray-600 text-white"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="mb-4">
        <p className="text-xs font-bold text-gray-400 mb-2">CATEGORIES</p>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                activeCategory === cat.id
                  ? `${cat.color} text-white`
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <cat.icon className="w-4 h-4 inline mr-1" />
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div>
          <p className="text-xs font-bold text-gray-400 mb-2">
            RESULTS ({searchResults.length})
          </p>
          {searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => handleResultClick(result)}
                  className="w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white font-semibold text-sm">{result.title}</p>
                    <Badge className="text-xs bg-blue-600">{result.type}</Badge>
                  </div>
                  <p className="text-gray-400 text-xs mb-1">{result.subtitle}</p>
                  <Badge className={
                    result.badge === 'active' || result.badge === 'completed' ? 'bg-green-600 text-xs' :
                    result.badge === 'pending' ? 'bg-yellow-600 text-xs' :
                    result.badge === 'admin' ? 'bg-red-600 text-xs' :
                    'bg-gray-600 text-xs'
                  }>
                    {result.badge}
                  </Badge>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">No results found</p>
          )}
        </div>
      )}

      {/* AI Assistant Shortcut */}
      <Button
        onClick={() => navigate(createPageUrl("AIAssistantEmployee"))}
        className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Open AI Assistant
      </Button>
    </Card>
  );
}