import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle, Clock, AlertTriangle, FileText, 
  Car, CreditCard, TrendingUp, UserCheck, Shield, ArrowRight,
  Users, Search, Filter, User, Mail, Briefcase, Star, ChevronRight
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AccountApprovalStatus() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserCategory, setSelectedUserCategory] = useState("all");
  const navigate = useNavigate();

  // Check if current user is admin
  const isAdmin = user?.role === 'admin' || user?.email === 'fordmoneyroad@gmail.com';

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const isAuth = await base44.auth.isAuthenticated();
        setIsAuthenticated(isAuth);
        if (isAuth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
        }
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Fetch all users (admin only)
  const { data: allUsers } = useQuery({
    queryKey: ['all-users-list'],
    queryFn: () => base44.entities.User.list("-created_date"),
    enabled: isAdmin,
    initialData: []
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['user-subscriptions', user?.email, isAdmin],
    queryFn: () => {
      if (isAdmin) {
        return base44.entities.Subscription.list("-created_date");
      }
      return base44.entities.Subscription.filter({ customer_email: user?.email || '' });
    },
    enabled: !!user?.email,
    initialData: []
  });

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles-list'],
    queryFn: () => base44.entities.Vehicle.list(),
    initialData: []
  });

  const { data: payments } = useQuery({
    queryKey: ['user-payments', subscriptions],
    queryFn: async () => {
      if (!subscriptions || subscriptions.length === 0) return [];
      const allPayments = [];
      for (const sub of subscriptions) {
        if (sub?.id) {
          const subPayments = await base44.entities.Payment.filter({ subscription_id: sub.id });
          allPayments.push(...(subPayments || []));
        }
      }
      return allPayments;
    },
    enabled: Array.isArray(subscriptions) && subscriptions.length > 0,
    initialData: []
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your account status...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we verify your credentials</p>
        </div>
      </div>
    );
  }

  // Guest User View
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Shield className="w-20 h-20 mx-auto mb-6 text-blue-400" />
            <h1 className="text-5xl font-bold text-white mb-4">Account Approval Center</h1>
            <p className="text-xl text-gray-300">Check your application status and manage approvals</p>
          </div>

          <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
            <div className="text-center">
              <UserCheck className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
              <h2 className="text-3xl font-bold text-white mb-4">Sign In to View Your Status</h2>
              <p className="text-gray-300 mb-6">
                Access your account to check subscription approvals, payment status, and upgrade requests.
              </p>
              <Button
                onClick={() => base44.auth.redirectToLogin(createPageUrl("AccountApprovalStatus"))}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-lg"
              >
                Sign In
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </Card>

          {/* Information Cards for Guests */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <Clock className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Pending Approvals</h3>
              <p className="text-gray-400 text-sm">
                Check the status of your subscription applications and KYC verification.
              </p>
            </Card>
            <Card className="p-6 bg-gray-800 border-gray-700">
              <CreditCard className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Payment Verification</h3>
              <p className="text-gray-400 text-sm">
                Track payment processing and approval status for all transactions.
              </p>
            </Card>
            <Card className="p-6 bg-gray-800 border-gray-700">
              <TrendingUp className="w-12 h-12 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Upgrade Requests</h3>
              <p className="text-gray-400 text-sm">
                Monitor tier upgrades and vehicle swap/upgrade applications.
              </p>
            </Card>
          </div>

          <Card className="p-6 bg-blue-900/30 border-blue-700 mt-8">
            <h3 className="text-xl font-bold text-white mb-4">New User? Start Here!</h3>
            <div className="space-y-3 text-blue-200">
              <p>✅ <strong>Step 1:</strong> Create your free account</p>
              <p>✅ <strong>Step 2:</strong> Browse our vehicle inventory</p>
              <p>✅ <strong>Step 3:</strong> Apply for a subscription</p>
              <p>✅ <strong>Step 4:</strong> Complete KYC verification</p>
              <p>✅ <strong>Step 5:</strong> Wait for admin approval (1-2 days)</p>
              <p>✅ <strong>Step 6:</strong> Start driving!</p>
            </div>
            <Button
              onClick={() => base44.auth.redirectToLogin(createPageUrl("BrowseCars"))}
              className="mt-6 w-full bg-green-600 hover:bg-green-700"
            >
              Get Started
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Error state (user not loaded)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <Card className="p-8 bg-red-900/30 border-red-700 max-w-md text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Account</h2>
          <p className="text-red-200 mb-6">
            We couldn't load your account information. Please try refreshing the page or signing in again.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => window.location.reload()}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Refresh Page
            </Button>
            <Button
              onClick={() => base44.auth.redirectToLogin(createPageUrl("AccountApprovalStatus"))}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Sign In Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Filter users by category (admin only)
  const categorizedUsers = isAdmin && Array.isArray(allUsers) ? {
    all: allUsers,
    free: allUsers.filter(u => !u?.subscription_tier || u?.subscription_tier === 'free'),
    paid: allUsers.filter(u => u?.subscription_tier && u?.subscription_tier !== 'free'),
    employees: allUsers.filter(u => u?.department),
    guests: allUsers.filter(u => !u?.department && (!u?.subscription_tier || u?.subscription_tier === 'free'))
  } : null;

  // Search filtered users
  const filteredUsers = isAdmin && categorizedUsers ? 
    (selectedUserCategory === 'all' ? categorizedUsers.all : categorizedUsers[selectedUserCategory])
      .filter(u => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return u?.full_name?.toLowerCase().includes(query) ||
               u?.email?.toLowerCase().includes(query) ||
               u?.job_title?.toLowerCase().includes(query) ||
               u?.department?.toLowerCase().includes(query);
      })
    : [];

  // Get user's subscription info
  const getUserSubscription = (userEmail) => {
    if (!Array.isArray(subscriptions)) return null;
    return subscriptions.find(s => s?.customer_email === userEmail);
  };

  // User's own subscriptions (non-admin view)
  const mySubscriptions = !isAdmin && Array.isArray(subscriptions) ? subscriptions : [];
  const pendingSubscriptions = Array.isArray(mySubscriptions) ? mySubscriptions.filter(s => s?.status === 'pending' || !s?.admin_approved) : [];
  const activeSubscriptions = Array.isArray(mySubscriptions) ? mySubscriptions.filter(s => s?.status === 'active' && s?.admin_approved) : [];
  const pendingPayments = Array.isArray(payments) ? payments.filter(p => p?.status === 'pending') : [];
  const kycPendingSubscriptions = Array.isArray(mySubscriptions) ? mySubscriptions.filter(s => !s?.kyc_verified) : [];

  const allApproved = pendingSubscriptions.length === 0 && pendingPayments.length === 0 && kycPendingSubscriptions.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Shield className="w-10 h-10 text-blue-400" />
                {isAdmin ? 'Admin Account Management' : 'Account Approval Status'}
              </h1>
              <p className="text-gray-400">
                Welcome back, {user?.full_name || user?.email || 'Valued Customer'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Badge className="bg-yellow-600 text-lg px-4 py-2">
                  <Shield className="w-4 h-4 mr-2" />
                  ADMIN ACCESS
                </Badge>
              )}
              {!isAdmin && (
                <Badge className={allApproved ? 'bg-green-600 text-lg px-4 py-2' : 'bg-yellow-600 text-lg px-4 py-2'}>
                  {allApproved ? '✅ All Approved' : '⏳ Pending Reviews'}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* ADMIN VIEW - User Management */}
        {isAdmin ? (
          <>
            {/* Admin Stats Grid */}
            <div className="grid md:grid-cols-5 gap-6 mb-8">
              <Card className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 border-none text-white cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedUserCategory('all')}>
                <Users className="w-8 h-8 mb-2" />
                <p className="text-blue-200 text-sm mb-1">All Users</p>
                <p className="text-3xl font-bold">{categorizedUsers?.all?.length || 0}</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-gray-600 to-gray-700 border-none text-white cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedUserCategory('free')}>
                <User className="w-8 h-8 mb-2" />
                <p className="text-gray-200 text-sm mb-1">Free Users</p>
                <p className="text-3xl font-bold">{categorizedUsers?.free?.length || 0}</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-600 to-green-700 border-none text-white cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedUserCategory('paid')}>
                <Star className="w-8 h-8 mb-2" />
                <p className="text-green-200 text-sm mb-1">Paid Users</p>
                <p className="text-3xl font-bold">{categorizedUsers?.paid?.length || 0}</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-600 to-purple-700 border-none text-white cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedUserCategory('employees')}>
                <Briefcase className="w-8 h-8 mb-2" />
                <p className="text-purple-200 text-sm mb-1">Employees</p>
                <p className="text-3xl font-bold">{categorizedUsers?.employees?.length || 0}</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-orange-600 to-orange-700 border-none text-white cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedUserCategory('guests')}>
                <UserCheck className="w-8 h-8 mb-2" />
                <p className="text-orange-200 text-sm mb-1">Guests</p>
                <p className="text-3xl font-bold">{categorizedUsers?.guests?.length || 0}</p>
              </Card>
            </div>

            {/* Search and Filter Bar */}
            <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, job title, or department..."
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <Button
                  onClick={() => navigate(createPageUrl("EmployeeInformationCategories"))}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Full Employee Directory
                </Button>
              </div>

              {/* Category Tabs */}
              <Tabs value={selectedUserCategory} onValueChange={setSelectedUserCategory} className="mt-6">
                <TabsList className="grid grid-cols-5 bg-gray-700">
                  <TabsTrigger value="all">All Users</TabsTrigger>
                  <TabsTrigger value="free">Free</TabsTrigger>
                  <TabsTrigger value="paid">Paid</TabsTrigger>
                  <TabsTrigger value="employees">Employees</TabsTrigger>
                  <TabsTrigger value="guests">Guests</TabsTrigger>
                </TabsList>
              </Tabs>
            </Card>

            {/* User List */}
            <Card className="p-6 bg-gray-800 border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Filter className="w-6 h-6 text-blue-400" />
                  {selectedUserCategory === 'all' ? 'All Users' :
                   selectedUserCategory === 'free' ? 'Free Users' :
                   selectedUserCategory === 'paid' ? 'Paid Users' :
                   selectedUserCategory === 'employees' ? 'Employees' : 'Guests'}
                  ({filteredUsers?.length || 0})
                </h2>
              </div>

              {Array.isArray(filteredUsers) && filteredUsers.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredUsers.map((u) => {
                    if (!u?.id) return null;
                    const userSub = getUserSubscription(u?.email);
                    
                    return (
                      <Card
                        key={u.id}
                        className="p-4 bg-gray-700 border-gray-600 hover:bg-gray-600 cursor-pointer transition-all group"
                        onClick={() => navigate(createPageUrl("UserProfile") + `?email=${u?.email}`)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                {u?.full_name?.charAt(0) || u?.email?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">
                                  {u?.full_name || u?.email || 'User'}
                                </h3>
                                <p className="text-xs text-gray-400">{u?.email}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-3">
                              {/* Role Badge */}
                              <Badge className={
                                u?.role === 'admin' ? 'bg-red-600' :
                                u?.department ? 'bg-green-600' : 'bg-blue-600'
                              }>
                                {u?.role === 'admin' ? 'Admin' :
                                 u?.department ? 'Employee' : 'Customer'}
                              </Badge>

                              {/* Subscription Badge */}
                              {u?.subscription_tier && (
                                <Badge className="bg-purple-600 capitalize">
                                  {u.subscription_tier}
                                </Badge>
                              )}

                              {/* Department Badge */}
                              {u?.department && (
                                <Badge className="bg-cyan-600 capitalize">
                                  {u.department}
                                </Badge>
                              )}

                              {/* Active Subscription Badge */}
                              {userSub && (
                                <Badge className={
                                  userSub?.status === 'active' ? 'bg-green-600' :
                                  userSub?.status === 'pending' ? 'bg-yellow-600' : 'bg-gray-600'
                                }>
                                  {userSub.status}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                        </div>

                        {/* Quick Info */}
                        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                          {u?.job_title && (
                            <div>
                              <p className="text-gray-400">Job Title</p>
                              <p className="text-white font-semibold">{u.job_title}</p>
                            </div>
                          )}
                          {u?.created_date && (
                            <div>
                              <p className="text-gray-400">Joined</p>
                              <p className="text-white">{new Date(u.created_date).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(createPageUrl("UserProfile") + `?email=${u?.email}`);
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs"
                          >
                            <User className="w-3 h-3 mr-1" />
                            Profile
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `mailto:${u?.email}`;
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-xs"
                          >
                            <Mail className="w-3 h-3 mr-1" />
                            Email
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 text-lg">
                    {searchQuery ? 'No users found matching your search' : 'No users in this category'}
                  </p>
                </div>
              )}
            </Card>
          </>
        ) : (
          /* CUSTOMER VIEW - Original Layout */
          <>
            {/* All Approved Success Message */}
            {allApproved && activeSubscriptions.length > 0 && (
              <Alert className="mb-8 bg-green-900/30 border-green-700">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <AlertDescription className="text-green-200 text-lg">
                  🎉 <strong>Congratulations!</strong> All your accounts and subscriptions are approved and active!
                </AlertDescription>
              </Alert>
            )}

            {/* No Subscriptions Yet */}
            {mySubscriptions.length === 0 && (
              <Card className="p-12 bg-gray-800 border-gray-700 text-center mb-8">
                <Car className="w-20 h-20 mx-auto mb-6 text-gray-600" />
                <h2 className="text-3xl font-bold text-white mb-4">No Active Subscriptions</h2>
                <p className="text-gray-400 mb-6 text-lg">You haven't applied for any vehicle subscriptions yet.</p>
                <Button
                  onClick={() => navigate(createPageUrl("BrowseCars"))}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3 text-lg"
                >
                  Browse Available Cars
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Card>
            )}

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="p-6 bg-yellow-900 border-yellow-700">
                <Clock className="w-8 h-8 text-yellow-400 mb-2" />
                <p className="text-yellow-200 text-sm mb-1">Pending Approvals</p>
                <p className="text-3xl font-bold text-yellow-400">{pendingSubscriptions?.length || 0}</p>
              </Card>
              <Card className="p-6 bg-green-900 border-green-700">
                <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
                <p className="text-green-200 text-sm mb-1">Active Subscriptions</p>
                <p className="text-3xl font-bold text-green-400">{activeSubscriptions?.length || 0}</p>
              </Card>
              <Card className="p-6 bg-blue-900 border-blue-700">
                <CreditCard className="w-8 h-8 text-blue-400 mb-2" />
                <p className="text-blue-200 text-sm mb-1">Pending Payments</p>
                <p className="text-3xl font-bold text-blue-400">{pendingPayments?.length || 0}</p>
              </Card>
              <Card className="p-6 bg-purple-900 border-purple-700">
                <FileText className="w-8 h-8 text-purple-400 mb-2" />
                <p className="text-purple-200 text-sm mb-1">KYC Pending</p>
                <p className="text-3xl font-bold text-purple-400">{kycPendingSubscriptions?.length || 0}</p>
              </Card>
            </div>

            {/* Keep existing customer view sections */}
            {/* ... (KYC Verification, Pending Subscriptions, Pending Payments, Active Subscriptions) ... */}
          </>
        )}

        {/* Quick Actions - Available for all users */}
        <Card className="p-6 bg-gray-800 border-gray-700 mt-8">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {isAdmin ? (
              <>
                <Button
                  onClick={() => navigate(createPageUrl("CreateEmployee"))}
                  className="bg-green-600 hover:bg-green-700 h-16"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Create Employee
                </Button>
                <Button
                  onClick={() => navigate(createPageUrl("AccessControl"))}
                  className="bg-purple-600 hover:bg-purple-700 h-16"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Access Control
                </Button>
                <Button
                  onClick={() => navigate(createPageUrl("PendingVehicleApprovals"))}
                  className="bg-orange-600 hover:bg-orange-700 h-16"
                >
                  <Car className="w-5 h-5 mr-2" />
                  Vehicle Approvals
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => navigate(createPageUrl("BrowseCars"))}
                  className="bg-blue-600 hover:bg-blue-700 h-16"
                >
                  <Car className="w-5 h-5 mr-2" />
                  Browse More Cars
                </Button>
                <Button
                  onClick={() => navigate(createPageUrl("SubscriptionPlans"))}
                  className="bg-purple-600 hover:bg-purple-700 h-16"
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Upgrade Tier
                </Button>
                <Button
                  onClick={() => navigate(createPageUrl("SupportLiveChat"))}
                  className="bg-green-600 hover:bg-green-700 h-16"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Contact Support
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}