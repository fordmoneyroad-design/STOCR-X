
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Palette, Sparkles, Calendar, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const HOLIDAY_THEMES = [
  {
    id: 'holiday_christmas',
    name: 'Christmas',
    icon: '🎄',
    colors: { primary: '#C41E3A', accent: '#165B33' },
    startDate: '2024-12-01',
    endDate: '2024-12-26'
  },
  {
    id: 'holiday_new_year',
    name: 'New Year',
    icon: '🎊',
    colors: { primary: '#FFD700', accent: '#000000' },
    startDate: '2024-12-27',
    endDate: '2025-01-02'
  },
  {
    id: 'holiday_valentine',
    name: "Valentine's Day",
    icon: '💝',
    colors: { primary: '#FF1493', accent: '#FFC0CB' },
    startDate: '2025-02-10',
    endDate: '2025-02-15'
  },
  {
    id: 'holiday_easter',
    name: 'Easter',
    icon: '🐰',
    colors: { primary: '#FFB6C1', accent: '#90EE90' },
    startDate: '2025-04-15',
    endDate: '2025-04-21'
  },
  {
    id: 'holiday_july4th',
    name: 'Independence Day',
    icon: '🇺🇸',
    colors: { primary: '#B22234', accent: '#3C3B6E' },
    startDate: '2025-07-01',
    endDate: '2025-07-05'
  },
  {
    id: 'holiday_halloween',
    name: 'Halloween',
    icon: '🎃',
    colors: { primary: '#FF6600', accent: '#000000' },
    startDate: '2025-10-25',
    endDate: '2025-10-31'
  },
  {
    id: 'holiday_thanksgiving',
    name: 'Thanksgiving',
    icon: '🦃',
    colors: { primary: '#D2691E', accent: '#FF8C00' },
    startDate: '2025-11-20',
    endDate: '2025-11-28'
  }
];

const getHolidayColor = (holidayId) => {
  const holiday = HOLIDAY_THEMES.find(h => h.id === holidayId);
  return holiday?.colors.primary || '#3B82F6';
};

const parseDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export default function ThemeManager() {
  const [user, setUser] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [darkMode, setDarkMode] = useState(false);
  const [showTopLogo, setShowTopLogo] = useState(true);
  const [quickLinksOpacity, setQuickLinksOpacity] = useState('colored'); // NEW
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.email !== "fordmoneyroad@gmail.com" && currentUser.role !== 'admin') {
          window.location.href = '/';
          return;
        }
        setUser(currentUser);

        // Load dark mode preference
        const savedDarkMode = localStorage.getItem('stocrx-dark-mode');
        if (savedDarkMode) {
          setDarkMode(savedDarkMode === 'true');
          document.documentElement.classList.toggle('dark', savedDarkMode === 'true');
        }

        // Load logo preferences
        const topLogo = localStorage.getItem('stocrx-show-top-logo');
        if (topLogo !== null) setShowTopLogo(topLogo === 'true');
        
        // NEW: Load quick links opacity preference
        const opacityPrefs = localStorage.getItem('stocrx-quick-links-opacity');
        if (opacityPrefs) setQuickLinksOpacity(opacityPrefs);
      } catch (err) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  const { data: currentTheme } = useQuery({
    queryKey: ['current-theme'],
    queryFn: async () => {
      const themes = await base44.entities.ThemeSettings.filter({ is_active: true });
      if (themes.length > 0) {
        setSelectedTheme(themes[0].theme_name);
        return themes[0];
      }
      return await base44.entities.ThemeSettings.create({
        theme_name: 'default',
        is_active: true,
        background_color: '#0A1931',
        accent_color: '#00FFFF',
        gradient_enabled: true,
        animations_enabled: true
      });
    },
    enabled: !!user
  });

  const updateThemeMutation = useMutation({
    mutationFn: async (data) => {
      if (currentTheme?.id) {
        return await base44.entities.ThemeSettings.update(currentTheme.id, data);
      }
      return await base44.entities.ThemeSettings.create({ ...data, is_active: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['current-theme']);
      alert("✅ Theme updated!");
    }
  });

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('stocrx-dark-mode', String(newDarkMode));
    document.documentElement.classList.toggle('dark', newDarkMode);
    
    updateThemeMutation.mutate({
      background_color: newDarkMode ? '#111827' : '#0A1931',
      gradient_enabled: !newDarkMode
    });
  };

  const toggleTopLogo = () => {
    const newValue = !showTopLogo;
    setShowTopLogo(newValue);
    localStorage.setItem('stocrx-show-top-logo', String(newValue));
    window.location.reload(); // Reload to apply changes
  };

  // NEW: Toggle quick links opacity
  const toggleQuickLinksOpacity = () => {
    const newValue = quickLinksOpacity === 'colored' ? 'transparent' : 'colored';
    setQuickLinksOpacity(newValue);
    localStorage.setItem('stocrx-quick-links-opacity', newValue);
    window.location.reload(); // Reload to apply changes
  };

  const activateHolidayTheme = async (holiday) => {
    // const today = new Date(); // Not used directly in activateHolidayTheme
    // const startDate = new Date(holiday.startDate); // Not used directly in activateHolidayTheme
    // const endDate = new Date(holiday.endDate); // Not used directly in activateHolidayTheme

    updateThemeMutation.mutate({
      theme_name: holiday.id,
      holiday_mode: true,
      holiday_type: holiday.id.replace('holiday_', ''),
      holiday_start_date: holiday.startDate,
      holiday_end_date: holiday.endDate,
      background_color: holiday.colors.primary,
      accent_color: holiday.colors.accent,
      gradient_enabled: true,
      animations_enabled: true
    });
  };

  const activateAIDetection = async () => {
    try {
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Current date: ${today.toDateString()}, month: ${currentMonth}

Analyze if there's a holiday coming up in the next 7 days that warrants a theme change.

Available holidays:
${HOLIDAY_THEMES.map(h => `${h.name} (${h.startDate} to ${h.endDate})`).join('\n')}

Should we activate a holiday theme? If yes, which one?

Respond with JSON:
{
  "shouldActivate": true/false,
  "holidayId": "holiday_christmas" or null,
  "reason": "explanation"
}`,
        response_json_schema: {
          type: "object",
          properties: {
            shouldActivate: { type: "boolean" },
            holidayId: { type: "string" },
            reason: { type: "string" }
          }
        }
      });

      if (response.shouldActivate && response.holidayId) {
        const holiday = HOLIDAY_THEMES.find(h => h.id === response.holidayId);
        if (holiday) {
          await activateHolidayTheme(holiday);
          alert(`🎉 AI activated ${holiday.name} theme!\n\n${response.reason}`);
        }
      } else {
        alert(`✅ No holiday theme needed right now.\n\n${response.reason}`);
      }
    } catch (error) {
      console.error('AI detection error:', error);
      alert('❌ AI detection failed. Try again later.');
    }
  };

  const turnOffHolidays = () => {
    updateThemeMutation.mutate({
      theme_name: 'default',
      holiday_mode: false,
      holiday_type: 'none',
      background_color: darkMode ? '#111827' : '#0A1931',
      accent_color: '#00FFFF',
      gradient_enabled: !darkMode,
      animations_enabled: true
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-12 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-gray-900 to-gray-800'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Palette className="w-10 h-10 text-purple-400" />
            Theme Manager
          </h1>
          <p className="text-gray-400">Customize website appearance and branding</p>
        </div>

        {/* Dark Mode Toggle */}
        <Card className={`p-8 mb-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-800 border-gray-700'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                {darkMode ? '🌙' : '☀️'} Background Theme
              </h2>
              <p className="text-gray-400">
                Toggle between light gradient and dark solid background
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={toggleDarkMode}
                className={`px-8 py-4 text-lg font-bold ${
                  darkMode 
                    ? 'bg-gray-900 hover:bg-black border-2 border-gray-700' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                }`}
              >
                {darkMode ? '🌙 Dark Mode' : '☀️ Light Gradient'}
              </Button>
              <Badge className={darkMode ? 'bg-gray-700' : 'bg-blue-600'}>
                {darkMode ? 'DARK' : 'LIGHT'}
              </Badge>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Card className="p-6 bg-gradient-to-br from-blue-600 to-purple-600 border-none text-white">
              <h3 className="font-bold mb-2">☀️ Light Gradient Mode</h3>
              <ul className="text-sm space-y-1">
                <li>• Vibrant blue-purple gradients</li>
                <li>• Energetic and modern</li>
                <li>• Best for daytime use</li>
                <li>• More visual contrast</li>
              </ul>
            </Card>
            <Card className="p-6 bg-gray-900 border-gray-700 text-white">
              <h3 className="font-bold mb-2">🌙 Dark Solid Mode</h3>
              <ul className="text-sm space-y-1">
                <li>• Deep black backgrounds</li>
                <li>• Easy on the eyes</li>
                <li>• Perfect for night use</li>
                <li>• Reduces eye strain</li>
              </ul>
            </Card>
          </div>
        </Card>

        {/* NEW: Admin Quick Links Opacity Toggle */}
        <Card className={`p-8 mb-8 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-800 border-gray-700'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                {quickLinksOpacity === 'colored' ? '🎨' : '✨'} Admin Quick Links Style
              </h2>
              <p className="text-gray-400 mb-4">
                Toggle between solid colored buttons or transparent glass effect
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={toggleQuickLinksOpacity}
                className={`px-8 py-4 text-lg font-bold ${
                  quickLinksOpacity === 'colored' 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                    : 'bg-white/20 backdrop-blur-xl border-2 border-white/30 hover:bg-white/30'
                }`}
              >
                {quickLinksOpacity === 'colored' ? '🎨 Colored Mode' : '✨ Transparent Mode'}
              </Button>
              <Badge className={quickLinksOpacity === 'colored' ? 'bg-blue-600' : 'bg-white/30 text-white backdrop-blur-md'}>
                {quickLinksOpacity === 'colored' ? 'COLORED' : 'TRANSPARENT'}
              </Badge>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <Card className="p-6 bg-gradient-to-br from-blue-600 to-purple-600 border-none text-white">
              <h3 className="font-bold mb-2">🎨 Colored Mode</h3>
              <ul className="text-sm space-y-1">
                <li>• Vibrant color-coded buttons</li>
                <li>• High contrast and visibility</li>
                <li>• Easy to distinguish categories</li>
                <li>• Default professional look</li>
              </ul>
              <div className="mt-4 space-y-2">
                <div className="h-8 bg-yellow-600 rounded flex items-center px-3 text-xs font-bold">
                  Super Admin
                </div>
                <div className="h-8 bg-orange-600 rounded flex items-center px-3 text-xs font-bold">
                  Manage Cars
                </div>
                <div className="h-8 bg-cyan-600 rounded flex items-center px-3 text-xs font-bold">
                  Employee Info
                </div>
              </div>
            </Card>
            
            <Card className="p-6 bg-gray-900 border-gray-700 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
              <div className="relative">
                <h3 className="font-bold mb-2">✨ Transparent Mode</h3>
                <ul className="text-sm space-y-1">
                  <li>• Sleek glass morphism effect</li>
                  <li>• Modern minimalist design</li>
                  <li>• Less visual clutter</li>
                  <li>• Premium aesthetic</li>
                </ul>
                <div className="mt-4 space-y-2">
                  <div className="h-8 bg-white/20 backdrop-blur-md border border-white/30 rounded flex items-center px-3 text-xs font-bold">
                    Super Admin
                  </div>
                  <div className="h-8 bg-white/20 backdrop-blur-md border border-white/30 rounded flex items-center px-3 text-xs font-bold">
                    Manage Cars
                  </div>
                  <div className="h-8 bg-white/20 backdrop-blur-md border border-white/30 rounded flex items-center px-3 text-xs font-bold">
                    Employee Info
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Card>

        {/* Logo Visibility Controls - ONLY TOP LOGO NOW */}
        <Card className="p-8 mb-8 bg-gray-800 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Eye className="w-6 h-6 text-blue-400" />
            Brand Logo Visibility
          </h2>
          <p className="text-gray-400 mb-6">
            Toggle the floating STOCRX logo (top right, clickable)
          </p>

          <div className="space-y-6">
            {/* Top Logo Toggle */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border border-blue-700 rounded-lg">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-xl opacity-30"></div>
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fedac268a06fe88d74977e/0f2d8e915_IMG_3409.png"
                    alt="STOCRX"
                    className="relative h-16 w-auto opacity-40"
                    style={{
                      filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))'
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Top Right Logo (Clickable)</h3>
                  <p className="text-sm text-gray-300 mb-1">
                    Floating logo in the top right corner - click to open PWA install guide
                  </p>
                  <p className="text-xs text-gray-400">
                    Transparent with blue glow • Hover shows "Install App" tooltip
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Switch
                  checked={showTopLogo}
                  onCheckedChange={toggleTopLogo}
                  className="data-[state=checked]:bg-blue-600"
                />
                <Badge className={showTopLogo ? 'bg-green-600' : 'bg-gray-600'}>
                  {showTopLogo ? 'Visible' : 'Hidden'}
                </Badge>
              </div>
            </div>
          </div>

          <Alert className="mt-6 bg-blue-900/30 border-blue-700">
            <Eye className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-200">
              <strong>Interactive Branding:</strong> The top logo is clickable and directs users to the PWA installation guide. 
              Hover reveals an "Install App" tooltip. Bottom symbol removed as requested.
            </AlertDescription>
          </Alert>
        </Card>

        {/* Current Theme Status */}
        <Card className="p-8 mb-8 bg-gray-800 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">Current Theme Status</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-400 mb-2">Active Theme</p>
              <Badge className="text-lg px-4 py-2" style={{ backgroundColor: currentTheme?.background_color }}>
                {selectedTheme === 'default' ? 'Default STOCRX' : HOLIDAY_THEMES.find(h => h.id === selectedTheme)?.name || selectedTheme}
              </Badge>
            </div>
            <div>
              <p className="text-gray-400 mb-2">Holiday Mode</p>
              <Badge className={currentTheme?.holiday_mode ? 'bg-green-600 text-lg px-4 py-2' : 'bg-gray-600 text-lg px-4 py-2'}>
                {currentTheme?.holiday_mode ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            <div>
              <p className="text-gray-400 mb-2">Gradient Effects</p>
              <Badge className={currentTheme?.gradient_enabled ? 'bg-blue-600 text-lg px-4 py-2' : 'bg-gray-600 text-lg px-4 py-2'}>
                {currentTheme?.gradient_enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div>
              <p className="text-gray-400 mb-2">Animations</p>
              <Badge className={currentTheme?.animations_enabled ? 'bg-purple-600 text-lg px-4 py-2' : 'bg-gray-600 text-lg px-4 py-2'}>
                {currentTheme?.animations_enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Holiday Themes */}
        <Card className="p-8 mb-8 bg-gray-800 border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-green-400" />
              Holiday Themes
            </h2>
            <Button
              onClick={turnOffHolidays}
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-900/30"
            >
              Turn Off Holiday Themes
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {HOLIDAY_THEMES.map((holiday) => (
              <Card
                key={holiday.id}
                className="p-4 cursor-pointer hover:scale-105 transition-transform"
                style={{
                  background: `linear-gradient(135deg, ${holiday.colors.primary}20, ${holiday.colors.accent}20)`,
                  borderColor: getHolidayColor(holiday.id)
                }}
                onClick={() => activateHolidayTheme(holiday)}
              >
                <div className="text-center">
                  <div className="text-4xl mb-2">{holiday.icon}</div>
                  <h3 className="font-bold text-white mb-2">{holiday.name}</h3>
                  <p className="text-xs text-gray-300 mb-3">
                    {holiday.startDate} to {holiday.endDate}
                  </p>
                  <Badge style={{ backgroundColor: holiday.colors.primary }}>
                    Activate
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* AI Theme Manager */}
        <Card className="p-8 bg-gradient-to-br from-purple-900 to-pink-900 border-purple-700">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            AI Theme Manager
          </h2>
          <p className="text-white/90 mb-6">
            Let AI automatically detect and activate holiday themes based on the current date.
          </p>
          <Button
            onClick={activateAIDetection}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Run AI Auto-Detect
          </Button>
        </Card>
      </div>
    </div>
  );
}
