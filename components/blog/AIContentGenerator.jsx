import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Wand2, Copy, RefreshCw, CheckCircle } from "lucide-react";

export default function AIContentGenerator({ onApplyContent }) {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [contentType, setContentType] = useState("blog_post");

  const quickPrompts = [
    "Write a blog post about the benefits of subscription-to-own car models",
    "Create a guide on how to maintain a used car",
    "Write about smart financing options for first-time car buyers",
    "Create a customer success story about someone who bought their dream car",
    "Write tips for choosing the right car for your lifestyle",
    "Create a post about seasonal car maintenance checklist",
    "Write about the advantages of our subscription model vs traditional buying",
    "Create a promotional post for our current deals"
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt!");
      return;
    }

    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional blog writer for STOCRX, a subscription-to-own car rental company.

Task: ${prompt}

Generate a complete blog post with the following structure:
1. Catchy, SEO-friendly title
2. Brief excerpt (1-2 sentences)
3. Full blog content (500-800 words, engaging and informative)
4. SEO meta description
5. 5-8 relevant tags
6. 3-5 SEO keywords

Format your response as JSON with these fields:
- title: string
- excerpt: string
- content: string (use paragraphs separated by \\n\\n)
- seo_title: string (optimized for search engines)
- seo_description: string (155 characters max)
- tags: array of strings
- seo_keywords: array of strings
- category: one of [company_news, car_tips, financing, how_to, customer_stories, industry_news, promotions]`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            excerpt: { type: "string" },
            content: { type: "string" },
            seo_title: { type: "string" },
            seo_description: { type: "string" },
            tags: { type: "array", items: { type: "string" } },
            seo_keywords: { type: "array", items: { type: "string" } },
            category: { type: "string" }
          }
        }
      });

      setGeneratedContent({
        ...response,
        ai_generated: true,
        ai_prompt: prompt
      });
    } catch (error) {
      console.error("AI generation error:", error);
      alert("❌ Failed to generate content. Try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedContent && onApplyContent) {
      onApplyContent(generatedContent);
      alert("✅ Content applied to editor!");
    }
  };

  const handleCopy = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent.content);
      alert("✅ Content copied to clipboard!");
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-900 to-indigo-900 border-purple-700 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <Sparkles className="w-8 h-8 text-yellow-400" />
        <h2 className="text-2xl font-bold text-white">AI Content Generator</h2>
        <Badge className="bg-yellow-500 text-black">UNLIMITED</Badge>
      </div>

      <Alert className="mb-6 bg-purple-800 border-purple-600">
        <Wand2 className="h-4 w-4 text-purple-300" />
        <AlertDescription className="text-purple-100">
          <strong>AI-Powered Magic:</strong> Generate unlimited blog posts, articles, and content with AI. 
          Perfect for SEO, social media, and marketing!
        </AlertDescription>
      </Alert>

      {/* Quick Prompts */}
      <div className="mb-6">
        <label className="text-white text-sm mb-2 block font-semibold">Quick Prompts:</label>
        <div className="grid grid-cols-2 gap-2">
          {quickPrompts.map((quickPrompt, idx) => (
            <Button
              key={idx}
              size="sm"
              onClick={() => setPrompt(quickPrompt)}
              className="bg-purple-700 hover:bg-purple-600 text-left justify-start h-auto py-2 text-xs"
            >
              {quickPrompt}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Prompt */}
      <div className="mb-4">
        <label className="text-white text-sm mb-2 block font-semibold">Custom Prompt:</label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to write about... Be specific for better results!"
          className="bg-purple-800 border-purple-600 text-white h-24"
        />
      </div>

      <div className="flex gap-3 mb-6">
        <Button
          onClick={handleGenerate}
          disabled={generating || !prompt.trim()}
          className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold"
        >
          {generating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Content
            </>
          )}
        </Button>
      </div>

      {/* Generated Content Preview */}
      {generatedContent && (
        <Card className="p-6 bg-white/10 backdrop-blur border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              Generated Content
            </h3>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCopy}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Apply to Editor
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-purple-300 text-xs font-semibold mb-1">Title:</p>
              <p className="text-white font-bold text-lg">{generatedContent.title}</p>
            </div>

            <div>
              <p className="text-purple-300 text-xs font-semibold mb-1">Excerpt:</p>
              <p className="text-white">{generatedContent.excerpt}</p>
            </div>

            <div>
              <p className="text-purple-300 text-xs font-semibold mb-1">Content Preview:</p>
              <div className="bg-black/30 p-4 rounded max-h-64 overflow-y-auto">
                <p className="text-white whitespace-pre-line">{generatedContent.content}</p>
              </div>
            </div>

            <div>
              <p className="text-purple-300 text-xs font-semibold mb-1">Category:</p>
              <Badge className="bg-purple-600">{generatedContent.category?.replace('_', ' ')}</Badge>
            </div>

            <div>
              <p className="text-purple-300 text-xs font-semibold mb-1">Tags:</p>
              <div className="flex flex-wrap gap-2">
                {generatedContent.tags?.map((tag, idx) => (
                  <Badge key={idx} className="bg-blue-600">{tag}</Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-purple-300 text-xs font-semibold mb-1">SEO Keywords:</p>
              <div className="flex flex-wrap gap-2">
                {generatedContent.seo_keywords?.map((keyword, idx) => (
                  <Badge key={idx} className="bg-green-600">{keyword}</Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-purple-300 text-xs font-semibold mb-1">SEO Meta Description:</p>
              <p className="text-white text-sm italic">{generatedContent.seo_description}</p>
            </div>
          </div>
        </Card>
      )}

      {/* AI Tips */}
      <Alert className="mt-6 bg-indigo-900 border-indigo-700">
        <Sparkles className="h-4 w-4 text-yellow-400" />
        <AlertDescription className="text-indigo-100">
          <strong>Pro Tips:</strong> Be specific in your prompts. Include target audience, tone (professional/casual), 
          and key points you want covered. The AI will generate SEO-optimized content automatically!
        </AlertDescription>
      </Alert>
    </Card>
  );
}