
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft, Package, Upload, Camera, AlertTriangle, CheckCircle,
  Clock, XCircle, DollarSign, Car, MapPin
} from "lucide-react";

export default function CustomerReturns() {
  const [user, setUser] = useState(null);
  const [showNewReturn, setShowNewReturn] = useState(false);
  const [returnData, setReturnData] = useState({
    subscription_id: "",
    vehicle_id: "",
    return_type: "early_termination",
    reason: "",
    condition_description: "",
    mileage_at_return: "",
    requested_return_date: "",
    return_location: "",
    pickup_required: false,
    pickup_address: "",
    customer_notes: "",
    return_photos: []
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (err) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  const { data: mySubscriptions } = useQuery({
    queryKey: ['my-subscriptions', user?.email],
    queryFn: () => base44.entities.Subscription.filter({
      customer_email: user.email,
      status: { $in: ['active', 'pending'] }
    }),
    enabled: !!user,
    initialData: []
  });

  const { data: vehicles } = useQuery({
    queryKey: ['all-vehicles'],
    queryFn: () => base44.entities.Vehicle.list(),
    initialData: []
  });

  const { data: myReturns } = useQuery({
    queryKey: ['my-returns', user?.email],
    queryFn: () => base44.entities.ReturnRequest.filter({
      customer_email: user.email
    }, "-created_date"),
    enabled: !!user,
    initialData: []
  });

  const { data: myStoreCredits } = useQuery({
    queryKey: ['my-store-credits', user?.email],
    queryFn: () => base44.entities.StoreCredit.filter({
      customer_email: user.email,
      status: { $in: ['active', 'partially_used'] }
    }),
    enabled: !!user,
    initialData: []
  });

  const submitReturnMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.ReturnRequest.create({
        ...returnData,
        customer_email: user.email,
        mileage_at_return: returnData.mileage_at_return ? parseFloat(returnData.mileage_at_return) : null,
        status: 'pending_review'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-returns']);
      alert("✅ Return request submitted! We'll review it within 1-2 business days.");
      setShowNewReturn(false);
      setReturnData({
        subscription_id: "",
        vehicle_id: "",
        return_type: "early_termination",
        reason: "",
        condition_description: "",
        mileage_at_return: "",
        requested_return_date: "",
        return_location: "",
        pickup_required: false,
        pickup_address: "",
        customer_notes: "",
        return_photos: []
      });
    }
  });

  const cancelReturnMutation = useMutation({
    mutationFn: async (returnId) => {
      return await base44.entities.ReturnRequest.update(returnId, {
        status: 'cancelled'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-returns']);
      alert("✅ Return request cancelled!");
    }
  });

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    const uploadedUrls = [];
    
    for (const file of files) {
      try {
        const result = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(result.file_url);
      } catch (error) {
        console.error("Upload error:", error);
      }
    }

    setReturnData(prev => ({
      ...prev,
      return_photos: [...prev.return_photos, ...uploadedUrls]
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalStoreCredit = myStoreCredits.reduce((sum, c) => sum + (c.balance || 0), 0);
  const pendingReturns = myReturns.filter(r => r.status === 'pending_review');
  const approvedReturns = myReturns.filter(r => r.status === 'approved' || r.status === 'scheduled');

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

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Package className="w-10 h-10 text-blue-400" />
              My Returns & Store Credits
            </h1>
            <p className="text-gray-400">Manage vehicle returns and view your store credits</p>
          </div>
          {mySubscriptions.length > 0 && (
            <Button
              onClick={() => setShowNewReturn(!showNewReturn)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Package className="w-5 h-5 mr-2" />
              Request Return
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-green-900 border-green-700">
            <DollarSign className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-green-200 text-sm mb-1">Store Credit Balance</p>
            <p className="text-4xl font-bold text-green-400">${totalStoreCredit.toLocaleString()}</p>
          </Card>
          <Card className="p-6 bg-yellow-900 border-yellow-700">
            <Clock className="w-8 h-8 text-yellow-400 mb-2" />
            <p className="text-yellow-200 text-sm mb-1">Pending Returns</p>
            <p className="text-4xl font-bold text-yellow-400">{pendingReturns.length}</p>
          </Card>
          <Card className="p-6 bg-blue-900 border-blue-700">
            <CheckCircle className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-blue-200 text-sm mb-1">Approved Returns</p>
            <p className="text-4xl font-bold text-blue-400">{approvedReturns.length}</p>
          </Card>
          <Card className="p-6 bg-purple-900 border-purple-700">
            <Car className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-purple-200 text-sm mb-1">Active Subscriptions</p>
            <p className="text-4xl font-bold text-purple-400">{mySubscriptions.length}</p>
          </Card>
        </div>

        {/* Store Credits */}
        {myStoreCredits.length > 0 && (
          <Card className="p-6 bg-gray-800 border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-400" />
              Your Store Credits
            </h2>
            <div className="space-y-3">
              {myStoreCredits.map((credit) => (
                <Card key={credit.id} className="p-4 bg-green-900/20 border-green-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-green-400">${credit.balance?.toLocaleString()}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Original: ${credit.original_amount?.toLocaleString()} • 
                        Reason: {credit.reason?.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Expires: {credit.expiration_date && new Date(credit.expiration_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="bg-green-600 text-white">
                      {credit.status}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
            <Alert className="mt-4 bg-blue-900/30 border-blue-700">
              <AlertDescription className="text-blue-200">
                💡 Store credits can be applied to future subscriptions, payments, or purchases.
              </AlertDescription>
            </Alert>
          </Card>
        )}

        {/* New Return Form */}
        {showNewReturn && (
          <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Request Vehicle Return</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              submitReturnMutation.mutate();
            }} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Select Subscription *</label>
                  <select
                    value={returnData.subscription_id}
                    onChange={(e) => {
                      const subId = e.target.value;
                      const sub = mySubscriptions.find(s => s.id === subId);
                      setReturnData({
                        ...returnData,
                        subscription_id: subId,
                        vehicle_id: sub?.vehicle_id || ""
                      });
                    }}
                    required
                    className="w-full p-3 rounded-lg bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="">Choose subscription...</option>
                    {mySubscriptions.map((sub) => {
                      const vehicle = vehicles.find(v => v.id === sub.vehicle_id);
                      return (
                        <option key={sub.id} value={sub.id}>
                          {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : sub.id}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Return Type *</label>
                  <select
                    value={returnData.return_type}
                    onChange={(e) => setReturnData({...returnData, return_type: e.target.value})}
                    className="w-full p-3 rounded-lg bg-gray-700 border-gray-600 text-white"
                  >
                    <option value="early_termination">Early Termination</option>
                    <option value="end_of_contract">End of Contract</option>
                    <option value="vehicle_swap">Vehicle Swap</option>
                    <option value="dissatisfaction">Dissatisfaction</option>
                    <option value="financial_hardship">Financial Hardship</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-gray-300 text-sm mb-2 block">Reason for Return *</label>
                  <Textarea
                    value={returnData.reason}
                    onChange={(e) => setReturnData({...returnData, reason: e.target.value})}
                    required
                    placeholder="Please explain why you're returning the vehicle..."
                    className="bg-gray-700 border-gray-600 text-white h-24"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Current Mileage</label>
                  <Input
                    type="number"
                    value={returnData.mileage_at_return}
                    onChange={(e) => setReturnData({...returnData, mileage_at_return: e.target.value})}
                    placeholder="45000"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Requested Return Date *</label>
                  <Input
                    type="date"
                    value={returnData.requested_return_date}
                    onChange={(e) => setReturnData({...returnData, requested_return_date: e.target.value})}
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-gray-300 text-sm mb-2 block">Vehicle Condition *</label>
                  <Textarea
                    value={returnData.condition_description}
                    onChange={(e) => setReturnData({...returnData, condition_description: e.target.value})}
                    required
                    placeholder="Describe the current condition of the vehicle..."
                    className="bg-gray-700 border-gray-600 text-white h-24"
                  />
                </div>

                <div>
                  <label className="text-gray-300 text-sm mb-2 block">Return Location</label>
                  <Input
                    value={returnData.return_location}
                    onChange={(e) => setReturnData({...returnData, return_location: e.target.value})}
                    placeholder="Where will you return the vehicle?"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="pickup_required"
                    checked={returnData.pickup_required}
                    onChange={(e) => setReturnData({...returnData, pickup_required: e.target.checked})}
                    className="w-5 h-5"
                  />
                  <label htmlFor="pickup_required" className="text-gray-300">
                    I need vehicle pickup
                  </label>
                </div>

                {returnData.pickup_required && (
                  <div className="md:col-span-2">
                    <label className="text-gray-300 text-sm mb-2 block">Pickup Address *</label>
                    <Input
                      value={returnData.pickup_address}
                      onChange={(e) => setReturnData({...returnData, pickup_address: e.target.value})}
                      required={returnData.pickup_required}
                      placeholder="Address for vehicle pickup"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="text-gray-300 text-sm mb-2 block">Additional Notes</label>
                  <Textarea
                    value={returnData.customer_notes}
                    onChange={(e) => setReturnData({...returnData, customer_notes: e.target.value})}
                    placeholder="Any additional information..."
                    className="bg-gray-700 border-gray-600 text-white h-24"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-gray-300 text-sm mb-2 block">Vehicle Photos</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                  {returnData.return_photos.length > 0 && (
                    <div className="grid grid-cols-4 gap-3 mt-4">
                      {returnData.return_photos.map((url, idx) => (
                        <img key={idx} src={url} alt={`Photo ${idx + 1}`} className="w-full h-24 object-cover rounded" />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Alert className="bg-yellow-900/30 border-yellow-700">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-200">
                  <strong>Important:</strong> Return requests are reviewed within 1-2 business days. 
                  Early termination may incur cancellation fees. All refunds will be issued as store credit.
                </AlertDescription>
              </Alert>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewReturn(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitReturnMutation.isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {submitReturnMutation.isLoading ? "Submitting..." : "Submit Return Request"}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* My Returns */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">My Return Requests ({myReturns.length})</h2>

          {myReturns.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 mb-4">No return requests yet</p>
              {mySubscriptions.length > 0 && (
                <Button onClick={() => setShowNewReturn(true)} className="bg-blue-600 hover:bg-blue-700">
                  Request Your First Return
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {myReturns.map((returnReq) => {
                const vehicle = vehicles.find(v => v.id === returnReq.vehicle_id);
                
                return (
                  <Card key={returnReq.id} className="p-6 bg-gray-700 border-gray-600">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-white text-lg mb-2">
                          {vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Vehicle'}
                        </h3>
                        <div className="flex gap-2 mb-2">
                          <Badge className={
                            returnReq.status === 'pending_review' ? 'bg-yellow-600' :
                            returnReq.status === 'approved' ? 'bg-green-600' :
                            returnReq.status === 'denied' ? 'bg-red-600' :
                            returnReq.status === 'completed' ? 'bg-blue-600' : 'bg-gray-600'
                          }>
                            {returnReq.status?.replace('_', ' ')}
                          </Badge>
                          <Badge className="bg-purple-600">
                            {returnReq.return_type?.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                      {returnReq.status === 'pending_review' && (
                        <Button
                          size="sm"
                          onClick={() => {
                            if (confirm("Cancel this return request?")) {
                              cancelReturnMutation.mutate(returnReq.id);
                            }
                          }}
                          disabled={cancelReturnMutation.isLoading}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-gray-400 text-sm">Requested Date</p>
                        <p className="text-white">
                          {returnReq.requested_return_date && new Date(returnReq.requested_return_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Submitted</p>
                        <p className="text-white">
                          {returnReq.created_date && new Date(returnReq.created_date).toLocaleDateString()}
                        </p>
                      </div>
                      {returnReq.refund_type && (
                        <div>
                          <p className="text-gray-400 text-sm">Refund Type</p>
                          <p className="text-white">{returnReq.refund_type?.replace('_', ' ')}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-gray-400 text-sm">Reason:</p>
                      <p className="text-white">{returnReq.reason}</p>
                      
                      {returnReq.admin_notes && (
                        <Alert className="bg-blue-900/30 border-blue-700 mt-4">
                          <AlertDescription className="text-blue-200">
                            <strong>Admin Response:</strong> {returnReq.admin_notes}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
