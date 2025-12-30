import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Zap, Users, Car, Shield, DollarSign, TrendingUp, CheckCircle } from "lucide-react";

export default function PlatformNarrative() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-blue-400" />
          <h1 className="text-5xl font-bold text-white mb-4">STOCRX Platform Story</h1>
          <p className="text-xl text-gray-400">The complete narrative of how STOCRX works</p>
        </div>

        {/* THE VISION */}
        <Card className="p-8 bg-gradient-to-br from-blue-900 to-blue-800 border-blue-700 mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">🌟 The Vision</h2>
          <p className="text-blue-100 text-lg mb-4">
            <strong>STOCRX</strong> (Subscription-To-Own Car Rentals Extended) revolutionizes car ownership 
            by allowing customers to <strong>subscribe monthly and build equity</strong> toward owning their vehicle.
          </p>
          <p className="text-blue-200 text-lg">
            Think of it as <strong>"Rent-to-Own for Cars"</strong> - customers make affordable weekly or monthly 
            payments, and each payment brings them closer to full ownership. No traditional financing, 
            flexible terms, and bad credit? No problem!
          </p>
        </Card>

        {/* HOW IT WORKS */}
        <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6">🔄 How STOCRX Works</h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <Badge className="bg-blue-600 text-xl h-12 w-12 flex items-center justify-center">1</Badge>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Browse & Select</h3>
                <p className="text-gray-300">
                  Customers browse <strong>used vehicles</strong> (all cars are sold "as-is"). 
                  They can filter by price, make, model, condition, and subscription tier.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Badge className="bg-green-600 text-xl h-12 w-12 flex items-center justify-center">2</Badge>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Choose Subscription Plan</h3>
                <p className="text-gray-300 mb-2">
                  Customers select from 6 subscription tiers:
                </p>
                <ul className="text-gray-400 space-y-1 ml-4">
                  <li>• <strong>Free:</strong> Browse only, limited access</li>
                  <li>• <strong>Standard ($299/mo):</strong> Access affordable vehicles</li>
                  <li>• <strong>Premium ($399/mo):</strong> Better vehicles, priority support</li>
                  <li>• <strong>Military VIP:</strong> Special rates for veterans</li>
                  <li>• <strong>High-End ($700/mo):</strong> Luxury/exotic vehicles</li>
                  <li>• <strong>Lifetime ($999 one-time):</strong> Unlimited access forever</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-4">
              <Badge className="bg-purple-600 text-xl h-12 w-12 flex items-center justify-center">3</Badge>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Application & KYC</h3>
                <p className="text-gray-300">
                  Customers apply by uploading:
                </p>
                <ul className="text-gray-400 space-y-1 ml-4">
                  <li>✅ Driver's license (front & back)</li>
                  <li>✅ Selfie photo</li>
                  <li>✅ Insurance proof (if required)</li>
                </ul>
                <p className="text-green-300 mt-2">
                  <strong>AI verifies identity</strong> (fake ID detection included!)
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Badge className="bg-yellow-600 text-xl h-12 w-12 flex items-center justify-center">4</Badge>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Admin Approval</h3>
                <p className="text-gray-300">
                  STOCRX admin reviews the application and approves/denies based on verification results.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Badge className="bg-orange-600 text-xl h-12 w-12 flex items-center justify-center">5</Badge>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Payment & Contract</h3>
                <p className="text-gray-300 mb-2">
                  Customer pays:
                </p>
                <ul className="text-gray-400 space-y-1 ml-4">
                  <li>💰 <strong>Down payment</strong> ($1,000 default)</li>
                  <li>💰 <strong>Membership fee</strong> (non-refundable)</li>
                  <li>💰 <strong>Weekly/monthly payments</strong></li>
                </ul>
                <p className="text-blue-300 mt-2">
                  <strong>Each payment builds ownership equity!</strong>
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Badge className="bg-pink-600 text-xl h-12 w-12 flex items-center justify-center">6</Badge>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Drive & Own</h3>
                <p className="text-gray-300">
                  Customer receives vehicle via:
                </p>
                <ul className="text-gray-400 space-y-1 ml-4">
                  <li>🚗 <strong>Pickup:</strong> Customer picks up from location</li>
                  <li>🚚 <strong>Delivery:</strong> Vehicle delivered to their door (fee applies)</li>
                </ul>
                <p className="text-green-300 mt-2">
                  After completing payments (3-6 month contract), <strong>customer owns the car!</strong>
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Badge className="bg-cyan-600 text-xl h-12 w-12 flex items-center justify-center">7</Badge>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Early Buyout Option</h3>
                <p className="text-gray-300">
                  Customers can buy out early with a <strong>25% discount</strong> on remaining balance!
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Continue with remaining sections... */}
      </div>
    </div>
  );
}