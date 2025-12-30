import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Calculator, ArrowRight } from "lucide-react";

export default function CalculatorPreview() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Side - Content */}
            <div className="p-12 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full text-blue-700 mb-6 w-fit">
                <Calculator className="w-4 h-4" />
                <span className="text-sm font-semibold">Ownership Calculator</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Calculate Your Path to Ownership
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                See exactly how much you'll pay weekly or monthly, track your ownership progress, and calculate early buyout discounts.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Flexible Payment Options</p>
                    <p className="text-gray-600">Choose weekly, bi-weekly, or monthly payments</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Live Ownership Tracking</p>
                    <p className="text-gray-600">Watch your equity grow in real-time</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Early Buyout Savings</p>
                    <p className="text-gray-600">Get 25% discount on remaining balance</p>
                  </div>
                </div>
              </div>

              <Link to={createPageUrl("Calculator")}>
                <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-lg px-8 h-14 shadow-lg">
                  Try Calculator
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Right Side - Visual */}
            <div className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 p-12 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800')] bg-cover bg-center opacity-10" />
              
              <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-2xl max-w-md w-full">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Down Payment</p>
                    <p className="text-3xl font-bold text-gray-900">$2,000</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Ownership Progress</p>
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-4 rounded-full" style={{ width: '35%' }} />
                    </div>
                    <p className="text-sm font-medium text-gray-700">$7,000 / $20,000 paid</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Weekly Payment</p>
                      <p className="text-2xl font-bold text-blue-600">$350</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Early Buyout</p>
                      <p className="text-2xl font-bold text-purple-600">$9,750</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}