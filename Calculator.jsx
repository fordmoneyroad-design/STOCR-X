import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator as CalcIcon, TrendingUp, DollarSign, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Calculator() {
  const [downPayment, setDownPayment] = useState(2000);
  const [vehiclePrice, setVehiclePrice] = useState(20000);
  const [contractLength, setContractLength] = useState(3);
  const [paymentFrequency, setPaymentFrequency] = useState("weekly");
  
  const platformFeeRate = 0.006;
  const earlyBuyoutDiscount = 0.25;
  const financeFee = 500;

  // Calculate payments
  const remainingAfterDown = vehiclePrice - downPayment;
  const periodsInContract = paymentFrequency === "weekly" ? contractLength * 4 : 
                            paymentFrequency === "bi-weekly" ? contractLength * 2 : 
                            contractLength;
  
  const basePayment = remainingAfterDown / periodsInContract;
  const platformFee = basePayment * platformFeeRate;
  const totalPerPayment = basePayment + platformFee;
  
  const totalPaid = downPayment + financeFee;
  const ownershipProgress = (totalPaid / vehiclePrice) * 100;
  const earlyBuyoutPrice = (vehiclePrice - totalPaid) * (1 - earlyBuyoutDiscount);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full text-blue-700 mb-4">
            <CalcIcon className="w-4 h-4" />
            <span className="text-sm font-semibold">Ownership Calculator</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Calculate Your Path to Ownership
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See exactly how much you'll pay and track your journey to ownership
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="p-8 shadow-xl border-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Details</h2>
            
            <div className="space-y-6">
              {/* Vehicle Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Price ($)
                </label>
                <Input
                  type="number"
                  value={vehiclePrice}
                  onChange={(e) => setVehiclePrice(Number(e.target.value))}
                  className="text-lg h-12"
                  min="1000"
                  step="1000"
                />
              </div>

              {/* Down Payment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Down Payment ($) - Min $1,000
                </label>
                <Input
                  type="number"
                  value={downPayment}
                  onChange={(e) => setDownPayment(Math.max(1000, Number(e.target.value)))}
                  className="text-lg h-12"
                  min="1000"
                  step="100"
                />
              </div>

              {/* Contract Length */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Contract Length: {contractLength} months
                </label>
                <Slider
                  value={[contractLength]}
                  onValueChange={(value) => setContractLength(value[0])}
                  min={3}
                  max={6}
                  step={1}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>3 mo</span>
                  <span>6 mo</span>
                </div>
              </div>

              {/* Payment Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Frequency
                </label>
                <Tabs value={paymentFrequency} onValueChange={setPaymentFrequency}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="bi-weekly">Bi-Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </Card>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Main Payment Display */}
            <Card className="p-8 shadow-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white border-none">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-blue-100 text-sm mb-1">
                    {paymentFrequency.charAt(0).toUpperCase() + paymentFrequency.slice(1)} Payment
                  </p>
                  <h2 className="text-5xl font-bold">${totalPerPayment.toFixed(2)}</h2>
                </div>
                <DollarSign className="w-12 h-12 text-blue-200" />
              </div>
              <p className="text-blue-100 text-sm">
                Includes ${platformFee.toFixed(2)} platform fee (0.6%)
              </p>
            </Card>

            {/* Ownership Progress */}
            <Card className="p-8 shadow-xl border-none">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Ownership Progress</h3>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>${totalPaid.toLocaleString()} paid</span>
                  <span>${vehiclePrice.toLocaleString()} total</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-6 rounded-full transition-all duration-500 flex items-center justify-center text-white text-xs font-bold"
                    style={{ width: `${ownershipProgress}%` }}
                  >
                    {ownershipProgress.toFixed(1)}%
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Remaining Balance: <span className="font-semibold">${(vehiclePrice - totalPaid).toLocaleString()}</span>
              </p>
            </Card>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 shadow-lg border-none bg-purple-50">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <p className="text-sm text-gray-600">Contract Period</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">{contractLength} months</p>
                <p className="text-xs text-gray-500 mt-1">{periodsInContract} total payments</p>
              </Card>

              <Card className="p-6 shadow-lg border-none bg-blue-50">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-gray-600">Early Buyout</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">${earlyBuyoutPrice.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">25% discount applied</p>
              </Card>
            </div>

            {/* CTA */}
            <Link to={createPageUrl("Apply")}>
              <Button size="lg" className="w-full h-14 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg">
                Apply These Terms
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}