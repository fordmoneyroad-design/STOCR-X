import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Smartphone, Download, Share2, PlusSquare, CheckCircle, Home, Chrome } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PWAInstallGuide() {
  const navigate = useNavigate();
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const iOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const android = /android/i.test(userAgent);
    
    setIsIOS(iOS);
    setIsAndroid(android);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fedac268a06fe88d74977e/0f2d8e915_IMG_3409.png"
              alt="STOCRX"
              className="h-20 w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Install STOCRX App</h1>
          <p className="text-xl text-gray-400">
            Add to your home screen - No app store required!
          </p>
        </div>

        {/* Device Detection Banner */}
        <Card className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 border-none mb-8">
          <div className="flex items-center justify-center gap-3 text-white">
            <Smartphone className="w-6 h-6" />
            <p className="font-bold text-lg">
              {isIOS && "📱 iPhone/iPad Detected - Follow iOS Instructions"}
              {isAndroid && "🤖 Android Detected - Follow Android Instructions"}
              {!isIOS && !isAndroid && "💻 Desktop Detected - Best viewed on mobile"}
            </p>
          </div>
        </Card>

        {/* iOS Instructions */}
        {(isIOS || !isAndroid) && (
          <div className="space-y-6 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
                <Smartphone className="w-5 h-5 mr-2" />
                iPhone / iPad Instructions
              </Badge>
            </div>

            {/* Step 1 */}
            <Card className="overflow-hidden bg-gradient-to-br from-blue-900 to-indigo-900 border-blue-700">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl font-bold text-white">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-4">Tap the Share Button</h3>
                    <p className="text-blue-100 mb-6">
                      Look for the <strong>Share icon</strong> at the bottom of Safari. 
                      It looks like a square with an arrow pointing up ⬆️
                    </p>
                  </div>
                </div>
                
                {/* Visual Demo */}
                <Card className="p-8 bg-white/95 backdrop-blur">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4 font-semibold">Safari Share Button Location:</p>
                    <div className="relative mx-auto" style={{ maxWidth: '300px' }}>
                      {/* Phone Frame */}
                      <div className="border-8 border-gray-900 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="bg-gray-100 h-12 flex items-center justify-center border-b border-gray-300">
                          <div className="text-xs text-gray-600">stocrx.com</div>
                        </div>
                        <div className="bg-white h-64 flex items-center justify-center text-gray-400">
                          STOCRX Website
                        </div>
                        {/* Bottom Bar with Share Button */}
                        <div className="bg-gray-100 h-16 flex items-center justify-around border-t border-gray-300">
                          <ArrowLeft className="w-6 h-6 text-blue-600" />
                          <div className="relative">
                            <Share2 className="w-8 h-8 text-blue-600 animate-bounce" />
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                              Tap Here! 👆
                            </div>
                          </div>
                          <Home className="w-6 h-6 text-gray-600" />
                          <div className="flex gap-1">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>

            {/* Step 2 */}
            <Card className="overflow-hidden bg-gradient-to-br from-purple-900 to-pink-900 border-purple-700">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl font-bold text-white">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-4">Find "Add to Home Screen"</h3>
                    <p className="text-purple-100 mb-6">
                      Scroll down in the share menu and tap <strong>"Add to Home Screen"</strong> with the + icon
                    </p>
                  </div>
                </div>

                {/* Visual Demo */}
                <Card className="p-8 bg-white/95 backdrop-blur">
                  <div className="space-y-3">
                    <p className="text-gray-600 mb-4 font-semibold text-center">Share Menu Options:</p>
                    <div className="space-y-2">
                      <div className="p-3 bg-gray-100 rounded-lg flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                        <span className="text-gray-500">Messages</span>
                      </div>
                      <div className="p-3 bg-gray-100 rounded-lg flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                        <span className="text-gray-500">Mail</span>
                      </div>
                      <div className="p-3 bg-gray-100 rounded-lg flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                        <span className="text-gray-500">Copy</span>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center gap-3 border-4 border-yellow-400 animate-pulse">
                        <PlusSquare className="w-8 h-8 text-white" />
                        <span className="text-white font-bold">Add to Home Screen</span>
                        <span className="ml-auto text-2xl">👈</span>
                      </div>
                      <div className="p-3 bg-gray-100 rounded-lg flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                        <span className="text-gray-500">Add to Reading List</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>

            {/* Step 3 */}
            <Card className="overflow-hidden bg-gradient-to-br from-green-900 to-teal-900 border-green-700">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl font-bold text-white">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-4">Tap "Add" to Install</h3>
                    <p className="text-green-100 mb-6">
                      Confirm by tapping <strong>"Add"</strong> in the top right corner
                    </p>
                  </div>
                </div>

                {/* Visual Demo */}
                <Card className="p-8 bg-white/95 backdrop-blur">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4 font-semibold">Confirmation Screen:</p>
                    <div className="relative mx-auto bg-gray-50 rounded-2xl p-6 border-4 border-gray-300" style={{ maxWidth: '300px' }}>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-gray-400">Cancel</span>
                        <span className="font-bold text-blue-600 text-xl animate-pulse">Add 👈</span>
                      </div>
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fedac268a06fe88d74977e/0f2d8e915_IMG_3409.png"
                          alt="STOCRX"
                          className="h-16 w-16 rounded-xl"
                        />
                        <div className="text-left">
                          <p className="font-bold text-gray-900">STOCRX</p>
                          <p className="text-sm text-gray-500">stocrx.com</p>
                        </div>
                      </div>
                      <div className="text-center py-8 text-gray-400">
                        <CheckCircle className="w-16 h-16 mx-auto mb-2 text-green-500" />
                        <p className="font-semibold">Ready to Install!</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>
          </div>
        )}

        {/* Android Instructions */}
        {(isAndroid || !isIOS) && (
          <div className="space-y-6 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                <Chrome className="w-5 h-5 mr-2" />
                Android Instructions
              </Badge>
            </div>

            {/* Step 1 */}
            <Card className="overflow-hidden bg-gradient-to-br from-blue-900 to-indigo-900 border-blue-700">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl font-bold text-white">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-4">Tap Menu (3 Dots)</h3>
                    <p className="text-blue-100 mb-6">
                      Tap the <strong>3-dot menu</strong> in the top right corner of Chrome ⋮
                    </p>
                  </div>
                </div>

                {/* Visual Demo */}
                <Card className="p-8 bg-white/95 backdrop-blur">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4 font-semibold">Chrome Menu Location:</p>
                    <div className="relative mx-auto" style={{ maxWidth: '300px' }}>
                      <div className="border-4 border-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="bg-white h-14 flex items-center justify-between px-4 border-b border-gray-300">
                          <div className="text-xs text-gray-600">stocrx.com</div>
                          <div className="relative">
                            <div className="flex flex-col gap-1 animate-bounce">
                              <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
                              <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
                              <div className="w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
                            </div>
                            <div className="absolute -bottom-8 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                              Tap Here! 👆
                            </div>
                          </div>
                        </div>
                        <div className="bg-white h-64 flex items-center justify-center text-gray-400">
                          STOCRX Website
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>

            {/* Step 2 */}
            <Card className="overflow-hidden bg-gradient-to-br from-purple-900 to-pink-900 border-purple-700">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl font-bold text-white">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-4">Select "Add to Home screen"</h3>
                    <p className="text-purple-100 mb-6">
                      Choose <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong> from the menu
                    </p>
                  </div>
                </div>

                {/* Visual Demo */}
                <Card className="p-8 bg-white/95 backdrop-blur">
                  <div className="space-y-3">
                    <p className="text-gray-600 mb-4 font-semibold text-center">Menu Options:</p>
                    <div className="space-y-2">
                      <div className="p-3 bg-gray-100 rounded-lg">New tab</div>
                      <div className="p-3 bg-gray-100 rounded-lg">New incognito tab</div>
                      <div className="p-3 bg-gray-100 rounded-lg">Bookmarks</div>
                      <div className="p-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center gap-3 border-4 border-yellow-400 animate-pulse">
                        <Home className="w-6 h-6 text-white" />
                        <span className="text-white font-bold">Add to Home screen</span>
                        <span className="ml-auto text-2xl">👈</span>
                      </div>
                      <div className="p-3 bg-gray-100 rounded-lg">Settings</div>
                      <div className="p-3 bg-gray-100 rounded-lg">History</div>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>

            {/* Step 3 */}
            <Card className="overflow-hidden bg-gradient-to-br from-green-900 to-teal-900 border-green-700">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl font-bold text-white">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-4">Tap "Install" or "Add"</h3>
                    <p className="text-green-100 mb-6">
                      Confirm installation and enjoy the app!
                    </p>
                  </div>
                </div>

                {/* Visual Demo */}
                <Card className="p-8 bg-white/95 backdrop-blur">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4 font-semibold">Installation Dialog:</p>
                    <div className="relative mx-auto bg-white rounded-2xl p-6 border-4 border-gray-300 shadow-xl" style={{ maxWidth: '300px' }}>
                      <div className="flex items-center gap-4 mb-6">
                        <img
                          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fedac268a06fe88d74977e/0f2d8e915_IMG_3409.png"
                          alt="STOCRX"
                          className="h-16 w-16 rounded-xl"
                        />
                        <div className="text-left">
                          <p className="font-bold text-gray-900">Install app?</p>
                          <p className="text-sm text-gray-500">STOCRX</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1">Cancel</Button>
                        <Button className="flex-1 bg-blue-600 hover:bg-blue-700 animate-pulse">
                          Install 👈
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </Card>
          </div>
        )}

        {/* Success Message */}
        <Card className="p-8 bg-gradient-to-br from-yellow-900 to-orange-900 border-yellow-700 text-center">
          <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-400" />
          <h2 className="text-3xl font-bold text-white mb-4">
            🎉 That's It! You're Done!
          </h2>
          <p className="text-yellow-100 text-lg mb-6">
            STOCRX will now appear on your home screen like a native app!
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className="p-4 bg-white/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
              <p className="font-bold text-white mb-1">Works Offline</p>
              <p className="text-sm text-yellow-200">Access features without internet</p>
            </div>
            <div className="p-4 bg-white/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
              <p className="font-bold text-white mb-1">Instant Access</p>
              <p className="text-sm text-yellow-200">Launch from home screen anytime</p>
            </div>
            <div className="p-4 bg-white/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
              <p className="font-bold text-white mb-1">No Updates Needed</p>
              <p className="text-sm text-yellow-200">Always get the latest version</p>
            </div>
            <div className="p-4 bg-white/10 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
              <p className="font-bold text-white mb-1">Push Notifications</p>
              <p className="text-sm text-yellow-200">Get important updates instantly</p>
            </div>
          </div>
        </Card>

        {/* Help Section */}
        <Card className="p-6 bg-gray-800 border-gray-700 mt-8">
          <h3 className="text-xl font-bold text-white mb-4">Need Help?</h3>
          <div className="space-y-3 text-gray-300">
            <p><strong className="text-white">Q: I don't see "Add to Home Screen"?</strong></p>
            <p className="text-sm">A: Make sure you're using Safari (iOS) or Chrome (Android). Other browsers may not support this feature.</p>
            
            <p className="mt-4"><strong className="text-white">Q: Can I remove it later?</strong></p>
            <p className="text-sm">A: Yes! Just long-press the icon on your home screen and select "Remove App" or "Delete".</p>
            
            <p className="mt-4"><strong className="text-white">Q: Will it use my phone storage?</strong></p>
            <p className="text-sm">A: Minimal storage! PWAs are much lighter than native apps.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}