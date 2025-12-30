import { Shield, Zap, TrendingUp, RefreshCw, Clock, Award } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Instant AI Approval",
    description: "Get approved in minutes with our advanced AI verification system",
    gradient: "from-yellow-400 to-orange-500"
  },
  {
    icon: TrendingUp,
    title: "Build Ownership",
    description: "Every payment brings you closer to owning your vehicle",
    gradient: "from-green-400 to-emerald-500"
  },
  {
    icon: RefreshCw,
    title: "Swap or Upgrade",
    description: "Transfer your equity to any vehicle in our fleet",
    gradient: "from-blue-400 to-cyan-500"
  },
  {
    icon: Shield,
    title: "Flexible Insurance",
    description: "Optional or mandatory insurance based on your vehicle",
    gradient: "from-purple-400 to-pink-500"
  },
  {
    icon: Clock,
    title: "3-6 Month Terms",
    description: "Choose a commitment period that works for you",
    gradient: "from-red-400 to-rose-500"
  },
  {
    icon: Award,
    title: "Early Buyout Discount",
    description: "Get 25% off when you complete ownership early",
    gradient: "from-indigo-400 to-violet-500"
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose DEM MOTOR?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the freedom of flexible car ownership
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}