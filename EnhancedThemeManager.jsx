import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Palette, Sparkles, Globe, Database, Search, Plus, Edit
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SuperAdminQuickActions from "../components/admin/SuperAdminQuickActions";

const SUPER_ADMIN_EMAIL = "fordmoneyroad@gmail.com";

export default function EnhancedThemeManager() {
  const [user, setUser] = useState(null);
  const [showAIAssistant, setShowAIAssistant] = useState(true);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

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

  const { data: metafields } = useQuery({
    queryKey: ['metafields'],
    queryFn: () => base44.entities.Metafield.list("-created_date", 50),
    initialData: []
  });

  const handleAIAssist = async () => {
    if (!aiPrompt.trim()) return;

    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a STOCRX theme customization assistant. Help with this request:\n\n${aiPrompt}\n\nProvide specific, actionable guidance for customizing the STOCRX platform theme, metafields, or translations.`,
        add_context_from_internet: false
      });
      setAiResponse(response);
    } catch (error) {
      console.error("AI error:", error);
      alert("❌ AI assistant failed");
    } finally {
      setGenerating(false);
    }
  };

  const LANGUAGES = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ar", name: "العربية", flag: "🇸🇦" }
  ];

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
          onClick={() => window.history.back()}
          className="text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Palette className="w-10 h-10 text-purple-400" />
            Enhanced Theme Manager
          </h1>
          <p className="text-gray-400">Customize themes, metafields, and translations</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* AI Assistant Sidebar */}
          {showAIAssistant && (
            <div className="lg:col-span-1">
              <Card className="p-6 bg-gradient-to-br from-purple-900 to-indigo-900 border-purple-700 sticky top-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-xl font-bold text-white">AI Assistant</h3>
                </div>

                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ask me anything about themes, metafields, or translations..."
                  className="bg-purple-800 border-purple-600 text-white h-32 mb-4"
                />

                <Button
                  onClick={handleAIAssist}
                  disabled={generating || !aiPrompt.trim()}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold mb-4"
                >
                  {generating ? "Thinking..." : "Ask AI"}
                </Button>

                {aiResponse && (
                  <Card className="p-4 bg-white/10 backdrop-blur border-purple-500">
                    <p className="text-white text-sm whitespace-pre-line">{aiResponse}</p>
                  </Card>
                )}

                <div className="mt-6 space-y-2">
                  <p className="text-purple-200 text-sm font-semibold">Quick Actions:</p>
                  <Button
                    size="sm"
                    onClick={() => setAiPrompt("How do I add a custom metafield for vehicle specs?")}
                    className="w-full justify-start text-xs bg-purple-700 hover:bg-purple-600"
                  >
                    Add Vehicle Metafield
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setAiPrompt("How do I translate my website to Spanish?")}
                    className="w-full justify-start text-xs bg-purple-700 hover:bg-purple-600"
                  >
                    Translate Website
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setAiPrompt("Best practices for color swatches?")}
                    className="w-full justify-start text-xs bg-purple-700 hover:bg-purple-600"
                  >
                    Color Swatches
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <div className={showAIAssistant ? "lg:col-span-3" : "lg:col-span-4"}>
            <Tabs defaultValue="metafields">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-700">
                <TabsTrigger value="metafields">Metafields</TabsTrigger>
                <TabsTrigger value="translations">Translations</TabsTrigger>
                <TabsTrigger value="customizations">Customizations</TabsTrigger>
              </TabsList>

              {/* Metafields Tab */}
              <TabsContent value="metafields">
                <Card className="p-6 bg-gray-800 border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Database className="w-6 h-6 text-blue-400" />
                      Metafields & Metaobjects
                    </h2>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Metafield
                    </Button>
                  </div>

                  <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-bold text-white mb-3">What are Metafields?</h3>
                    <p className="text-blue-200 text-sm mb-4">
                      Metafields let you add specialized information to products, collections, customers, and more.
                    </p>
                    <div className="grid md:grid-cols-2 gap-3 text-sm text-blue-100">
                      <div>• Part numbers</div>
                      <div>• Color swatches</div>
                      <div>• Launch dates</div>
                      <div>• Related products</div>
                      <div>• Blog post summaries</div>
                      <div>• Files for download</div>
                      <div>• Lists of ingredients</div>
                      <div>• Vehicle specifications</div>
                    </div>
                  </div>

                  {metafields.length === 0 ? (
                    <p className="text-gray-400 text-center py-12">No metafields configured yet</p>
                  ) : (
                    <div className="space-y-3">
                      {metafields.map((field) => (
                        <Card key={field.id} className="p-4 bg-gray-700 border-gray-600">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-bold text-white">{field.display_name || field.key}</p>
                              <p className="text-sm text-gray-400">
                                {field.namespace}.{field.key} • {field.resource_type}
                              </p>
                            </div>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>

              {/* Translations Tab */}
              <TabsContent value="translations">
                <Card className="p-6 bg-gray-800 border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Globe className="w-6 h-6 text-green-400" />
                      Store Translations
                    </h2>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Language
                    </Button>
                  </div>

                  <div className="bg-green-900/30 border border-green-700 rounded-lg p-6 mb-6">
                    <h3 className="text-lg font-bold text-white mb-3">Translate Your Store</h3>
                    <p className="text-green-200 text-sm">
                      Cater to global audiences by translating your store content into multiple languages.
                      Reach customers worldwide and increase conversions!
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    {LANGUAGES.map((lang) => (
                      <Card
                        key={lang.code}
                        onClick={() => setSelectedLanguage(lang.code)}
                        className={`p-6 cursor-pointer transition-all ${
                          selectedLanguage === lang.code
                            ? 'bg-green-900 border-green-600'
                            : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-2">{lang.flag}</div>
                          <p className="font-bold text-white">{lang.name}</p>
                          <p className="text-xs text-gray-400">{lang.code.toUpperCase()}</p>
                          {selectedLanguage === lang.code && (
                            <Badge className="mt-2 bg-green-600">Selected</Badge>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              </TabsContent>

              {/* Customizations Tab */}
              <TabsContent value="customizations">
                <Card className="p-6 bg-gray-800 border-gray-700">
                  <h2 className="text-2xl font-bold text-white mb-6">Theme Customizations</h2>
                  <p className="text-gray-400 mb-6">
                    Customize colors, fonts, layout, and more. Use the AI assistant for guidance!
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-6 bg-gray-700 border-gray-600">
                      <h3 className="font-bold text-white mb-3">Colors</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded"></div>
                          <span className="text-gray-300">Primary</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-600 rounded"></div>
                          <span className="text-gray-300">Secondary</span>
                        </div>
                      </div>
                    </Card>
                    <Card className="p-6 bg-gray-700 border-gray-600">
                      <h3 className="font-bold text-white mb-3">Typography</h3>
                      <div className="space-y-2 text-sm text-gray-300">
                        <p>Heading: Inter</p>
                        <p>Body: System UI</p>
                      </div>
                    </Card>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Language Selector at Bottom */}
        <Card className="p-6 bg-gray-800 border-gray-700 mt-8">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            Website Language
          </h3>
          <div className="flex flex-wrap gap-3">
            {LANGUAGES.map((lang) => (
              <Button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={selectedLanguage === lang.code ? 'bg-blue-600' : 'bg-gray-700'}
              >
                {lang.flag} {lang.name}
              </Button>
            ))}
          </div>
        </Card>

        <SuperAdminQuickActions />
      </div>
    </div>
  );
}