import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, TrendingUp, Search, Users, DollarSign } from "lucide-react";
import SuperAdminQuickActions from "../components/admin/SuperAdminQuickActions";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function SearchAnalytics() {
  const [user, setUser] = useState(null);

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

  const { data: searchData } = useQuery({
    queryKey: ['search-analytics'],
    queryFn: () => base44.entities.SearchTracking.list("-created_date", 100),
    initialData: []
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate analytics
  const totalSearches = searchData.length;
  const avgPriceMin = searchData.reduce((sum, s) => sum + (s.price_range_min || 0), 0) / totalSearches || 0;
  const avgPriceMax = searchData.reduce((sum, s) => sum + (s.price_range_max || 0), 0) / totalSearches || 0;
  const uniqueUsers = [...new Set(searchData.map(s => s.user_email))].length;

  // Popular searches
  const searchCounts = {};
  searchData.forEach(s => {
    if (s.search_query) {
      searchCounts[s.search_query] = (searchCounts[s.search_query] || 0) + 1;
    }
  });
  const popularSearches = Object.entries(searchCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

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
            <TrendingUp className="w-10 h-10 text-cyan-400" />
            Search Analytics
          </h1>
          <p className="text-gray-400">User search behavior and trends</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <Search className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-gray-400 text-sm mb-1">Total Searches</p>
            <p className="text-3xl font-bold text-white">{totalSearches}</p>
          </Card>
          <Card className="p-6 bg-gray-800 border-gray-700">
            <Users className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-gray-400 text-sm mb-1">Unique Users</p>
            <p className="text-3xl font-bold text-white">{uniqueUsers}</p>
          </Card>
          <Card className="p-6 bg-gray-800 border-gray-700">
            <DollarSign className="w-8 h-8 text-yellow-400 mb-2" />
            <p className="text-gray-400 text-sm mb-1">Avg Min Price</p>
            <p className="text-3xl font-bold text-white">${avgPriceMin.toFixed(0)}</p>
          </Card>
          <Card className="p-6 bg-gray-800 border-gray-700">
            <DollarSign className="w-8 h-8 text-orange-400 mb-2" />
            <p className="text-gray-400 text-sm mb-1">Avg Max Price</p>
            <p className="text-3xl font-bold text-white">${avgPriceMax.toFixed(0)}</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Popular Searches */}
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Popular Searches</h2>
            <div className="space-y-3">
              {popularSearches.map(([query, count], idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <span className="text-gray-300">{query}</span>
                  <Badge className="bg-blue-600">{count} searches</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Searches */}
          <Card className="p-6 bg-gray-800 border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Recent Searches</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {searchData.slice(0, 20).map((search) => (
                <div key={search.id} className="p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold">{search.search_query || 'No query'}</span>
                    <Badge className="bg-purple-600 text-xs">
                      {search.results_count} results
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400">
                    {search.user_email} • {search.user_subscription_tier || 'free'}
                  </p>
                  {(search.price_range_min || search.price_range_max) && (
                    <p className="text-xs text-gray-500 mt-1">
                      Price: ${search.price_range_min || 0} - ${search.price_range_max || 'Any'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        <SuperAdminQuickActions />
      </div>
    </div>
  );
}