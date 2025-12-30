import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, Download, Star, CheckCircle, 
  Apple, PlayCircle, Share2, Home
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MobileAppPromo() {
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isPWAInstallable, setIsPWAInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Detect device
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    setIsIOS(/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream);
    setIsAndroid(/android/i.test(userAgent));

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsPWAInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsPWAInstallable(false);
    }
  };

  const handleAddToHomeScreen = () => {
    if (isIOS) {
      alert('To install:\n1. Tap the Share button (bottom center)\n2. Scroll and tap "Add to Home Screen"\n3. Tap "Add" in the top-right corner');
    } else if (isAndroid) {
      if (isPWAInstallable) {
        handleInstallPWA();
      } else {
        alert('To install:\n1. Tap the menu (⋮)\n2. Tap "Add to Home screen"\n3. Tap "Add"');
      }
    } else {
      alert('To install:\n1. Open in Chrome or Safari\n2. Use browser menu\n3. Select "Add to Home Screen"');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* App Icon Showcase */}
        <div className="text-center mb-12">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fedac268a06fe88d74977e/71a4bb750_FaviconSTOCRX.png"
            alt="STOCRX App Icon"
            className="w-48 h-48 mx-auto mb-6 rounded-3xl shadow-2xl"
          />
          <h1 className="text-5xl font-bold text-white mb-4">
            Get the STOCRX App
          </h1>
          <p className="text-xl text-gray-300">
            Like storks delivering babies, we deliver your dream car
          </p>
          <Badge className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg px-6 py-2">
            Available on iOS & Android
          </Badge>
        </div>

        {/* Install Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* iOS */}
          <Card className="p-8 bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 text-center">
            <Apple className="w-16 h-16 mx-auto mb-4 text-white" />
            <h2 className="text-2xl font-bold text-white mb-4">iPhone & iPad</h2>
            <p className="text-gray-300 mb-6">
              Add STOCRX to your home screen for a native app experience
            </p>
            <Button
              onClick={handleAddToHomeScreen}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 h-14 text-lg"
            >
              <Download className="w-5 h-5 mr-2" />
              Add to Home Screen
            </Button>
            <p className="text-xs text-gray-500 mt-4">
              Works on iOS 13+ (Safari)
            </p>
          </Card>

          {/* Android */}
          <Card className="p-8 bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 text-center">
            <PlayCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
            <h2 className="text-2xl font-bold text-white mb-4">Android</h2>
            <p className="text-gray-300 mb-6">
              Install STOCRX as a Progressive Web App on your Android device
            </p>
            <Button
              onClick={handleAddToHomeScreen}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 h-14 text-lg"
            >
              <Download className="w-5 h-5 mr-2" />
              Install App
            </Button>
            <p className="text-xs text-gray-500 mt-4">
              Works on Android 5+ (Chrome)
            </p>
          </Card>
        </div>

        {/* Features */}
        <Card className="p-8 bg-gray-800 border-gray-700 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Why Install the App?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: Smartphone,
                title: "Native App Feel",
                description: "Full-screen, no browser bars, smooth animations"
              },
              {
                icon: Star,
                title: "One-Tap Access",
                description: "Launch from home screen like any other app"
              },
              {
                icon: CheckCircle,
                title: "Offline Support",
                description: "View your account even without internet"
              },
              {
                icon: Share2,
                title: "Push Notifications",
                description: "Get alerts for payments, approvals, deliveries"
              }
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Installation Instructions */}
        <Card className="p-8 bg-gray-800 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">
            Installation Instructions
          </h2>

          <div className="space-y-6">
            {/* iOS Instructions */}
            <div className="bg-gray-700 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <Apple className="w-8 h-8 text-white" />
                <h3 className="text-xl font-bold text-white">iPhone/iPad (Safari)</h3>
              </div>
              <ol className="space-y-2 text-gray-300">
                <li className="flex gap-3">
                  <span className="font-bold text-blue-400">1.</span>
                  <span>Open STOCRX in Safari browser</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-400">2.</span>
                  <span>Tap the Share button (box with arrow) at the bottom</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-400">3.</span>
                  <span>Scroll down and tap "Add to Home Screen"</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-400">4.</span>
                  <span>Tap "Add" in the top-right corner</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-blue-400">5.</span>
                  <span>STOCRX app icon will appear on your home screen!</span>
                </li>
              </ol>
            </div>

            {/* Android Instructions */}
            <div className="bg-gray-700 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <PlayCircle className="w-8 h-8 text-green-400" />
                <h3 className="text-xl font-bold text-white">Android (Chrome)</h3>
              </div>
              <ol className="space-y-2 text-gray-300">
                <li className="flex gap-3">
                  <span className="font-bold text-green-400">1.</span>
                  <span>Open STOCRX in Chrome browser</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-green-400">2.</span>
                  <span>Tap the menu (⋮) in the top-right</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-green-400">3.</span>
                  <span>Tap "Add to Home screen" or "Install app"</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-green-400">4.</span>
                  <span>Tap "Add" or "Install"</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-green-400">5.</span>
                  <span>STOCRX app will install on your device!</span>
                </li>
              </ol>
            </div>
          </div>
        </Card>

        {/* Desktop Note */}
        <Alert className="mt-8 bg-blue-900 border-blue-700">
          <Smartphone className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-200">
            <strong>Desktop Users:</strong> STOCRX works great in your browser too! Install is optional but recommended for mobile devices.
          </AlertDescription>
        </Alert>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}