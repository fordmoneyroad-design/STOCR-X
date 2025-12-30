
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Smartphone, Download, CheckCircle, Info } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function PWAInstallPrompt() {
  const navigate = useNavigate();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check auth
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

    // Check if already dismissed
    const dismissedDate = localStorage.getItem('pwa-dismissed');
    if (dismissedDate) {
      const daysSince = (Date.now() - parseInt(dismissedDate)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        setDismissed(true);
        return;
      }
    }

    // Detect device
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const iOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const android = /android/i.test(userAgent);
    
    setIsIOS(iOS);
    setIsAndroid(android);

    // Show prompt after 5 seconds if on mobile
    if (iOS || android) {
      trackAction('prompt_shown'); // Track that the prompt was shown
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const trackAction = async (actionType) => {
    try {
      const deviceType = isIOS ? 'iOS' : isAndroid ? 'Android' : 'Desktop';
      const browser = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome') ? 'Safari' : 
                     navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other';
      
      await base44.entities.PWAAnalytics.create({
        user_email: user?.email || null,
        action_type: actionType,
        device_type: deviceType,
        browser: browser,
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        session_id: sessionId
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  const handleDismiss = () => {
    trackAction('dismissed');
    localStorage.setItem('pwa-dismissed', Date.now().toString());
    setShowPrompt(false);
    setDismissed(true);
  };

  const handleLater = () => {
    trackAction('later_clicked');
    setShowPrompt(false);
    // Don't set dismissed, so it can show again on next visit
  };

  const handleInstallClick = () => {
    trackAction('install_clicked');
    navigate(createPageUrl("PWAInstallGuide"));
  };

  const handleInstructionsClick = () => {
    trackAction('instructions_viewed');
    navigate(createPageUrl("PWAInstallGuide"));
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragOffset({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleTouchMove = (e) => {
    if (isDragging) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragOffset.x,
        y: touch.clientY - dragOffset.y
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (dismissed || !showPrompt) return null;

  return (
    <Card 
      className="fixed bottom-6 right-6 w-96 max-w-[90vw] bg-gradient-to-br from-blue-600 to-purple-600 border-none shadow-2xl z-50 cursor-move"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="p-6 text-white">
        {/* Header with Logo */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fedac268a06fe88d74977e/0f2d8e915_IMG_3409.png"
              alt="STOCRX"
              className="h-10 w-auto"
            />
            <div>
              <h3 className="text-xl font-bold">Install STOCRX App</h3>
              <p className="text-xs text-blue-100">Drag to move</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="text-white hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <p className="text-sm mb-4 text-blue-50">
          Add STOCRX to your home screen for instant access and offline functionality!
        </p>

        {/* Benefits */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-300" />
            <span>Instant access from home screen</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-300" />
            <span>Works offline</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-300" />
            <span>No app store needed</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleInstallClick}
            className="w-full bg-white text-blue-600 hover:bg-gray-100 font-bold"
          >
            <Download className="w-4 h-4 mr-2" />
            Install Now
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={handleInstructionsClick}
              variant="outline"
              className="flex-1 border-white text-white hover:bg-white/20 font-semibold"
            >
              <Info className="w-4 h-4 mr-2" />
              How to Install
            </Button>
            <Button
              onClick={handleLater}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
            >
              Later
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
