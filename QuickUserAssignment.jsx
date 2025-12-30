import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Search, CheckCircle, Shield, Star, Briefcase } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function QuickUserAssignment() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [assignmentData, setAssignmentData] = useState({
    subscription_tier: "",
    department: "",
    job_title: "",
    role_id: ""
  });
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

  const { data: allUsers } = useQuery({
    queryKey: ['all-users-assignment'],
    queryFn: () => base44.entities.User.list("-created_date"),
    initialData: []
  });

  const { data: roles } = useQuery({
    queryKey: ['available-roles'],
    queryFn: () => base44.entities.EmployeeRole.list(),
    initialData: []
  });

  const assignUserMutation = useMutation({
    mutationFn: async ({ userId, data }) => {
      return await base44.entities.User.update(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-users-assignment']);
      setSelectedUser(null);
      setAssignmentData({
        subscription_tier: "",
        department: "",
        job_title: "",
        role_id: ""
      });
      alert("✅ User assigned successfully!");
    }
  });

  const handleQuickAssign = (assignmentType) => {
    if (!selectedUser) {
      alert("Please select a user first");
      return;
    }

    let updateData = {};

    switch (assignmentType) {
      case 'free':
        updateData = { subscription_tier: 'free' };
        break;
      case 'standard':
        updateData = { subscription_tier: 'standard' };
        break;
      case 'premium':
        updateData = { subscription_tier: 'premium' };
        break;
      case 'military':
        updateData = { subscription_tier: 'military' };
        break;
      case 'high_end':
        updateData = { subscription_tier: 'high_end' };
        break;
      case 'lifetime':
        updateData = { 
          subscription_tier: 'lifetime',
          is_lifetime_member: true
        };
        break;
      case 'tester':
        updateData = {
          role: 'tester',
          subscription_tier: 'free',
          department: null,
          job_title: 'Tester'
        };
        break;
      case 'employee':
        if (!assignmentData.department || !assignmentData.job_title) {
          alert("Please select department and job title for employee");
          return;
        }
        updateData = {
          department: assignmentData.department,
          job_title: assignmentData.job_title,
          role: 'employee'
        };
        break;
      case 'admin':
        updateData = { role: 'admin' };
        break;
      default:
        break;
    }

    assignUserMutation.mutate({
      userId: selectedUser.id,
      data: updateData
    });
  };

  const filteredUsers = allUsers?.filter(u => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return u?.full_name?.toLowerCase().includes(query) ||
           u?.email?.toLowerCase().includes(query);
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <UserPlus className="w-10 h-10 text-blue-400" />
            Quick User Assignment
          </h1>
          <p className="text-gray-400">Instantly assign roles, tiers, and permissions when users sign up</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Search */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Select User</h2>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email..."
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredUsers?.map(u => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedUser?.id === u.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    }`}
                  >
                    <p className="font-semibold">{u?.full_name || u?.email}</p>
                    <p className="text-xs opacity-75">{u?.email}</p>
                    <div className="flex gap-1 mt-2">
                      {u?.role === 'admin' && <Badge className="bg-red-600 text-xs">Admin</Badge>}
                      {u?.department && <Badge className="bg-green-600 text-xs">{u.department}</Badge>}
                      {u?.subscription_tier && <Badge className="bg-purple-600 text-xs">{u.subscription_tier}</Badge>}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Assignment Options */}
          <div className="lg:col-span-2">
            {selectedUser ? (
              <>
                <Alert className="mb-6 bg-blue-900/30 border-blue-700">
                  <CheckCircle className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-200">
                    <strong>Selected:</strong> {selectedUser.full_name || selectedUser.email}
                  </AlertDescription>
                </Alert>

                {/* Quick Tier Assignments */}
                <Card className="p-6 bg-gray-800 border-gray-700 mb-6">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Star className="w-6 h-6 text-yellow-400" />
                    Subscription Tier Assignment
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => handleQuickAssign('free')}
                      className="h-20 bg-gray-600 hover:bg-gray-700 flex-col"
                    >
                      <span className="text-lg font-bold">Free</span>
                      <span className="text-xs">Basic Access</span>
                    </Button>
                    <Button
                      onClick={() => handleQuickAssign('standard')}
                      className="h-20 bg-blue-600 hover:bg-blue-700 flex-col"
                    >
                      <span className="text-lg font-bold">Standard</span>
                      <span className="text-xs">$299/mo</span>
                    </Button>
                    <Button
                      onClick={() => handleQuickAssign('premium')}
                      className="h-20 bg-purple-600 hover:bg-purple-700 flex-col"
                    >
                      <span className="text-lg font-bold">Premium</span>
                      <span className="text-xs">$399/mo</span>
                    </Button>
                    <Button
                      onClick={() => handleQuickAssign('military')}
                      className="h-20 bg-green-600 hover:bg-green-700 flex-col"
                    >
                      <span className="text-lg font-bold">Military VIP</span>
                      <span className="text-xs">Special Perks</span>
                    </Button>
                    <Button
                      onClick={() => handleQuickAssign('high_end')}
                      className="h-20 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 flex-col"
                    >
                      <span className="text-lg font-bold">High-End</span>
                      <span className="text-xs">$700/mo</span>
                    </Button>
                    <Button
                      onClick={() => handleQuickAssign('lifetime')}
                      className="h-20 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 flex-col"
                    >
                      <span className="text-lg font-bold">Lifetime</span>
                      <span className="text-xs">One-time $999</span>
                    </Button>
                  </div>
                </Card>

                {/* Employee Assignment */}
                <Card className="p-6 bg-gray-800 border-gray-700 mb-6">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-green-400" />
                    Employee Assignment
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-white text-sm font-semibold mb-2 block">Department</label>
                      <Select value={assignmentData.department} onValueChange={(val) => setAssignmentData({...assignmentData, department: val})}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="operations">Operations</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="support">Support</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="fleet">Fleet</SelectItem>
                          <SelectItem value="hr">HR</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="dispatch">Dispatch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-white text-sm font-semibold mb-2 block">Job Title</label>
                      <Input
                        value={assignmentData.job_title}
                        onChange={(e) => setAssignmentData({...assignmentData, job_title: e.target.value})}
                        placeholder="e.g., Manager, Specialist"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={() => handleQuickAssign('employee')}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Assign as Employee
                  </Button>
                </Card>

                {/* Special Roles */}
                <Card className="p-6 bg-gray-800 border-gray-700">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-red-400" />
                    Special Roles
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => handleQuickAssign('tester')}
                      className="h-16 bg-orange-600 hover:bg-orange-700 flex-col"
                    >
                      <span className="text-lg font-bold">Tester</span>
                      <span className="text-xs">Own Data Only</span>
                    </Button>
                    <Button
                      onClick={() => handleQuickAssign('admin')}
                      className="h-16 bg-red-600 hover:bg-red-700 flex-col"
                    >
                      <span className="text-lg font-bold">Admin</span>
                      <span className="text-xs">Full Access</span>
                    </Button>
                    <Button
                      onClick={() => {
                        if (confirm("Remove all roles and reset to basic user?")) {
                          assignUserMutation.mutate({
                            userId: selectedUser.id,
                            data: {
                              role: 'user',
                              department: null,
                              job_title: null,
                              subscription_tier: 'free'
                            }
                          });
                        }
                      }}
                      variant="outline"
                      className="h-16 border-gray-600 hover:bg-gray-700 flex-col"
                    >
                      <span className="text-lg font-bold">Reset User</span>
                      <span className="text-xs">Remove All Roles</span>
                    </Button>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-12 bg-gray-800 border-gray-700 text-center">
                <UserPlus className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <h2 className="text-2xl font-bold text-white mb-2">Select a User</h2>
                <p className="text-gray-400">Choose a user from the list to assign roles and permissions</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}