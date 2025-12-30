import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const heroImages = [
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fedac268a06fe88d74977e/c02ed1803_IMG_3540.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fedac268a06fe88d74977e/0216c04ea_IMG_3539.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fedac268a06fe88d74977e/b5f2e35da_IMG_3538.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fedac268a06fe88d74977e/c98761681_IMG_3537.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fedac268a06fe88d74977e/ae53fdf99_IMG_3535.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fedac268a06fe88d74977e/563d7d81d_IMG_3534.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fedac268a06fe88d74977e/354b12e84_IMG_3533.jpg"
];

export default function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const currentUser = await base44.auth.me();
          setUser(currentUser);
        }
      } catch (err) {
        // Not authenticated
      }
    };
    checkAuth();
  }, []);

  // Auto-rotate images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSignUp = () => {
    base44.auth.redirectToLogin(createPageUrl("BrowseCars"));
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Image Carousel Background */}
      <div className="absolute inset-0">
        {heroImages.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.8); }
        }

        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-md px-6 py-3 rounded-full text-white mb-8 border border-white/30 pulse-glow">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span className="text-base font-bold">Instant AI Approval • Drive This Week</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight animate-float">
            Drive Today.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Own Tomorrow.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/90 mb-12 font-light leading-relaxed">
            Subscribe to your dream car and build ownership with every payment. 
            <span className="block mt-2 text-blue-300 font-semibold">No big lump sums. No endless rentals.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            {!user ? (
              <>
                <Button 
                  size="lg" 
                  onClick={handleSignUp}
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-2xl text-xl px-10 h-16 transform hover:scale-105 transition-all pulse-glow font-bold"
                >
                  <UserPlus className="mr-3 w-6 h-6" />
                  Sign Up & Start Driving
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
                <Link to={createPageUrl("BrowseCars")}>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-3 border-white/80 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 text-xl px-10 h-16 transform hover:scale-105 transition-all font-bold"
                  >
                    Browse Fleet
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to={createPageUrl("BrowseCars")}>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-2xl text-xl px-10 h-16 transform hover:scale-105 transition-all pulse-glow font-bold"
                  >
                    Browse Available Cars
                    <ArrowRight className="ml-3 w-6 h-6" />
                  </Button>
                </Link>
                <Link to={createPageUrl("MyAccount")}>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-3 border-white/80 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 text-xl px-10 h-16 transform hover:scale-105 transition-all font-bold"
                  >
                    My Account
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "AI Approval", value: "Instant" },
              { label: "Contract Terms", value: "3-6 Months" },
              { label: "Down Payment", value: "From $1K" },
              { label: "Build Equity", value: "Every Pay" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all hover:scale-105">
                <div className="text-2xl md:text-3xl font-black text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/80 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Image Indicators */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {heroImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentImageIndex(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === currentImageIndex 
                ? 'bg-white w-12' 
                : 'bg-white/40 w-2 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 animate-bounce">
        <div className="w-8 h-12 rounded-full border-2 border-white/50 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white/70 rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
}