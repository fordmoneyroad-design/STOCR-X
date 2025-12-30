
import { Card } from "@/components/ui/card";
import { Shield, Lock, Eye, Database } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-gray-600">
            Last updated: January 2025
          </p>
        </div>

        <div className="space-y-8">
          {/* Overview */}
          <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your Privacy Matters
            </h2>
            <p className="text-gray-700">
              At DEM MOTOR Rentals R2O, we are committed to protecting your personal information 
              and your right to privacy. This policy explains what information we collect, how we 
              use it, and your rights regarding your data.
            </p>
          </Card>

          {/* Information We Collect */}
          <Card className="p-8 border-none shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-green-600" />
              Information We Collect
            </h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Personal Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Full name, email address, phone number</li>
                  <li>Driver's license information and photos</li>
                  <li>Selfie/photo for identity verification</li>
                  <li>Payment information (processed securely through PCI-compliant gateways)</li>
                  <li>Delivery address</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Vehicle & Subscription Data</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Vehicle selection and preferences</li>
                  <li>Subscription details and payment history</li>
                  <li>Insurance documentation</li>
                  <li>Ownership progress and contract information</li>
                </ul>
              </div>

              <div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Usage Data</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Website and app usage analytics</li>
                  <li>Device information and IP address</li>
                  <li>Cookies and similar technologies</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* How We Use Your Information */}
          <Card className="p-8 border-none shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-purple-600" />
              How We Use Your Information
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>We use your information to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Process your subscription application and verify your identity</li>
                <li>Manage your subscription, payments, and ownership progress</li>
                <li>Deliver vehicles and provide customer support</li>
                <li>Send important notifications about your subscription</li>
                <li>Improve our services and platform features</li>
                <li>Comply with legal obligations and prevent fraud</li>
                <li>Send marketing communications (with your consent)</li>
              </ul>
            </div>
          </Card>

          {/* Data Protection */}
          <Card className="p-8 border-none shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-red-600" />
              Data Protection & Security
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>PCI-compliant payment processing</li>
                <li>Secure storage of KYC documents for 3 years</li>
                <li>Regular security audits and updates</li>
                <li>Restricted access to personal information</li>
              </ul>
            </div>
          </Card>

          {/* Your Rights */}
          <Card className="p-8 border-none shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your Privacy Rights
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal information</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data (subject to legal requirements)</li>
                <li>Opt-out of marketing communications</li>
                <li>Object to certain data processing activities</li>
                <li>Data portability</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, contact us at{" "}
                <a href="mailto:privacy@demmotorrentals.com" className="text-blue-600 hover:underline">
                  privacy@demmotorrentals.com
                </a>
              </p>
            </div>
          </Card>

          {/* Cookies */}
          <Card className="p-8 bg-gray-50 border-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Cookie Policy
            </h2>
            <p className="text-gray-700 mb-3">
              We use cookies and similar technologies to enhance your experience, analyze usage, 
              and provide personalized content. You can control cookie preferences through your 
              browser settings.
            </p>
            <p className="text-gray-700">
              Types of cookies we use: Essential cookies, Analytics cookies, Marketing cookies.
            </p>
          </Card>

          {/* Data Retention */}
          <Card className="p-8 border-none shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Data Retention
            </h2>
            <p className="text-gray-700">
              We retain your personal information for as long as necessary to provide our services 
              and comply with legal obligations. KYC documents (Driver License, Selfie) are stored 
              for 3 years from the end of your subscription.
            </p>
          </Card>

          {/* Contact */}
          <Card className="p-8 text-center border-none shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Questions About Privacy?
            </h3>
            <p className="text-gray-600">
              Contact our Privacy Team at{" "}
              <a href="mailto:privacy@stocrx.com" className="text-blue-600 hover:underline">
                privacy@stocrx.com
              </a>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
