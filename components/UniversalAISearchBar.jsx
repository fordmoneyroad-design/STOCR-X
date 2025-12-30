import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search, Sparkles, Car, Users, DollarSign, FileText, 
  Truck, ArrowRight, X, Loader2, Filter, Star
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function UniversalAISearchBar({ user, currentPage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState({});
  const navigate = useNavigate();

  // Don't render if no user
  if (!user) return null;

  // Quick search categories based on user access
  const quickCategories = [
    { 
      name: "Vehicles", 
      icon: Car, 
      query: "vehicles",
      color: "bg-blue-600",
      access: ["free", "standard", "premium", "military", "travelers", "high_end", "lifetime"]
    },
    { 
      name: "Users", 
      icon: Users, 
      query: "users",
      color: "bg-green-600",
      access: ["admin"]
    },
    { 
      name: "Payments", 
      icon: DollarSign, 
      query: "payments",
      color: "bg-yellow-600",
      access: ["admin"]
    },
    { 
      name: "Documents", 
      icon: FileText, 
      query: "documents",
      color: "bg-purple-600",
      access: ["admin"]
    },
    { 
      name: "Dispatch", 
      icon: Truck, 
      query: "dispatch",
      color: "bg-orange-600",
      access: ["admin", "dispatch"]
    }
  ];

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return;
    setSearching(true);

    try {
      // AI-powered search
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `User is searching for: "${searchQuery}"
        
Current page: ${currentPage || 'Unknown'}
User role: ${user?.role || 'customer'}
User tier: ${user?.subscription_tier || 'free'}

Analyze this search and suggest:
1. What are they likely looking for?
2. Which pages/features should they access?
3. Relevant data they might want to see

Return JSON with:
- interpretation: brief explanation
- suggested_pages: array of page names
- suggested_actions: array of action descriptions
- data_type: "vehicles" | "users" | "payments" | "documents" | "general"`,
        response_json_schema: {
          type: "object",
          properties: {
            interpretation: { type: "string" },
            suggested_pages: { type: "array", items: { type: "string" } },
            suggested_actions: { type: "array", items: { type: "string" } },
            data_type: { type: "string" }
          }
        }
      });

      setAiSuggestions(response || {});

      // Perform actual database searches based on data_type
      let searchResults = [];

      if (response?.data_type === 'vehicles') {
        const vehicles = await base44.entities.Vehicle.list("-created_date", 20);
        searchResults = vehicles
          .filter(v => 
            v?.make?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v?.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v?.year?.toString().includes(searchQuery)
          )
          .slice(0, 5);
      }

      if (response?.data_type === 'users' && user?.role === 'admin') {
        const users = await base44.entities.User.list("-created_date", 20);
        searchResults = users
          .filter(u => 
            u?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u?.email?.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 5);
      }

      setResults(searchResults || []);
    } catch (error) {
      console.error("Search error:", error);
      setAiSuggestions({ 
        interpretation: "Search failed. Try a different query.",
        suggested_pages: [],
        suggested_actions: []
      });
    }
    setSearching(false);
  };

  const accessibleCategories = quickCategories.filter(cat => {
    if (user?.role === 'admin') return true;
    if (user?.department === 'dispatch' && cat.name === 'Dispatch') return true;
    return cat.access.includes(user?.subscription_tier || 'free');
  });

  return (
    <>
      {/* Floating Search Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 left-4 z-40 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl"
        size="icon"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
      </Button>

      {/* Search Sidebar */}
      {isOpen && (
        <Card className="fixed top-32 left-4 z-40 w-96 max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700 shadow-2xl">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <div>
                <h3 className="font-bold text-white text-lg">AI Search Assistant</h3>
                <p className="text-xs text-gray-400">Find anything, anywhere</p>
              </div>
            </div>

            {/* Access Badge */}
            <Badge className={
              user?.role === 'admin' || user?.email === 'fordmoneyroad@gmail.com'
                ? 'bg-yellow-500 text-black mb-4 w-full justify-center'
                : 'bg-blue-600 mb-4 w-full justify-center'
            }>
              {user?.role === 'admin' || user?.email === 'fordmoneyroad@gmail.com' 
                ? '🔓 FULL ACCESS' 
                : `${user?.subscription_tier?.toUpperCase() || 'FREE'} ACCESS`
              }
            </Badge>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search vehicles, users, documents..."
                className="pl-10 bg-gray-800 border-gray-600 text-white"
              />
              {searching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 animate-spin" />
              )}
            </div>

            <Button
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="w-full mb-6 bg-blue-600 hover:bg-blue-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              AI Search
            </Button>

            {/* Quick Categories */}
            <div className="mb-6">
              <p className="text-xs text-gray-400 mb-3">QUICK ACCESS</p>
              <div className="grid grid-cols-2 gap-2">
                {accessibleCategories.map((cat) => (
                  <Button
                    key={cat.name}
                    size="sm"
                    onClick={() => {
                      setSearchQuery(cat.query);
                      setTimeout(() => handleSearch(), 100);
                    }}
                    className={`${cat.color} hover:opacity-90`}
                  >
                    <cat.icon className="w-4 h-4 mr-2" />
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* AI Suggestions */}
            {aiSuggestions?.interpretation && (
              <div className="mb-6 bg-purple-900/30 border border-purple-700 rounded-lg p-4">
                <p className="text-purple-200 text-sm mb-3">
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  {aiSuggestions.interpretation}
                </p>
                
                {aiSuggestions?.suggested_pages?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400">SUGGESTED PAGES:</p>
                    {aiSuggestions.suggested_pages.map((page, idx) => (
                      <Button
                        key={idx}
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(createPageUrl(page))}
                        className="w-full justify-start text-white border-purple-600 hover:bg-purple-800"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        {page}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Search Results */}
            {results.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs text-gray-400">RESULTS ({results.length})</p>
                {results.map((item, idx) => (
                  <Card 
                    key={idx}
                    className="p-3 bg-gray-800 border-gray-700 hover:border-blue-500 cursor-pointer transition-all"
                    onClick={() => {
                      if (item?.make) navigate(createPageUrl("CarDetails") + `?id=${item.id}`);
                      if (item?.email) navigate(createPageUrl("UserProfile") + `?email=${item.email}`);
                    }}
                  >
                    {item?.make && (
                      <div>
                        <p className="text-white font-semibold">
                          {item.year || ''} {item.make || ''} {item.model || ''}
                        </p>
                        <p className="text-gray-400 text-sm">
                          ${item?.price?.toLocaleString() || '0'}
                        </p>
                      </div>
                    )}
                    {item?.email && (
                      <div>
                        <p className="text-white font-semibold">
                          {item.full_name || item.email || 'Unknown User'}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {item.subscription_tier || 'free'}
                        </p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </>
  );
}