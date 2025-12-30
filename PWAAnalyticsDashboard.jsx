import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft, Download, X, Eye, Smartphone, MapPin, TrendingUp,
  Apple, Chrome, Globe, BarChart3, Users, Clock, ExternalLink
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SuperAdminQuickActions from "../components/admin/SuperAdminQuickActions";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function PWAAnalyticsDashboard() {
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

  const { data: allAnalytics } = useQuery({
    queryKey: ['pwa-analytics'],
    queryFn: () => base44.entities.PWAAnalytics.list("-created_date", 500),
    initialData: []
  });

  const { data: searchTracking } = useQuery({
    queryKey: ['search-tracking-all'],
    queryFn: () => base44.entities.SearchTracking.list("-created_date", 200),
    initialData: []
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Calculate stats
  const totalPrompts = allAnalytics.filter(a => a.action_type === 'prompt_shown').length;
  const totalInstalls = allAnalytics.filter(a => a.action_type === 'app_installed').length;
  const totalDismissed = allAnalytics.filter(a => a.action_type === 'dismissed').length;
  const totalLater = allAnalytics.filter(a => a.action_type === 'later_clicked').length;
  const instructionsViewed = allAnalytics.filter(a => a.action_type === 'instructions_viewed').length;

  const conversionRate = totalPrompts > 0 ? ((totalInstalls / totalPrompts) * 100).toFixed(1) : 0;

  // Device breakdown
  const iosCount = allAnalytics.filter(a => a.device_type === 'iOS').length;
  const androidCount = allAnalytics.filter(a => a.device_type === 'Android').length;
  const desktopCount = allAnalytics.filter(a => a.device_type === 'Desktop').length;

  // City breakdown
  const cityBreakdown = allAnalytics.reduce((acc, item) => {
    if (item.city) {
      acc[item.city] = (acc[item.city] || 0) + 1;
    }
    return acc;
  }, {});

  const topCities = Object.entries(cityBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Search city breakdown
  const searchCityBreakdown = searchTracking.reduce((acc, item) => {
    if (item.zip_code) {
      acc[item.zip_code] = (acc[item.zip_code] || 0) + 1;
    }
    return acc;
  }, {});

  const topSearchCities = Object.entries(searchCityBreakdown)
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
            <Smartphone className="w-10 h-10 text-blue-400" />
            PWA Install Analytics
          </h1>
          <p className="text-gray-400">Track app installations, dismissals, and user locations</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 border-none text-white">
            <Eye className="w-8 h-8 mb-2" />
            <p className="text-blue-200 text-sm mb-1">Prompts Shown</p>
            <p className="text-4xl font-bold">{totalPrompts}</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-600 to-green-700 border-none text-white">
            <Download className="w-8 h-8 mb-2" />
            <p className="text-green-200 text-sm mb-1">Installed</p>
            <p className="text-4xl font-bold">{totalInstalls}</p>
            <p className="text-xs text-green-200 mt-2">{conversionRate}% conversion</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-600 to-red-700 border-none text-white">
            <X className="w-8 h-8 mb-2" />
            <p className="text-red-200 text-sm mb-1">Dismissed</p>
            <p className="text-4xl font-bold">{totalDismissed}</p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-yellow-600 to-yellow-700 border-none text-white">
            <Clock className="w-8 h-8 mb-2" />
            <p className="text-yellow-200 text-sm mb-1">Clicked Later</p>
            <p className="text-4xl font-bold">{totalLater}</p>
          </Card>
        </div>

        {/* Device Breakdown */}
        <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-purple-400" />
            Device Breakdown
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-900/50 to-indigo-900/50 rounded-lg border border-blue-700">
              <Apple className="w-12 h-12 mx-auto mb-3 text-white" />
              <p className="text-3xl font-bold text-white mb-1">{iosCount}</p>
              <p className="text-blue-300">iOS Devices</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-900/50 to-teal-900/50 rounded-lg border border-green-700">
              <Chrome className="w-12 h-12 mx-auto mb-3 text-white" />
              <p className="text-3xl font-bold text-white mb-1">{androidCount}</p>
              <p className="text-green-300">Android Devices</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg border border-purple-700">
              <Globe className="w-12 h-12 mx-auto mb-3 text-white" />
              <p className="text-3xl font-bold text-white mb-1">{desktopCount}</p>
              <p className="text-purple-300">Desktop</p>
            </div>
          </div>
        </Card>

        {/* App Store Links */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-900 to-indigo-900 border-blue-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Apple className="w-6 h-6" />
              Apple App Store
            </h3>
            <p className="text-blue-200 mb-4 text-sm">
              View STOCRX on the Apple App Store (if published)
            </p>
            <Button
              onClick={() => window.open('https://apps.apple.com/search?term=stocrx', '_blank')}
              className="w-full bg-white hover:bg-gray-100 text-blue-900 font-bold"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Search Apple App Store
            </Button>
            <p className="text-xs text-blue-300 mt-2">
              Note: If STOCRX hasn't been published to the App Store, this will show search results
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-900 to-teal-900 border-green-700">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Chrome className="w-6 h-6" />
              Google Play Store
            </h3>
            <p className="text-green-200 mb-4 text-sm">
              View STOCRX on Google Play Store (if published)
            </p>
            <Button
              onClick={() => window.open('https://play.google.com/store/search?q=stocrx&c=apps', '_blank')}
              className="w-full bg-white hover:bg-gray-100 text-green-900 font-bold"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Search Google Play Store
            </Button>
            <p className="text-xs text-green-300 mt-2">
              Note: If STOCRX hasn't been published to Play Store, this will show search results
            </p>
          </Card>
        </div>

        {/* Google Search Analytics */}
        <Card className="p-6 bg-gradient-to-br from-purple-900 to-pink-900 border-purple-700 mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Globe className="w-6 h-6" />
            Google Search Analytics
          </h3>
          <p className="text-purple-200 mb-4 text-sm">
            View how users are finding STOCRX through Google Search
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <Button
              onClick={() => window.open('https://search.google.com/search-console', '_blank')}
              className="bg-white hover:bg-gray-100 text-purple-900 font-bold"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Google Search Console
            </Button>
            <Button
              onClick={() => window.open('https://www.google.com/search?q=stocrx', '_blank')}
              className="bg-white hover:bg-gray-100 text-purple-900 font-bold"
            >
              <Globe className="w-4 h-4 mr-2" />
              Search "STOCRX" on Google
            </Button>
          </div>
        </Card>

        <Tabs defaultValue="cities" className="mt-8">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="cities">Top Cities (PWA)</TabsTrigger>
            <TabsTrigger value="search">Top Cities (Search)</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          {/* Top Cities PWA Tab */}
          <TabsContent value="cities">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-green-400" />
                Top Cities - PWA Install Activity
              </h2>
              {topCities.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No location data available yet</p>
              ) : (
                <div className="space-y-3">
                  {topCities.map(([city, count], index) => (
                    <div key={city} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-blue-600 text-white w-8 h-8 flex items-center justify-center rounded-full">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-bold text-white">{city}</p>
                          <p className="text-sm text-gray-400">{count} {count === 1 ? 'action' : 'actions'}</p>
                        </div>
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Top Cities Search Tab */}
          <TabsContent value="search">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-purple-400" />
                Top Cities - Vehicle Search Activity
              </h2>
              {topSearchCities.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No search data available yet</p>
              ) : (
                <div className="space-y-3">
                  {topSearchCities.map(([zip, count], index) => (
                    <div key={zip} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-purple-600 text-white w-8 h-8 flex items-center justify-center rounded-full">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-bold text-white">ZIP: {zip}</p>
                          <p className="text-sm text-gray-400">{count} {count === 1 ? 'search' : 'searches'}</p>
                        </div>
                      </div>
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Recent Activity Tab */}
          <TabsContent value="activity">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-yellow-400" />
                Recent PWA Activity
              </h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">User</TableHead>
                      <TableHead className="text-gray-300">Action</TableHead>
                      <TableHead className="text-gray-300">Device</TableHead>
                      <TableHead className="text-gray-300">Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allAnalytics.slice(0, 20).map((item) => (
                      <TableRow key={item.id} className="border-gray-700">
                        <TableCell className="text-gray-400 text-sm">
                          {item.created_date && new Date(item.created_date).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-white">
                          {item.user_email || 'Guest'}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            item.action_type === 'app_installed' ? 'bg-green-600' :
                            item.action_type === 'dismissed' ? 'bg-red-600' :
                            item.action_type === 'later_clicked' ? 'bg-yellow-600' :
                            'bg-blue-600'
                          }>
                            {item.action_type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-purple-600">
                            {item.device_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {item.city ? `${item.city}, ${item.state}` : 'Unknown'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <SuperAdminQuickActions />
      </div>
    </div>
  );
}