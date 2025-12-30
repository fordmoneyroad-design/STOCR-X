import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  LayoutDashboard, Menu, Eye, EyeOff, Upload, 
  ArrowLeft, Image as ImageIcon, Settings, CheckCircle
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function InterfacePreferences() {
  const [user, setUser] = useState(null);
  const [showAdminQuickLinks, setShowAdminQuickLinks] = useState(true);
  const [showTopLogo, setShowTopLogo] = useState(true);
  const [menuStyle, setMenuStyle] = useState('hamburger'); // 'hamburger' or 'custom_image'
  const [customMenuImage, setCustomMenuImage] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.email !== "fordmoneyroad@gmail.com" && currentUser.role !== 'admin') {
          window.location.href = '/';
          return;
        }
        setUser(currentUser);
      } catch (err) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();

    // Load saved preferences
    const quickLinks = localStorage.getItem('stocrx-show-admin-quick-links');
    if (quickLinks !== null) setShowAdminQuickLinks(quickLinks === 'true');

    const topLogo = localStorage.getItem('stocrx-show-top-logo');
    if (topLogo !== null) setShowTopLogo(topLogo === 'true');

    const savedMenuStyle = localStorage.getItem('stocrx-menu-style');
    if (savedMenuStyle) setMenuStyle(savedMenuStyle);

    const savedMenuImage = localStorage.getItem('stocrx-custom-menu-image');
    if (savedMenuImage) setCustomMenuImage(savedMenuImage);
  }, []);

  const toggleQuickLinks = () => {
    const newValue = !showAdminQuickLinks;
    setShowAdminQuickLinks(newValue);
    localStorage.setItem('stocrx-show-admin-quick-links', String(newValue));
    window.location.reload(); // Reload to apply changes
  };

  const toggleTopLogo = () => {
    const newValue = !showTopLogo;
    setShowTopLogo(newValue);
    localStorage.setItem('stocrx-show-top-logo', String(newValue));
    window.location.reload();
  };

  const handleMenuStyleChange = (style) => {
    setMenuStyle(style);
    localStorage.setItem('stocrx-menu-style', style);
    alert(`✅ Menu style changed to ${style === 'hamburger' ? '3-line hamburger' : 'custom image'}`);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setCustomMenuImage(file_url);
      localStorage.setItem('stocrx-custom-menu-image', file_url);
      alert("✅ Custom menu image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("❌ Failed to upload image. Please try again.");
    }
    setUploading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <LayoutDashboard className="w-10 h-10 text-blue-400" />
            Interface Preferences
          </h1>
          <p className="text-gray-400">Customize your admin interface layout and appearance</p>
        </div>

        <Alert className="mb-8 bg-blue-900/30 border-blue-700">
          <Settings className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-200">
            <strong>Admin Only:</strong> These settings control how your admin interface looks. Changes apply immediately and persist across sessions.
          </AlertDescription>
        </Alert>

        {/* Admin Quick Links Toggle */}
        <Card className="p-8 mb-8 bg-gray-800 border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {showAdminQuickLinks ? <Eye className="w-6 h-6 text-green-400" /> : <EyeOff className="w-6 h-6 text-gray-500" />}
                <h2 className="text-2xl font-bold text-white">Admin Quick Links Panel</h2>
              </div>
              <p className="text-gray-400 mb-4">
                Show a persistent panel on the right side with quick access to frequently used admin pages
              </p>
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-300 mb-2">📌 <strong>What's included:</strong></p>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Super Admin Dashboard</li>
                  <li>• Manage Cars</li>
                  <li>• Manager Dashboard</li>
                  <li>• Settings</li>
                  <li>• Payroll</li>
                  <li>• Call Center Dispatch</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
              <Switch
                checked={showAdminQuickLinks}
                onCheckedChange={toggleQuickLinks}
                className="data-[state=checked]:bg-green-600"
              />
              <Badge className={showAdminQuickLinks ? 'bg-green-600' : 'bg-gray-600'}>
                {showAdminQuickLinks ? 'Visible' : 'Hidden'}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Top Logo Toggle */}
        <Card className="p-8 mb-8 bg-gray-800 border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {showTopLogo ? <Eye className="w-6 h-6 text-blue-400" /> : <EyeOff className="w-6 h-6 text-gray-500" />}
                <h2 className="text-2xl font-bold text-white">Top Right Logo</h2>
              </div>
              <p className="text-gray-400 mb-4">
                Display the clickable STOCRX logo in the top right corner (links to PWA install guide)
              </p>
            </div>
            <div className="flex flex-col items-end gap-3">
              <Switch
                checked={showTopLogo}
                onCheckedChange={toggleTopLogo}
                className="data-[state=checked]:bg-blue-600"
              />
              <Badge className={showTopLogo ? 'bg-blue-600' : 'bg-gray-600'}>
                {showTopLogo ? 'Visible' : 'Hidden'}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Menu Style Selection */}
        <Card className="p-8 bg-gray-800 border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <Menu className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Admin Menu Style</h2>
          </div>
          <p className="text-gray-400 mb-6">
            Choose between a standard 3-line hamburger menu or upload a custom image icon
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Hamburger Menu Option */}
            <button
              onClick={() => handleMenuStyleChange('hamburger')}
              className={`p-6 rounded-xl border-2 transition-all ${
                menuStyle === 'hamburger'
                  ? 'border-purple-600 bg-purple-900/30'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-center mb-4">
                <Menu className={`w-16 h-16 ${menuStyle === 'hamburger' ? 'text-purple-400' : 'text-gray-500'}`} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3-Line Hamburger</h3>
              <p className="text-sm text-gray-400">Standard menu icon with categorized dropdowns</p>
              {menuStyle === 'hamburger' && (
                <Badge className="mt-3 bg-purple-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
            </button>

            {/* Custom Image Option */}
            <button
              onClick={() => handleMenuStyleChange('custom_image')}
              className={`p-6 rounded-xl border-2 transition-all ${
                menuStyle === 'custom_image'
                  ? 'border-purple-600 bg-purple-900/30'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-center mb-4">
                {customMenuImage ? (
                  <img src={customMenuImage} alt="Custom Menu" className="w-16 h-16 object-cover rounded-lg" />
                ) : (
                  <ImageIcon className={`w-16 h-16 ${menuStyle === 'custom_image' ? 'text-purple-400' : 'text-gray-500'}`} />
                )}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Custom Image</h3>
              <p className="text-sm text-gray-400">Upload your own icon for the admin menu</p>
              {menuStyle === 'custom_image' && (
                <Badge className="mt-3 bg-purple-600">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              )}
            </button>
          </div>

          {/* Image Upload Section */}
          {menuStyle === 'custom_image' && (
            <div className="mt-8 p-6 bg-gray-900 rounded-lg border border-gray-700">
              <Label htmlFor="menu-image" className="text-white mb-4 block">
                Upload Custom Menu Icon
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="menu-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="bg-gray-800 border-gray-600 text-white"
                />
                <Button
                  disabled={uploading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
              {customMenuImage && (
                <div className="mt-4">
                  <p className="text-green-400 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Custom icon uploaded successfully
                  </p>
                  <div className="mt-2 p-3 bg-gray-800 rounded-lg inline-block">
                    <img src={customMenuImage} alt="Preview" className="h-12 w-12 object-cover rounded" />
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-4">
                Recommended: 64x64px PNG with transparent background
              </p>
            </div>
          )}
        </Card>

        {/* Preview Section */}
        <Card className="p-8 mt-8 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-700">
          <h3 className="text-xl font-bold text-white mb-4">✨ Preview Changes</h3>
          <p className="text-gray-300 mb-6">
            Your changes have been saved! Refresh the page to see them applied throughout the admin interface.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Refresh Page to Apply
          </Button>
        </Card>
      </div>
    </div>
  );
}