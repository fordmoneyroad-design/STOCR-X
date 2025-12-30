import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft, Palette, Upload, Image, CheckCircle, Sparkles,
  Facebook, Instagram, Twitter, Linkedin, Youtube, Music
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function Brand() {
  const [user, setUser] = useState(null);
  const [brandData, setBrandData] = useState({
    default_logo: "",
    square_logo: "",
    cover_image: "",
    primary_color: "#3B82F6",
    secondary_color: "#8B5CF6",
    slogan: "",
    short_description: "",
    social_links: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
      youtube: "",
      tiktok: ""
    }
  });
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [showAiPanel, setShowAiPanel] = useState(true);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.email !== SUPER_ADMIN_EMAIL && currentUser.role !== 'admin') {
          window.location.href = '/';
          return;
        }
        setUser(currentUser);
      } catch (err) {
        base44.auth.redirectToLogin();
      }
    };
    checkAuth();
  }, []);

  const { data: brandSettings } = useQuery({
    queryKey: ['brand-settings'],
    queryFn: async () => {
      const settings = await base44.entities.BrandSettings.filter({ is_active: true });
      if (settings.length > 0) {
        setBrandData(settings[0]);
        return settings[0];
      }
      return null;
    },
    enabled: !!user
  });

  const saveBrandMutation = useMutation({
    mutationFn: async () => {
      if (brandSettings?.id) {
        return await base44.entities.BrandSettings.update(brandSettings.id, brandData);
      }
      return await base44.entities.BrandSettings.create({ ...brandData, is_active: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['brand-settings']);
      alert("✅ Brand settings saved!");
    }
  });

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setBrandData({ ...brandData, [field]: result.file_url });
    } catch (error) {
      alert("❌ Upload failed. Try again.");
    }
  };

  const getAiSuggestion = async (type) => {
    setAiSuggestion("🤖 AI is thinking...");
    try {
      const prompt = type === 'slogan' 
        ? "Create a catchy, professional slogan for STOCRX, a subscription-to-own car rental platform. Keep it under 10 words."
        : "Write a compelling 2-sentence description of STOCRX: a platform where customers subscribe to cars and build ownership over time.";

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setAiSuggestion(response);
    } catch (error) {
      setAiSuggestion("❌ AI suggestion failed. Try again.");
    }
  };

  const applySuggestion = (field) => {
    setBrandData({ ...brandData, [field]: aiSuggestion });
    setAiSuggestion("");
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Settings"))}
          className="text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Settings
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Palette className="w-10 h-10 text-purple-400" />
                Brand Assets
              </h1>
              <p className="text-gray-400">Manage your brand identity across all channels</p>
            </div>

            {/* ESSENTIAL Section */}
            <Card className="p-8 bg-gray-800 border-gray-700">
              <div className="mb-6">
                <Badge className="bg-blue-600 text-white mb-3">ESSENTIAL</Badge>
                <p className="text-gray-400 text-sm">Common brand assets used across apps and channels</p>
              </div>

              {/* Default Logo */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Image className="w-5 h-5 text-blue-400" />
                  Default Logo
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Used for most common logo applications
                </p>
                {brandData.default_logo && (
                  <img 
                    src={brandData.default_logo} 
                    alt="Default Logo" 
                    className="w-48 h-auto mb-4 bg-white p-4 rounded"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'default_logo')}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
                <p className="text-xs text-gray-500 mt-2">
                  HEIC, WEBP, SVG, PNG, or JPG. Recommended width: 512 pixels minimum.
                </p>
              </div>

              {/* Square Logo */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-white mb-3">Square Logo</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Used by some social media channels. May be cropped into a circle.
                </p>
                {brandData.square_logo && (
                  <img 
                    src={brandData.square_logo} 
                    alt="Square Logo" 
                    className="w-32 h-32 mb-4 bg-white p-4 rounded"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'square_logo')}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                />
                <p className="text-xs text-gray-500 mt-2">
                  HEIC, WEBP, SVG, PNG, or JPG. Recommended: 512×512 pixels minimum.
                </p>
              </div>

              {/* Colors */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-400" />
                  Colors
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Primary</label>
                    <p className="text-xs text-gray-500 mb-3">
                      Brand colors that appear on your store, social media, and more
                    </p>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={brandData.primary_color}
                        onChange={(e) => setBrandData({...brandData, primary_color: e.target.value})}
                        className="w-16 h-16 rounded cursor-pointer"
                      />
                      <Input
                        value={brandData.primary_color}
                        onChange={(e) => setBrandData({...brandData, primary_color: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-300 text-sm mb-2 block">Secondary</label>
                    <p className="text-xs text-gray-500 mb-3">
                      Supporting colors used for accents and additional detail
                    </p>
                    <div className="flex gap-3 items-center">
                      <input
                        type="color"
                        value={brandData.secondary_color}
                        onChange={(e) => setBrandData({...brandData, secondary_color: e.target.value})}
                        className="w-16 h-16 rounded cursor-pointer"
                      />
                      <Input
                        value={brandData.secondary_color}
                        onChange={(e) => setBrandData({...brandData, secondary_color: e.target.value})}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* ADDITIONAL Section */}
            <Card className="p-8 bg-gray-800 border-gray-700">
              <div className="mb-6">
                <Badge className="bg-purple-600 text-white mb-3">ADDITIONAL</Badge>
                <p className="text-gray-400 text-sm">Used by some apps and social media channels</p>
              </div>

              {/* Cover Image */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-white mb-3">Cover Image</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Key image that shows off your brand in profile pages and apps
                </p>
                {brandData.cover_image && (
                  <img 
                    src={brandData.cover_image} 
                    alt="Cover" 
                    className="w-full h-48 object-cover mb-4 rounded"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'cover_image')}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700"
                />
                <p className="text-xs text-gray-500 mt-2">
                  HEIC, WEBP, SVG, PNG, or JPG. Recommended: 1920×1080 pixels minimum.
                </p>
              </div>

              {/* Slogan */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-white mb-3">Slogan</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Brand statement or tagline often used along with your logo
                </p>
                <Input
                  value={brandData.slogan}
                  onChange={(e) => setBrandData({...brandData, slogan: e.target.value})}
                  placeholder="Subscribe to Own"
                  className="bg-gray-700 border-gray-600 text-white mb-2"
                />
                <Button
                  size="sm"
                  onClick={() => getAiSuggestion('slogan')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get AI Suggestion
                </Button>
              </div>

              {/* Short Description */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-white mb-3">Short Description</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Description of your business often used in bios and listings
                </p>
                <Textarea
                  value={brandData.short_description}
                  onChange={(e) => setBrandData({...brandData, short_description: e.target.value})}
                  placeholder="STOCRX offers flexible car subscriptions that build ownership over time..."
                  className="bg-gray-700 border-gray-600 text-white h-24 mb-2"
                />
                <Button
                  size="sm"
                  onClick={() => getAiSuggestion('description')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get AI Suggestion
                </Button>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-lg font-bold text-white mb-3">Social Links</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Social links for your business, often used in the theme footer
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Facebook className="w-5 h-5 text-blue-500" />
                    <Input
                      value={brandData.social_links?.facebook || ""}
                      onChange={(e) => setBrandData({
                        ...brandData, 
                        social_links: {...brandData.social_links, facebook: e.target.value}
                      })}
                      placeholder="https://facebook.com/stocrx"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Instagram className="w-5 h-5 text-pink-500" />
                    <Input
                      value={brandData.social_links?.instagram || ""}
                      onChange={(e) => setBrandData({
                        ...brandData, 
                        social_links: {...brandData.social_links, instagram: e.target.value}
                      })}
                      placeholder="https://instagram.com/stocrx"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Twitter className="w-5 h-5 text-blue-400" />
                    <Input
                      value={brandData.social_links?.twitter || ""}
                      onChange={(e) => setBrandData({
                        ...brandData, 
                        social_links: {...brandData.social_links, twitter: e.target.value}
                      })}
                      placeholder="https://twitter.com/stocrx"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Linkedin className="w-5 h-5 text-blue-600" />
                    <Input
                      value={brandData.social_links?.linkedin || ""}
                      onChange={(e) => setBrandData({
                        ...brandData, 
                        social_links: {...brandData.social_links, linkedin: e.target.value}
                      })}
                      placeholder="https://linkedin.com/company/stocrx"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Youtube className="w-5 h-5 text-red-500" />
                    <Input
                      value={brandData.social_links?.youtube || ""}
                      onChange={(e) => setBrandData({
                        ...brandData, 
                        social_links: {...brandData.social_links, youtube: e.target.value}
                      })}
                      placeholder="https://youtube.com/@stocrx"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Music className="w-5 h-5 text-gray-400" />
                    <Input
                      value={brandData.social_links?.tiktok || ""}
                      onChange={(e) => setBrandData({
                        ...brandData, 
                        social_links: {...brandData.social_links, tiktok: e.target.value}
                      })}
                      placeholder="https://tiktok.com/@stocrx"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Save Button */}
            <Button
              onClick={() => saveBrandMutation.mutate()}
              disabled={saveBrandMutation.isLoading}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg font-bold"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              {saveBrandMutation.isLoading ? "Saving..." : "Save Brand Settings"}
            </Button>
          </div>

          {/* AI Assistant Sidebar */}
          {showAiPanel && (
            <div className="lg:col-span-1">
              <Card className="p-6 bg-gradient-to-br from-purple-900 to-pink-900 border-purple-700 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    AI Brand Assistant
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowAiPanel(false)}
                    className="text-white"
                  >
                    ×
                  </Button>
                </div>

                <div className="space-y-4">
                  {aiSuggestion && (
                    <Alert className="bg-white/10 border-white/20">
                      <AlertDescription className="text-white">
                        {aiSuggestion}
                        {aiSuggestion.includes('AI is thinking') ? null : (
                          <div className="mt-3 space-x-2">
                            <Button
                              size="sm"
                              onClick={() => applySuggestion('slogan')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Apply to Slogan
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => applySuggestion('short_description')}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              Apply to Description
                            </Button>
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="text-white/90 text-sm space-y-3">
                    <p className="font-semibold">💡 Quick Tips:</p>
                    <ul className="space-y-2 text-xs">
                      <li>• Use high-resolution logos (512px minimum)</li>
                      <li>• Keep slogan under 10 words</li>
                      <li>• Use colors that contrast well</li>
                      <li>• Cover image should be 1920×1080</li>
                      <li>• Test logos on dark & light backgrounds</li>
                    </ul>
                  </div>

                  <div className="bg-white/10 p-4 rounded-lg">
                    <p className="text-white text-sm mb-3">
                      <strong>Need a logo?</strong>
                    </p>
                    <a
                      href="https://hatchful.shopify.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-blue-200 text-sm underline"
                    >
                      Create one with Hatchful →
                    </a>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}