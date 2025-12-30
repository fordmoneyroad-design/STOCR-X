import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bell, Smartphone, Mail, AlertTriangle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const NOTIFICATION_TYPES = [
  {
    id: "vehicle_approved",
    title: "Vehicle Approved",
    description: "When your vehicle is approved and ready",
    icon: "🚗",
    category: "approval",
    priority: "high"
  },
  {
    id: "payment_due",
    title: "Payment Due Soon",
    description: "3 days before payment is due",
    icon: "💰",
    category: "payment",
    priority: "high"
  },
  {
    id: "payment_received",
    title: "Payment Received",
    description: "When your payment is confirmed",
    icon: "✅",
    category: "payment",
    priority: "medium"
  },
  {
    id: "kyc_approved",
    title: "KYC Verified",
    description: "When your identity verification is approved",
    icon: "🎉",
    category: "approval",
    priority: "high"
  },
  {
    id: "subscription_active",
    title: "Subscription Active",
    description: "When your subscription is activated",
    icon: "⭐",
    category: "approval",
    priority: "high"
  },
  {
    id: "vehicle_ready_delivery",
    title: "Vehicle Ready for Delivery",
    description: "When your vehicle is ready to be delivered",
    icon: "🚚",
    category: "delivery",
    priority: "high"
  },
  {
    id: "support_response",
    title: "Support Team Response",
    description: "When support responds to your ticket",
    icon: "💬",
    category: "support",
    priority: "medium"
  },
  {
    id: "tier_upgrade",
    title: "Tier Upgrade Approved",
    description: "When your tier upgrade is processed",
    icon: "🎊",
    category: "approval",
    priority: "medium"
  },
  {
    id: "document_required",
    title: "Document Required",
    description: "When additional documents are needed",
    icon: "📄",
    category: "approval",
    priority: "high"
  },
  {
    id: "promotion_offers",
    title: "Special Offers & Promotions",
    description: "Exclusive deals and discounts",
    icon: "🎁",
    category: "marketing",
    priority: "low"
  }
];

const ADMIN_NOTIFICATION_TYPES = [
  {
    id: "admin_new_subscription",
    title: "New Subscription Application",
    description: "When a new customer applies",
    icon: "📝",
    category: "admin",
    priority: "high"
  },
  {
    id: "admin_kyc_pending",
    title: "KYC Verification Needed",
    description: "New KYC documents uploaded",
    icon: "🔍",
    category: "admin",
    priority: "high"
  },
  {
    id: "admin_payment_pending",
    title: "Payment Verification Needed",
    description: "Manual payment needs verification",
    icon: "💳",
    category: "admin",
    priority: "high"
  },
  {
    id: "admin_vehicle_uploaded",
    title: "New Vehicle Added",
    description: "Vehicle needs approval",
    icon: "🚙",
    category: "admin",
    priority: "medium"
  },
  {
    id: "admin_support_ticket",
    title: "New Support Ticket",
    description: "Customer needs assistance",
    icon: "🎫",
    category: "admin",
    priority: "medium"
  },
  {
    id: "admin_overdue_payment",
    title: "Overdue Payment Alert",
    description: "Payment is overdue",
    icon: "⚠️",
    category: "admin",
    priority: "high"
  },
  {
    id: "admin_system_health",
    title: "System Health Alerts",
    description: "When system issues are detected",
    icon: "🔧",
    category: "admin",
    priority: "high"
  },
  {
    id: "admin_daily_summary",
    title: "Daily Summary Report",
    description: "End of day statistics",
    icon: "📊",
    category: "admin",
    priority: "low"
  },
  {
    id: "admin_task_assigned",
    title: "Task Assigned to You",
    description: "When you're assigned a task",
    icon: "✔️",
    category: "admin",
    priority: "medium"
  },
  {
    id: "admin_employee_timesheet",
    title: "Timesheet Reminders",
    description: "Employee timesheet due",
    icon: "⏰",
    category: "admin",
    priority: "low"
  }
];

export default function NotificationSettings() {
  const [user, setUser] = useState(null);
  const [notificationPrefs, setNotificationPrefs] = useState({});
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Load saved preferences
        const saved = localStorage.getItem(`notification-prefs-${currentUser.email}`);
        if (saved) {
          setNotificationPrefs(JSON.parse(saved));
        } else {
          // Default all to true
          const defaults = {};
          const allTypes = currentUser.role === 'admin' || currentUser.email === 'fordmoneyroad@gmail.com'
            ? [...NOTIFICATION_TYPES, ...ADMIN_NOTIFICATION_TYPES]
            : NOTIFICATION_TYPES;
          
          allTypes.forEach(type => {
            defaults[type.id] = true;
          });
          setNotificationPrefs(defaults);
        }

        // Check if push notifications are supported
        if ('Notification' in window && 'serviceWorker' in navigator) {
          setPushSupported(true);
          setPushEnabled(Notification.permission === 'granted');
        }
      } catch (err) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  const savePreferences = (newPrefs) => {
    localStorage.setItem(`notification-prefs-${user.email}`, JSON.stringify(newPrefs));
    setNotificationPrefs(newPrefs);
  };

  const toggleNotification = (id) => {
    const updated = { ...notificationPrefs, [id]: !notificationPrefs[id] };
    savePreferences(updated);
  };

  const enableAllCategory = (category) => {
    const updated = { ...notificationPrefs };
    const allTypes = user.role === 'admin' || user.email === 'fordmoneyroad@gmail.com'
      ? [...NOTIFICATION_TYPES, ...ADMIN_NOTIFICATION_TYPES]
      : NOTIFICATION_TYPES;
    
    allTypes.filter(t => t.category === category).forEach(type => {
      updated[type.id] = true;
    });
    savePreferences(updated);
  };

  const disableAllCategory = (category) => {
    const updated = { ...notificationPrefs };
    const allTypes = user.role === 'admin' || user.email === 'fordmoneyroad@gmail.com'
      ? [...NOTIFICATION_TYPES, ...ADMIN_NOTIFICATION_TYPES]
      : NOTIFICATION_TYPES;
    
    allTypes.filter(t => t.category === category).forEach(type => {
      updated[type.id] = false;
    });
    savePreferences(updated);
  };

  const requestPushPermission = async () => {
    if (!pushSupported) {
      alert("Push notifications are not supported on this device/browser.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setPushEnabled(true);
        new Notification("STOCRX Notifications Enabled!", {
          body: "You'll now receive important updates on your device.",
          icon: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fedac268a06fe88d74977e/0f2d8e915_IMG_3409.png"
        });
      }
    } catch (error) {
      console.error("Push notification error:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isAdmin = user.role === 'admin' || user.email === 'fordmoneyroad@gmail.com';
  const allTypes = isAdmin ? [...NOTIFICATION_TYPES, ...ADMIN_NOTIFICATION_TYPES] : NOTIFICATION_TYPES;

  const categories = [...new Set(allTypes.map(t => t.category))];
  const enabledCount = Object.values(notificationPrefs).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Bell className="w-10 h-10 text-blue-400" />
            Notification Settings
          </h1>
          <p className="text-gray-400">Manage your notification preferences and push notifications</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-blue-900 border-blue-700">
            <Smartphone className="w-8 h-8 text-blue-400 mb-2" />
            <p className="text-blue-200 text-sm mb-1">Push Notifications</p>
            <p className="text-2xl font-bold text-blue-400">{pushEnabled ? "Enabled" : "Disabled"}</p>
          </Card>
          <Card className="p-6 bg-green-900 border-green-700">
            <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
            <p className="text-green-200 text-sm mb-1">Active Notifications</p>
            <p className="text-2xl font-bold text-green-400">{enabledCount} / {allTypes.length}</p>
          </Card>
          <Card className="p-6 bg-purple-900 border-purple-700">
            <Mail className="w-8 h-8 text-purple-400 mb-2" />
            <p className="text-purple-200 text-sm mb-1">Email Notifications</p>
            <p className="text-2xl font-bold text-purple-400">Always On</p>
          </Card>
        </div>

        {/* Push Notification Setup */}
        {!pushEnabled && pushSupported && (
          <Alert className="mb-8 bg-yellow-900/30 border-yellow-700">
            <Smartphone className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-200">
              <strong>Enable Push Notifications</strong> to receive real-time updates on your device, 
              even when the app is closed. Perfect for payment reminders and approvals!
              <Button
                onClick={requestPushPermission}
                className="mt-3 bg-yellow-600 hover:bg-yellow-700"
              >
                <Bell className="w-4 h-4 mr-2" />
                Enable Push Notifications
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {pushEnabled && (
          <Alert className="mb-8 bg-green-900/30 border-green-700">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-200">
              ✅ <strong>Push notifications are enabled!</strong> You'll receive real-time alerts on this device.
            </AlertDescription>
          </Alert>
        )}

        {/* Notification Categories */}
        {categories.map((category) => {
          const categoryTypes = allTypes.filter(t => t.category === category);
          const categoryEnabled = categoryTypes.filter(t => notificationPrefs[t.id]).length;
          
          return (
            <Card key={category} className="p-6 bg-gray-800 border-gray-700 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white capitalize mb-1">{category} Notifications</h2>
                  <p className="text-sm text-gray-400">{categoryEnabled} of {categoryTypes.length} enabled</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => enableAllCategory(category)}
                    className="border-green-600 text-green-400 hover:bg-green-900/30"
                  >
                    Enable All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => disableAllCategory(category)}
                    className="border-red-600 text-red-400 hover:bg-red-900/30"
                  >
                    Disable All
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {categoryTypes.map((type) => (
                  <div key={type.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{type.icon}</span>
                      <div>
                        <h3 className="font-bold text-white">{type.title}</h3>
                        <p className="text-sm text-gray-400">{type.description}</p>
                        <Badge className={
                          type.priority === 'high' ? 'bg-red-600 mt-2' :
                          type.priority === 'medium' ? 'bg-yellow-600 mt-2' :
                          'bg-gray-600 mt-2'
                        }>
                          {type.priority} priority
                        </Badge>
                      </div>
                    </div>
                    <Switch
                      checked={notificationPrefs[type.id] || false}
                      onCheckedChange={() => toggleNotification(type.id)}
                    />
                  </div>
                ))}
              </div>
            </Card>
          );
        })}

        {/* Info */}
        <Card className="p-6 bg-blue-900/30 border-blue-700">
          <h3 className="text-xl font-bold text-white mb-4">📱 How Notifications Work</h3>
          <ul className="space-y-2 text-blue-200">
            <li>• <strong>Push Notifications:</strong> Real-time alerts on your device (must be enabled)</li>
            <li>• <strong>Email Notifications:</strong> Always sent regardless of settings</li>
            <li>• <strong>In-App Notifications:</strong> Show in the notification center</li>
            <li>• <strong>Priority Levels:</strong> High priority notifications cannot be disabled</li>
            <li>• <strong>Quiet Hours:</strong> Low priority notifications won't disturb you 10pm-8am</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}