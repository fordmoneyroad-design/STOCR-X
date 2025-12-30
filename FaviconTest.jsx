export default function FaviconTest() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* Main Content Card */}
      <div className="w-full max-w-2xl mx-auto p-6 md:p-8 bg-white shadow-xl rounded-2xl text-center border border-gray-100">
        
        {/* Logo and Title */}
        <div className="mb-8">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fedac268a06fe88d74977e/71a4bb750_FaviconSTOCRX.png"
            alt="STOCRX Favicon"
            className="w-32 h-32 mx-auto mb-4 rounded-2xl shadow-lg"
          />
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-800">
            STOCRX Favicon Test
          </h1>
          <p className="text-gray-500 mt-2">Subscription Ownership Platform</p>
        </div>

        {/* Success Message */}
        <div className="p-6 rounded-xl bg-green-50 border-2 border-green-200 mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <h2 className="text-2xl font-bold text-green-800">Favicon Active!</h2>
          </div>
          <p className="text-green-700">
            ✅ Check your browser tab to see the STOCRX stork logo
          </p>
        </div>

        {/* Instructions Section */}
        <div className="space-y-6 text-left">
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Where Your Favicon Appears:</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-800 text-sm">🌐 Browser Tab</p>
                <p className="text-xs text-blue-600">Shows in all tabs</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <p className="font-semibold text-purple-800 text-sm">📱 iOS Home Screen</p>
                <p className="text-xs text-purple-600">Add to home screen</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="font-semibold text-green-800 text-sm">🤖 Android App</p>
                <p className="text-xs text-green-600">PWA installation</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="font-semibold text-orange-800 text-sm">🔖 Bookmarks</p>
                <p className="text-xs text-orange-600">Saved favorites</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
            <h4 className="font-semibold text-indigo-800 mb-2">Implementation Details:</h4>
            <div className="space-y-2 text-sm text-indigo-700">
              <div className="flex items-start gap-2">
                <span className="font-mono bg-indigo-100 px-2 py-1 rounded text-xs">index.html</span>
                <span>Main favicon reference</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono bg-indigo-100 px-2 py-1 rounded text-xs">manifest.json</span>
                <span>PWA app icons (192px, 512px, 1024px)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-mono bg-indigo-100 px-2 py-1 rounded text-xs">meta tags</span>
                <span>Apple touch icon, theme color, social media</span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">💡 Pro Tips:</h4>
            <ul className="space-y-1 text-sm text-yellow-700">
              <li>• Hard refresh (Ctrl+Shift+R / Cmd+Shift+R) if favicon doesn't update</li>
              <li>• Clear browser cache for immediate changes</li>
              <li>• Favicon caches can take 24-48 hours to update globally</li>
              <li>• Check incognito/private mode for fresh view</li>
            </ul>
          </div>
        </div>

        {/* Visualization */}
        <div className="mt-8">
          <div className="relative">
            <div className="h-20 w-20 mx-auto bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full shadow-lg flex items-center justify-center">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68fedac268a06fe88d74977e/71a4bb750_FaviconSTOCRX.png"
                alt="STOCRX"
                className="w-16 h-16 rounded-full"
              />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Beautiful stork + car design representing STOCRX's mission
          </p>
          <p className="text-xs text-gray-500 italic mt-2">
            "Like storks delivering babies, we deliver your dream car"
          </p>
        </div>

        {/* Code Reference */}
        <div className="mt-8 text-left">
          <h4 className="font-semibold text-gray-700 mb-3">Favicon Code (index.html):</h4>
          <div className="p-4 bg-gray-900 rounded-lg overflow-x-auto">
            <code className="text-xs text-green-400 font-mono block whitespace-pre">
{`<link rel="icon" type="image/png"
  href="https://qtrypzzcjebvfcihiynt.supabase.co/
  storage/v1/object/public/base44-prod/public/
  68fedac268a06fe88d74977e/
  71a4bb750_FaviconSTOCRX.png" />
  
<link rel="apple-touch-icon"
  href="[same URL]" />
  
<link rel="manifest" href="/manifest.json" />`}
            </code>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-3 justify-center">
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
          >
            Back to Home
          </button>
          <button
            onClick={() => window.location.href = '/app/MobileAppPromo'}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
          >
            Install Mobile App
          </button>
        </div>
      </div>
    </div>
  );
}