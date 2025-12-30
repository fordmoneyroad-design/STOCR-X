
import { Card } from "@/components/ui/card";
import { Shield, FileText, AlertTriangle } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: January 2025
          </p>
        </div>

        <div className="space-y-8">
          {/* Non-Refundable Fees */}
          <Card className="p-8 border-l-4 border-red-500 bg-red-50 border-none">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Non-Refundable Fees
                </h2>
                <p className="text-gray-700 mb-2">
                  <strong>IMPORTANT:</strong> By subscribing to a vehicle, you acknowledge and agree that:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>The down payment is <strong>NON-REFUNDABLE</strong></li>
                  <li>The finance fee is <strong>NON-REFUNDABLE</strong></li>
                  <li>Platform fees are <strong>NON-REFUNDABLE</strong></li>
                  <li>Subscription payments once made are <strong>NON-REFUNDABLE</strong></li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Agreement Terms */}
          <Card className="p-8 border-none shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-green-600" />
              Subscription Agreement
            </h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">1. Commitment Period</h3>
                <p>
                  Minimum subscription term is 3 months (91 days). Maximum term is 6 months. 
                  The initial agreed term begins upon vehicle delivery.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">2. Payment Terms</h3>
                <p className="mb-2">
                  Payments must be made according to the selected frequency (weekly, bi-weekly, or monthly). 
                  A 0.6% platform fee applies to all recurring payments.
                </p>
                <p>
                  Accepted payment methods: ACH, Credit/Debit Card, PayPal.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">3. Late Payment Policy</h3>
                <p className="mb-2">
                  Late fees are applied weekly for missed payments:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Week 1: Flat late fee (amount set by admin)</li>
                  <li>Week 2: Additional flat late fee</li>
                  <li>Week 3: Additional flat late fee</li>
                  <li>Week 4: Additional flat late fee</li>
                </ul>
                <p className="mt-2">
                  After 30 days of delinquency (4 missed payments), the vehicle may be suspended/disabled, 
                  sent to collections, repossessed, and reported to credit bureaus. Loss or theft after 
                  30 days requires a police report.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">4. Ownership Path</h3>
                <p>
                  Every subscription payment contributes toward the total vehicle cost. Once the full 
                  vehicle price is paid (including down payment and all fees), ownership transfers to you.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">5. Early Buyout Option</h3>
                <p>
                  You may complete ownership early with a 25% discount on the remaining balance 
                  (discount rate may vary per vehicle). This is optional and not required.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">6. Swap & Upgrade</h3>
                <p className="mb-2">
                  <strong>Planned Trade-In:</strong> Allowed starting one month (or 4 weekly periods) 
                  after down payment.
                </p>
                <p>
                  <strong>Upgrade:</strong> Allowed ONLY at the completion of a full subscription cycle 
                  (minimum 91 days). Upgrades before this period are treated as early termination.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">7. Insurance Requirement</h3>
                <p>
                  Insurance may be optional or mandatory depending on the vehicle. If mandatory, 
                  you must upload proof of valid coverage before the subscription activates. 
                  Failure to maintain insurance is a breach of this agreement.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">8. Delivery</h3>
                <p>
                  Free delivery within 25 miles of our location. Delivery beyond 25 miles incurs 
                  a fee added to your next payment. Delivery window is 2-7 days. Same-day delivery 
                  available for weekly customers (extra fee applies).
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">9. Termination</h3>
                <p>
                  You may request termination after 4 weeks of delinquency. Termination requires 
                  a police report and signed release. Vehicle pickup is free. No refunds are provided 
                  for any fees or payments already made.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">10. Data Privacy & KYC</h3>
                <p>
                  You consent to the storage of your contract and KYC documents (Driver License, Selfie) 
                  for 3 years in compliance with applicable laws. Your data will be protected according 
                  to our Privacy Policy.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">11. Arbitration & Venue</h3>
                <p>
                  Any dispute arising under this Agreement shall be settled by binding arbitration 
                  in accordance with the rules of the American Arbitration Association, with venue 
                  exclusively in the state of Michigan.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">12. Fraud Prevention</h3>
                <p>
                  Photo/VIN verification is required during delivery and return. Any tampering 
                  with the vehicle or odometer is a breach of this agreement and may result in 
                  legal action.
                </p>
              </div>
            </div>
          </Card>

          {/* Privacy Policy Link */}
          <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Privacy & Data Protection
            </h2>
            <p className="text-gray-700 mb-4">
              We take your privacy seriously. Your personal information is protected and used only 
              for the purposes outlined in our Privacy Policy.
            </p>
            <p className="text-sm text-gray-600">
              For full details, please read our <strong>Privacy Policy</strong> and <strong>Cookie Policy</strong>.
            </p>
          </Card>

          {/* Contact */}
          <Card className="p-8 text-center border-none shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Questions About Our Terms?
            </h3>
            <p className="text-gray-600 mb-4">
              Contact us at{" "}
              <a href="mailto:legal@stocrx.com" className="text-blue-600 hover:underline">
                legal@stocrx.com
              </a>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
