import { Car, CreditCard, Upload, TrendingUp, RefreshCw, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Car,
    title: "Pick Your Car",
    description: "Browse our inventory and find your perfect match",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: CreditCard,
    title: "Pay Down Payment",
    description: "Secure your vehicle with an initial payment",
    color: "from-purple-500 to-purple-600"
  },
  {
    icon: Upload,
    title: "Upload License + Selfie",
    description: "Quick verification with our AI approval system",
    color: "from-pink-500 to-pink-600"
  },
  {
    icon: CheckCircle,
    title: "Start Driving Same Week",
    description: "Free local delivery to your doorstep",
    color: "from-green-500 to-green-600"
  },
  {
    icon: TrendingUp,
    title: "Every Payment Builds Ownership",
    description: "Watch your equity grow with each payment",
    color: "from-yellow-500 to-yellow-600"
  },
  {
    icon: RefreshCw,
    title: "Option to Swap or Upgrade",
    description: "Transfer your equity to a different vehicle anytime",
    color: "from-red-500 to-red-600"
  }
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get behind the wheel in 6 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-all duration-300 h-full">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                      <step.icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-gray-400 mb-2">STEP {index + 1}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-gray-300 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}